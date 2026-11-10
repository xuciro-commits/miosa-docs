<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { i18n, t, translateContent } from '#lib/i18n.svelte.js';
	let { data } = $props();
	let zhHtml = $state('');
	const html = $derived(i18n.locale === 'zh' ? zhHtml || data.html : data.html);
	let article = $state<HTMLElement>();
	// The server cannot know the reader's language, so its HTML is English. Once
	// hydration finishes this flips and the block is rebuilt with the active locale.
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
		zhHtml = data.htmlZh ?? '';
	});

	// Chinese is rendered on first use so an English reader never downloads it.
	let zhLoading = false;
	$effect(() => {
		if (i18n.locale !== 'zh' || zhHtml || zhLoading) return;
		zhLoading = true;
		Promise.all([import('#lib/content/catalog.js'), import('#lib/content/render.js')]).then(
			async ([catalog, render]) => {
				const markdown = await catalog.loadMarkdown(data.slug, 'zh');
				const meta = catalog.articleMeta.find((page) => page.slug === data.slug);
				zhHtml = render.renderDoc(
					data.slug,
					markdown ?? '',
					meta?.titleZh ?? data.titleZh ?? '',
					'zh'
				).html;
			}
		);
	});

	// Translate rendered text nodes with the content dictionary. Keeping the
	// source articles intact means there is one canonical copy of every page.
	$effect(() => {
		void data.Content;
		void data.html;
		void data.htmlZh;
		const locale = i18n.locale;
		const root = article;
		if (!root) return;
		let current = true;
		tick().then(() => {
			if (!current) return;
			void locale;
			translateContent(root);
			wireAccordion(root);
			enhanceCode(root);
			enhanceMermaid(root);
		});
		return () => {
			current = false;
		};
	});

	let highlightQueued = false;

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

<div class="article-content" bind:this={article} data-ready={hydrated}>
	{#key hydrated}
		{@html html}
	{/key}
</div>
