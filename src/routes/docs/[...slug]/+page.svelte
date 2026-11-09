<script lang="ts">
	import { tick } from 'svelte';
	import { i18n, translateContent } from '#lib/i18n.svelte.js';
	let { data } = $props();
	const Content = $derived(data.Content);
	let article = $state<HTMLElement>();

	// Translate rendered SVX text nodes with the content dictionary. Keeping the
	// source articles intact means there is one canonical copy of every page.
	$effect(() => {
		const content = data.Content;
		const locale = i18n.locale;
		const root = article;
		if (!root) return;
		let current = true;
		tick().then(() => {
			if (!current) return;
			void content;
			void locale;
			translateContent(root);
		});
		return () => {
			current = false;
		};
	});
</script>

<div class="article-content" bind:this={article}><Content /></div>
