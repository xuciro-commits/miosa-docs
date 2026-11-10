<script lang="ts">
	import { tick } from 'svelte';
	import { i18n, translateContent } from '#lib/i18n.svelte.js';
	let { data } = $props();
	const Content = $derived(data.Content);
	const html = $derived(i18n.locale === 'zh' ? data.htmlZh : data.html);
	let article = $state<HTMLElement>();

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
		});
		return () => {
			current = false;
		};
	});

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

<div class="article-content" bind:this={article}>
	{#if html}
		{@html html}
	{:else if Content}
		<Content />
	{/if}
</div>
