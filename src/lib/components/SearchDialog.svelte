<script lang="ts">
	import { Dialog } from 'bits-ui';
	import {
		Search,
		X,
		ArrowUp,
		ArrowDown,
		CornerDownLeft,
		FileText,
		MessageCircle,
		Command
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { preferences, ask } from '#lib/preferences.svelte.js';
	import { searchDocuments } from '#lib/search.js';
	import type { SearchEntry } from '#lib/content/catalog.js';
	let query = $state('');
	let section = $state('All');
	let index = $state<SearchEntry[]>([]);
	let loading = $state(false);
	let failed = $state(false);
	let selected = $state(0);
	let input: HTMLInputElement;
	const results = $derived(searchDocuments(index, query, section));
	const sections = ['All', 'Get started', 'Learn', 'API reference', 'CLI, SDKs & MCP', 'Build'];
	$effect(() => {
		if (preferences.searchOpen) {
			requestAnimationFrame(() => input?.focus());
			if (!index.length && !loading && !failed) {
				loading = true;
				failed = false;
				fetch('/docs-search.json')
					.then((response) => {
						if (!response.ok) throw new Error('Search unavailable');
						return response.json();
					})
					.then((data) => (index = data))
					.catch(() => (failed = true))
					.finally(() => (loading = false));
			}
		}
	});
	$effect(() => {
		query;
		section;
		selected = 0;
	});
	function open(href: string) {
		preferences.searchOpen = false;
		query = '';
		goto(href);
	}
	function keyboard(event: KeyboardEvent) {
		if (['Home', 'End', 'PageUp', 'PageDown'].includes(event.key) && results.length) {
			event.preventDefault();
			selected =
				event.key === 'Home'
					? 0
					: event.key === 'End'
						? results.length - 1
						: Math.max(
								0,
								Math.min(results.length - 1, selected + (event.key === 'PageDown' ? 6 : -6))
							);
			document.getElementById(`search-result-${selected}`)?.scrollIntoView({ block: 'nearest' });
			return;
		}
		if (event.key === 'Tab' && event.target === input) {
			event.preventDefault();
			section =
				sections[
					(sections.indexOf(section) + (event.shiftKey ? -1 : 1) + sections.length) %
						sections.length
				];
			return;
		}
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			selected =
				(selected + (event.key === 'ArrowDown' ? 1 : -1) + results.length) %
				Math.max(1, results.length);
			document.getElementById(`search-result-${selected}`)?.scrollIntoView({ block: 'nearest' });
		} else if (event.key === 'Enter' && results[selected]) {
			event.preventDefault();
			if (event.metaKey || event.ctrlKey) window.open(results[selected].href, '_blank', 'noopener');
			else open(results[selected].href);
		}
	}
</script>

<svelte:window
	onkeydown={(event) => {
		const target = event.target as HTMLElement;
		const editing = target.matches('input,textarea,[contenteditable="true"]');
		if (
			((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') ||
			(event.key === '/' && !editing && !preferences.askOpen)
		) {
			event.preventDefault();
			preferences.searchOpen = !preferences.searchOpen;
		}
	}}
/>
<Dialog.Root bind:open={preferences.searchOpen}
	><Dialog.Portal
		><Dialog.Overlay class="search-overlay" /><Dialog.Content
			class="search-dialog"
			onEscapeKeydown={(event) => {
				if (query) {
					event.preventDefault();
					query = '';
				}
			}}
			onkeydown={keyboard}
			><Dialog.Title class="sr-only">Search documentation</Dialog.Title><Dialog.Description
				class="sr-only"
				>Search pages, examples and learning guides. Use the arrow keys to choose a result.</Dialog.Description
			>
			<div class="search-input-row">
				<Search size={20} /><input
					bind:this={input}
					bind:value={query}
					placeholder="Search docs or ask a question…"
					aria-label="Search documentation"
					autocomplete="off"
				/><Dialog.Close class="search-escape" aria-label="Close search"><kbd>esc</kbd></Dialog.Close
				>
			</div>
			<div class="search-sections">
				{#each sections as item}<button
						class:active={section === item}
						onclick={() => (section = item)}
						>{item === 'Get started'
							? 'Docs'
							: item === 'CLI, SDKs & MCP'
								? 'CLI & SDKs'
								: item}</button
					>{/each}
			</div>
			<div class="search-results">
				{#if query}<button class="ask-search" onclick={() => ask(query)}
						><MessageCircle size={16} /><span>Ask OSA <b>“{query}”</b></span><CornerDownLeft
							size={13}
						/></button
					>{/if}
				<div class="result-label">{query ? 'Matching pages' : 'Explore the documentation'}</div>
				{#if loading}<p class="search-empty">Loading the documentation index…</p>{:else if failed}<p
						class="search-empty"
					>
						Search could not load. <button class="retry-search" onclick={() => (failed = false)}
							>Try again</button
						>
					</p>{:else if !results.length}<div class="search-empty">
						<Search size={25} />
						<p>No pages match “{query}”.</p>
						<small>Try a shorter term or a different category.</small>
					</div>{:else}{#each results as result, i}<button
							id={`search-result-${i}`}
							class="search-result"
							class:selected={selected === i}
							onpointermove={() => (selected = i)}
							onclick={() => open(result.href)}
							><FileText size={16} /><span
								><small>{result.section}</small><strong>{result.title}</strong>
								<p>{result.description}</p></span
							><CornerDownLeft size={13} /></button
						>{/each}{/if}
			</div>
			<div class="search-footer">
				<span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span
					><kbd>esc</kbd> close</span
				><span class="search-count">{index.length} pages</span>
			</div></Dialog.Content
		></Dialog.Portal
	></Dialog.Root
>

<style>
	:global(.search-overlay) {
		position: fixed;
		inset: 0;
		z-index: 70;
		background: #11111350;
		backdrop-filter: blur(5px);
	}
	:global(.search-dialog) {
		position: fixed;
		z-index: 71;
		top: min(15vh, 140px);
		left: 50%;
		transform: translateX(-50%);
		width: min(650px, calc(100vw - 30px));
		max-height: 75vh;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: 16px;
		background: var(--surface);
		box-shadow: 0 25px 80px #0003;
		overflow: hidden;
	}
	.search-input-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 19px 20px 15px;
		color: var(--muted);
	}
	.search-input-row input {
		flex: 1;
		min-width: 0;
		outline: none;
		border: 0;
		background: none;
		font-size: 16px;
	}
	.search-input-row input::placeholder {
		color: var(--muted);
	}
	:global(.search-escape) {
		padding: 0;
	}
	.search-sections {
		scrollbar-width: none;
		display: flex;
		gap: 5px;
		overflow: auto;
		padding: 0 17px 13px;
		border-bottom: 1px solid var(--border);
	}
	.search-sections button {
		font-size: 11px;
		padding: 5px 10px;
		border-radius: 7px;
		white-space: nowrap;
		color: var(--muted);
	}
	.search-sections button.active {
		background: var(--hover);
		color: var(--text);
	}
	.search-results {
		scrollbar-width: thin;
		scrollbar-color: var(--dbd) transparent;
		overflow: auto;
		padding: 8px;
		min-height: 180px;
	}
	.result-label {
		font-size: 10px;
		color: var(--muted);
		padding: 10px 11px 7px;
	}
	.search-result {
		display: flex;
		align-items: center;
		gap: 12px;
		text-align: left;
		width: 100%;
		padding: 11px 13px;
		border-radius: 9px;
		color: var(--muted);
	}
	.search-result.selected {
		background: var(--hover);
	}
	.search-result > span {
		flex: 1;
		min-width: 0;
	}
	.search-result small {
		font-size: 9px;
		display: block;
		margin-bottom: 2px;
	}
	.search-result strong {
		font-size: 13px;
		color: var(--text);
		font-weight: 550;
	}
	.search-result p {
		font-size: 11px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin: 3px 0 0;
	}
	.ask-search {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 12px;
		border-bottom: 1px solid var(--border);
		font-size: 12px;
		text-align: left;
	}
	.ask-search span {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ask-search b {
		font-weight: 500;
	}
	.search-empty {
		text-align: center;
		font-size: 13px;
		padding: 35px 15px;
		color: var(--muted);
	}
	.search-empty > :global(svg) {
		margin-bottom: 10px;
	}
	.search-empty p {
		margin: 0 0 5px;
	}
	.search-footer {
		display: flex;
		gap: 15px;
		border-top: 1px solid var(--border);
		padding: 10px 17px;
		color: var(--muted);
		font-size: 10px;
	}
	.search-footer span {
		display: flex;
		align-items: center;
		gap: 3px;
	}
	.search-count {
		margin-left: auto;
	}
	@media (max-width: 600px) {
		:global(.search-dialog) {
			top: 70px;
			max-height: 80vh;
		}
		.search-input-row input {
			font-size: 14px;
		}
		.search-footer {
			gap: 9px;
		}
	}
</style>
