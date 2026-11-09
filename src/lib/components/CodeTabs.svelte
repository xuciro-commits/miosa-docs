<script lang="ts">
	import { copyText } from '#lib/clipboard.js';
	import { preferences, notify } from '#lib/preferences.svelte.js';
	import { Copy, Check } from '@lucide/svelte';
	let {
		examples,
		filename = '',
		sync = true
	}: { examples: Record<string, string>; filename?: string; sync?: boolean } = $props();
	let localLanguage = $state('');
	const languages = $derived(Object.keys(examples));
	const selected = $derived(
		languages.includes(sync ? preferences.language : localLanguage)
			? sync
				? preferences.language
				: localLanguage
			: languages[0]
	);
	const source = $derived(examples[selected]);
	let html = $state('');
	let copied = $state(false);
	$effect(() => {
		const code = source;
		const language = selected.toLowerCase() === 'shell' ? 'bash' : selected.toLowerCase();
		let current = true;
		import('#lib/highlight.js')
			.then(({ highlight }) => highlight(code, language))
			.then((result) => {
				if (current) html = result;
			})
			.catch(() => {
				if (current) html = '';
			});
		return () => {
			current = false;
		};
	});
	async function copy() {
		copied = await copyText(source);
		if (!copied) notify('Clipboard unavailable. Select the code to copy it manually.');
		setTimeout(() => (copied = false), 1600);
	}
</script>

<div class="code-block">
	<div class="code-bar">
		<div class="code-tabs" role="tablist" aria-label={filename || 'Example language'}>
			{#each languages as language}<button
					role="tab"
					aria-selected={language === selected}
					class:active={language === selected}
					onclick={() => {
						if (sync) preferences.language = language;
						else localLanguage = language;
					}}>{language}</button
				>{/each}
		</div>
		<button class="icon-button" aria-label="Copy code" onclick={copy}
			>{#if copied}<Check size={14} />{:else}<Copy size={14} />{/if}</button
		>
	</div>
	{#if filename}<div class="filename">{filename}</div>{/if}
	<div class="code-body" role="tabpanel" aria-label={`${selected} example`}>
		{#if html}{@html html}{:else}<pre><code>{source}</code></pre>{/if}
	</div>
</div>

<style>
	.code-block {
		border: 1px solid var(--border);
		border-radius: 11px;
		overflow: hidden;
		margin: 22px 0;
		background: var(--surface-2);
	}
	.code-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		padding: 4px 7px 0 10px;
		min-height: 39px;
	}
	.code-tabs {
		scrollbar-width: none;
		display: flex;
		align-self: stretch;
		gap: 16px;
		overflow: auto;
	}
	.code-tabs button {
		font-size: 11px;
		white-space: nowrap;
		color: var(--muted);
		padding: 5px 0 9px;
		border-bottom: 2px solid transparent;
	}
	.code-tabs button.active {
		color: var(--text);
		border-color: var(--text);
		font-weight: 550;
	}
	.code-bar .icon-button {
		margin-bottom: 3px;
	}
	.filename {
		padding: 9px 18px 0;
		font-size: 10px;
		color: var(--muted);
		font-family: 'Geist Mono', monospace;
	}
	.code-body {
		overflow: auto;
	}
	.code-body :global(pre) {
		margin: 0 !important;
		border: 0 !important;
		border-radius: 0 !important;
		padding: 17px 19px !important;
		line-height: 1.9 !important;
		font-size: 12px !important;
		background: transparent !important;
	}
	.code-body :global(code) {
		font-size: inherit;
	}
	.code-body :global(.shiki) {
		overflow: visible;
	}
</style>
