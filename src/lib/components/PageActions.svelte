<script lang="ts">
	import { copyText } from '#lib/clipboard.js';
	import { page } from '$app/state';
	import { Copy, Check, ChevronDown, FileText, MessageCircle, ExternalLink } from '@lucide/svelte';
	import { ask, notify } from '#lib/preferences.svelte.js';
	let copied = $state(false);
	let menu: HTMLDetailsElement;
	const markdownUrl = $derived(
		page.url.pathname.replace(/\/$/, '') + (page.url.pathname === '/docs' ? '/index' : '') + '.md'
	);
	async function copy() {
		const response = await fetch(markdownUrl, { headers: { Accept: 'text/markdown' } }).catch(
			() => null
		);
		if (!response?.ok) {
			notify('Could not copy this page. Try again.');
			return;
		}
		copied = await copyText(await response.text());
		if (!copied) {
			notify('Clipboard unavailable. Open View Markdown to copy manually.');
			return;
		}
		notify('Page copied as Markdown');
		setTimeout(() => (copied = false), 1800);
	}
</script>

<div class="page-actions">
	<button class="copy-button" onclick={copy}
		>{#if copied}<Check size={13} />{:else}<Copy size={13} />{/if}<span
			>{copied ? 'Copied' : 'Copy page'}</span
		></button
	>
	<details bind:this={menu}>
		<summary aria-label="More page actions"><ChevronDown size={13} /></summary>
		<div class="actions-menu">
			<button
				onclick={() => {
					copy();
					menu.open = false;
				}}><Copy size={14} />Copy as Markdown</button
			><a href={markdownUrl} data-sveltekit-reload target="_blank"
				><FileText size={14} />View Markdown<ExternalLink size={11} /></a
			><button
				onclick={() => {
					ask(`Explain this page: ${page.url.pathname}`);
					menu.open = false;
				}}><MessageCircle size={14} />Ask about this page</button
			>
		</div>
	</details>
</div>

<style>
	.page-actions {
		display: flex;
		align-items: center;
		height: 31px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		position: relative;
		flex: none;
		font-size: 11px;
	}
	.copy-button {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 100%;
		padding: 0 10px;
		color: var(--muted);
	}
	.copy-button:hover {
		color: var(--text);
	}
	details {
		height: 100%;
		border-left: 1px solid var(--border);
	}
	summary {
		list-style: none;
		display: flex;
		align-items: center;
		height: 100%;
		padding: 0 7px;
		cursor: pointer;
		color: var(--muted);
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.actions-menu {
		position: absolute;
		right: 0;
		top: 38px;
		z-index: 20;
		width: 195px;
		background: var(--surface);
		border: 1px solid var(--border);
		padding: 5px;
		border-radius: 10px;
		box-shadow: 0 10px 30px #0002;
	}
	.actions-menu > button,
	.actions-menu > a {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px;
		border-radius: 6px;
		text-align: left;
		color: var(--muted);
		font-size: 11px;
	}
	.actions-menu > button:hover,
	.actions-menu > a:hover {
		background: var(--hover);
		color: var(--text);
	}
	@media (max-width: 500px) {
		.copy-button span {
			display: none;
		}
		.copy-button {
			padding: 0 7px;
		}
	}
</style>
