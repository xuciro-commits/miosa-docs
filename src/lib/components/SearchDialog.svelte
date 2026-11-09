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
	import { t } from '#lib/i18n.svelte.js';
	import { searchDocuments } from '#lib/search.js';
	import { searchIndex, type SearchEntry } from '#lib/content/catalog.js';
	import products from '#lib/content/products.json';
	let query = $state('');
	let section = $state('All');
	let index = $state<SearchEntry[]>(searchIndex);
	let loading = $state(false);
	let failed = $state(false);
	let selected = $state(0);
	let input: HTMLInputElement;
	const results = $derived(searchDocuments(index, query, section));
	const sections = [
		{ id: 'All', key: 'docs.search.section.all' },
		{ id: 'Get started', key: 'docs.search.section.getStarted' },
		{ id: 'Learn', key: 'docs.search.section.learn' },
		{ id: 'API reference', key: 'docs.search.section.api' },
		{ id: 'CLI, SDKs & MCP', key: 'docs.search.section.cli' },
		{ id: 'Build', key: 'docs.search.section.build' }
	];
	const sectionIds = sections.map((item) => item.id);
	const docSectionKeys: Record<string, string> = {
		'Get started': 'docs.search.section.getStarted',
		Learn: 'docs.search.section.learn',
		'API reference': 'docs.search.section.api',
		'CLI, SDKs & MCP': 'docs.search.section.cli',
		Build: 'docs.search.section.build'
	};
	function sectionLabel(value: string): string {
		const key = docSectionKeys[value];
		return key ? t(key) : value;
	}
	function productFor(slug: string) {
		return products.find((product) => product.href === `/docs/${slug}`);
	}
	function productName(product: (typeof products)[number]): string {
		const key = `docs.productShowcase.product.${product.id}.name`;
		const translated = t(key);
		return translated === key ? product.name : translated;
	}
	function resultTitle(slug: string, fallback: string): string {
		if (slug.startsWith('build/')) {
			const product = productFor(slug);
			const prefix = fallback.startsWith('Run ')
				? t('docs.page.build.runPrefix')
				: t('docs.page.build.ownPrefix');
			return `${prefix}${product ? productName(product) : fallback.replace(/^(Run |Build your own )/, '')}`;
		}
		const key = `docs.page.${slug.replaceAll('/', '.')}.title`;
		const translated = t(key);
		return translated === key ? fallback : translated;
	}
	function resultDescription(slug: string, fallback: string): string {
		if (slug.startsWith('build/')) {
			const product = productFor(slug);
			if (product) {
				const productKey = `docs.productShowcase.product.${product.id}.blurb`;
				const translatedBlurb = t(productKey);
				if (translatedBlurb !== productKey) return translatedBlurb;
			}
		}
		const key = `docs.page.${slug.replaceAll('/', '.')}.description`;
		const translated = t(key);
		return translated === key ? fallback : translated;
	}
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
				sectionIds[
					(sectionIds.indexOf(section) + (event.shiftKey ? -1 : 1) + sectionIds.length) %
						sectionIds.length
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
			><Dialog.Title class="sr-only">{t('docs.search.title')}</Dialog.Title><Dialog.Description
				class="sr-only">{t('docs.search.description')}</Dialog.Description
			>
			<div class="search-input-row">
				<Search size={20} /><input
					bind:this={input}
					bind:value={query}
					placeholder={t('docs.search.placeholder')}
					aria-label={t('docs.search.inputAria')}
					autocomplete="off"
				/><Dialog.Close class="search-escape" aria-label={t('docs.search.close')}
					><kbd>esc</kbd></Dialog.Close
				>
			</div>
			<div class="search-sections">
				{#each sections as item}<button
						class:active={section === item.id}
						onclick={() => (section = item.id)}>{t(item.key)}</button
					>{/each}
			</div>
			<div class="search-results">
				{#if query}<button class="ask-search" onclick={() => ask(query)}
						><MessageCircle size={16} /><span>{t('docs.search.askPrefix')} <b>“{query}”</b></span
						><CornerDownLeft size={13} /></button
					>{/if}
				<div class="result-label">
					{query ? t('docs.search.matching') : t('docs.search.explore')}
				</div>
				{#if loading}<p class="search-empty">{t('docs.search.loading')}</p>{:else if failed}<p
						class="search-empty"
					>
						{t('docs.search.error')}
						<button class="retry-search" onclick={() => (failed = false)}
							>{t('docs.search.tryAgain')}</button
						>
					</p>{:else if !results.length}<div class="search-empty">
						<Search size={25} />
						<p>{t('docs.search.noMatch', { query })}</p>
						<small>{t('docs.search.tryShorter')}</small>
					</div>{:else}{#each results as result, i}<button
							id={`search-result-${i}`}
							class="search-result"
							class:selected={selected === i}
							onpointermove={() => (selected = i)}
							onclick={() => open(result.href)}
							><FileText size={16} /><span
								><small>{sectionLabel(result.section)}</small><strong
									>{resultTitle(result.slug, result.title)}</strong
								>
								<p>{resultDescription(result.slug, result.description)}</p></span
							><CornerDownLeft size={13} /></button
						>{/each}{/if}
			</div>
			<div class="search-footer">
				<span><kbd>↑</kbd><kbd>↓</kbd> {t('docs.search.navigate')}</span><span
					><kbd>↵</kbd> {t('docs.search.open')}</span
				><span><kbd>esc</kbd> {t('docs.search.closeKey')}</span><span class="search-count"
					>{t('docs.search.pages', { count: index.length })}</span
				>
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
