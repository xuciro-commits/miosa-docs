<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { i18n, t, translateContent } from '#lib/i18n.svelte.js';

	let { data } = $props();

	let article = $state<HTMLElement>();
	let html = $state('');
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let rendered = $state('');
	let hydrated = $state(false);

	/**
	 * Markdown is fetched when a page is opened, and again only if the reader
	 * switches language. The loader itself resolves metadata only, so preloading
	 * a link never downloads a page.
	 */
	async function renderPage() {
		const locale: 'en' | 'zh' = i18n.locale === 'zh' ? 'zh' : 'en';
		const key = `${locale}:${data.slug}`;
		if (rendered === key) return;
		status = 'loading';
		try {
			const [catalog, render] = await Promise.all([
				import('#lib/content/catalog.js'),
				import('#lib/content/render.js')
			]);
			const markdown = await catalog.loadMarkdown(data.slug, locale);
			if (!markdown) {
				status = 'error';
				return;
			}
			const meta = catalog.articleMeta.find((page) => page.slug === data.slug);
			html = render.renderDoc(
				data.slug,
				markdown,
				locale === 'zh' ? (meta?.titleZh ?? data.titleZh ?? '') : (meta?.title ?? data.title ?? ''),
				locale,
				{ layout: meta?.layout }
			).html;
			rendered = key;
			status = 'ready';
		} catch {
			status = 'error';
		}
	}

	onMount(() => {
		hydrated = true;
		void renderPage();
	});

	$effect(() => {
		if (!hydrated) return;
		void i18n.locale;
		void data.slug;
		void renderPage();
	});

	// Translate rendered text nodes with the content dictionary. Keeping the
	// source articles intact means there is one canonical copy of every page.
	$effect(() => {
		void html;
		const locale = i18n.locale;
		const root = article;
		if (!root) return;
		let current = true;
		tick().then(() => {
			if (!current) return;
			void locale;
			translateContent(root);
			wireAccordion(root);
			wireTabs(root);
			wireCopy(root);
			wireCollection(root);
			enhanceCode(root);
			enhanceMermaid(root);
		});
		return () => {
			current = false;
		};
	});

	let highlightQueued = false;

	/** Collection layout: pills pick a group, the search filters items, all opens at once. */
	function wireCollection(root: HTMLElement) {
		for (const box of root.querySelectorAll<HTMLElement>('.collection:not([data-wired])')) {
			box.dataset.wired = 'true';
			const pills = [...box.querySelectorAll<HTMLButtonElement>('.collection-pill')];
			const panels = [...box.querySelectorAll<HTMLElement>('.collection-group')];
			const items = [...box.querySelectorAll<HTMLDetailsElement>('.collection-item')];
			const search = box.querySelector<HTMLInputElement>('.collection-search input');
			const toggle = box.querySelector<HTMLButtonElement>('.collection-toggle-all');

			const activate = (index: number) => {
				pills.forEach((pill, position) => pill.classList.toggle('is-active', position === index));
				panels.forEach((panel, position) => panel.classList.toggle('is-active', position === index));
			};
			pills.forEach((pill, index) => pill.addEventListener('click', () => activate(index)));

			search?.addEventListener('input', () => {
				const needle = search.value.trim().toLowerCase();
				let firstHit = -1;
				panels.forEach((panel, index) => {
					let visible = 0;
					for (const item of panel.querySelectorAll<HTMLDetailsElement>('.collection-item')) {
						const hit = !needle || item.textContent?.toLowerCase().includes(needle);
						item.hidden = !hit;
						if (hit) visible += 1;
					}
					if (visible && firstHit === -1) firstHit = index;
				});
				if (firstHit !== -1) activate(firstHit);
			});

			toggle?.addEventListener('click', () => {
				const closed = items.filter((item) => !item.open).length;
				const openAll = closed > 0;
				for (const item of items) item.open = openAll;
				toggle.textContent = openAll ? (toggle.dataset.collapse ?? '') : (toggle.dataset.expandLabel ?? '');
				if (!openAll) toggle.textContent = toggle.dataset.expandLabel ?? 'Expand all';
			});
			if (toggle && !toggle.dataset.expandLabel)
				toggle.dataset.expandLabel = toggle.textContent ?? '';
		}
	}

	/** Tabbed code groups: one panel visible at a time. */
	function wireTabs(root: HTMLElement) {
		for (const group of root.querySelectorAll<HTMLElement>('.docs-tabs:not([data-wired])')) {
			group.dataset.wired = 'true';
			const tabs = [...group.querySelectorAll<HTMLElement>('.docs-tabs__tab')];
			const panels = [...group.querySelectorAll<HTMLElement>('.docs-tab-panel')];
			tabs.forEach((tab, index) => {
				tab.addEventListener('click', () => {
					tabs.forEach((item, position) => {
						item.classList.toggle('is-active', position === index);
						item.setAttribute('aria-selected', String(position === index));
					});
					panels.forEach((panel, position) =>
						panel.classList.toggle('is-active', position === index)
					);
					enhanceCode(root);
				});
			});
		}
	}

	/** Copy buttons in code headers. */
	function wireCopy(root: HTMLElement) {
		for (const button of root.querySelectorAll<HTMLButtonElement>('.doc-code-copy:not([data-wired])')) {
			button.dataset.wired = 'true';
			button.addEventListener('click', async () => {
				const frame = button.closest('.doc-code-frame');
				const text = frame?.querySelector('pre code')?.textContent ?? '';
				try {
					await navigator.clipboard.writeText(text);
					button.classList.add('is-copied');
					setTimeout(() => button.classList.remove('is-copied'), 1400);
				} catch {
					// clipboard unavailable: leave the button unchanged
				}
			});
		}
	}

	/** Highlight every fenced code block once, lazily loading Shiki. */
	function enhanceCode(root: HTMLElement) {
		const frames = [...root.querySelectorAll<HTMLElement>('.doc-code-frame')].filter(
			(frame) => !frame.dataset.highlighted
		);
		if (!frames.length || highlightQueued) return;
		highlightQueued = true;
		const onIdle = (callback: () => void) =>
			'requestIdleCallback' in window
				? (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
						callback
					)
				: setTimeout(callback, 0);
		onIdle(() => {
			import('#lib/highlight.js').then(async ({ highlight, normalizeLang }) => {
				for (const frame of frames) {
					if (frame.dataset.highlighted) continue;
					const code = frame.querySelector('pre code');
					if (!code) continue;
					const language = normalizeLang(frame.dataset.lang ?? 'text');
					if (language === 'text') {
						frame.dataset.highlighted = 'true';
						continue;
					}
					try {
						const html = await highlight(code.textContent ?? '', language);
						if (html) frame.querySelector('pre')!.outerHTML = html;
						frame.dataset.highlighted = 'true';
						frame.classList.add('is-highlighted');
					} catch {
						frame.dataset.highlighted = 'true';
					}
				}
				highlightQueued = false;
			});
		});
	}

	/** Render fenced Mermaid diagrams into SVG, keeping the source on failure. */
	function enhanceMermaid(root: HTMLElement) {
		const blocks = [...root.querySelectorAll<HTMLElement>('.docs-mermaid')].filter(
			(block) => !block.dataset.rendered
		);
		if (!blocks.length) return;
		import('mermaid')
			.then(async ({ default: mermaid }) => {
				const dark =
					document.documentElement.dataset.theme === 'dark' ||
					document.documentElement.dataset.theme === 'glass-dark';
				mermaid.initialize({
					startOnLoad: false,
					theme: dark ? 'dark' : 'default',
					securityLevel: 'loose',
					fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
				});
				for (const block of blocks) {
					if (block.dataset.rendered) continue;
					const decoded = atob(block.dataset.graph ?? '');
					const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
					const source = new TextDecoder().decode(bytes);
					try {
						const { svg } = await mermaid.render(`mermaid-${crypto.randomUUID()}`, source);
						block.innerHTML = `<div class="docs-mermaid-part">${svg}</div><button type="button" class="docs-mermaid-zoom" aria-label="${t('docs.article.zoomDiagram')}">${t('docs.article.zoom')}</button>`;
						block.dataset.rendered = 'true';
						const zoom = block.querySelector<HTMLButtonElement>('.docs-mermaid-zoom');
						zoom?.addEventListener('click', () => {
							const dialog = document.createElement('div');
							dialog.className = 'docs-mermaid-dialog';
							dialog.innerHTML = `<div class="docs-mermaid-dialog__body">${svg}</div>`;
							dialog.addEventListener('click', () => dialog.remove());
							document.body.appendChild(dialog);
						});
					} catch (error) {
						block.classList.add('is-broken');
						block.dataset.rendered = 'true';
						block.textContent = source;
					}
				}
			})
			.catch(() => {});
	}

	/** FAQ topic pages render an accordion from Markdown; wire it up after hydration. */
	function wireAccordion(root: HTMLElement) {
		const acc = root.querySelector<HTMLElement>('.acc');
		if (!acc || acc.dataset.wired === 'true') return;
		acc.dataset.wired = 'true';

		const setOpen = (item: HTMLElement, open: boolean) => {
			const trigger = item.querySelector<HTMLElement>('.acc-trigger');
			const panel = item.querySelector<HTMLElement>('.acc-panel');
			if (!trigger || !panel) return;
			trigger.setAttribute('aria-expanded', String(open));
			item.classList.toggle('open', open);
			if (open) panel.removeAttribute('inert');
			else panel.setAttribute('inert', '');
		};

		acc.addEventListener('click', async (event) => {
			const target = event.target as HTMLElement;
			const trigger = target.closest<HTMLElement>('.acc-trigger');
			if (trigger) {
				const item = trigger.closest<HTMLElement>('.acc-item');
				if (item) setOpen(item, trigger.getAttribute('aria-expanded') !== 'true');
				return;
			}
			const anchor = target.closest<HTMLElement>('.acc-anchor');
			if (anchor) {
				const hash = anchor.dataset.hash;
				if (!hash) return;
				const url = `${location.origin}${location.pathname}#${hash}`;
				history.replaceState(null, '', `#${hash}`);
				try {
					await navigator.clipboard.writeText(url);
					anchor.classList.add('copied');
					setTimeout(() => anchor.classList.remove('copied'), 1400);
				} catch {}
				return;
			}
			const barButton = target.closest<HTMLElement>('.acc-bar__btn');
			if (barButton) {
				const open = barButton.dataset.acc === 'expand';
				acc.querySelectorAll<HTMLElement>('.acc-item').forEach((item) => setOpen(item, open));
			}
		});

		const hash = decodeURIComponent(location.hash.replace(/^#/, ''));
		if (hash) {
			const target = acc.querySelector<HTMLElement>(`#${CSS.escape(hash)}`);
			if (target) {
				setOpen(target, true);
				target.scrollIntoView({ block: 'center' });
			}
		}
	}
</script>

<div class="article-content" bind:this={article} data-ready={status === 'ready'} aria-busy={status === 'loading'}>
	{#if status === 'ready'}
		{@html html}
	{:else if status === 'error'}
		<p class="article-error">{t('docs.article.loadFailed')}</p>
	{:else}
		<div class="article-skeleton" aria-hidden="true">
			<span class="article-skeleton__title"></span>
			<span></span><span></span><span class="short"></span>
		</div>
	{/if}
</div>
