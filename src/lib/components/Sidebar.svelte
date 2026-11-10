<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		Search,
		ChevronRight,
		ChevronDown,
		PanelLeftClose,
		X,
		CircleDollarSign,
		Check
	} from '@lucide/svelte';
	import { navigation } from '#lib/content/navigation.js';
	import type { NavNode } from '#lib/content/generated-navigation.js';
	import { navLabelsZh } from '#lib/i18n/nav-labels-zh.js';
	import { navSlugZh } from '#lib/i18n/nav-slug-zh.js';
	import { preferences } from '#lib/preferences.svelte.js';
	import { progress } from '#lib/learning.svelte.js';
	import { i18n, t } from '#lib/i18n.svelte.js';
	import Icon from './Icon.svelte';

	const groupKeys: Record<string, string> = {
		'Get started': 'docs.nav.group.getStarted',
		Learn: 'docs.nav.group.learn',
		'Services & projects': 'docs.nav.group.servicesProjects',
		Sandboxes: 'docs.nav.group.sandboxes',
		Computers: 'docs.nav.group.computers',
		'Databases & storage': 'docs.nav.group.databasesStorage',
		'Networking & domains': 'docs.nav.group.networkingDomains',
		Agents: 'docs.nav.group.agents',
		Optimal: 'docs.nav.group.optimal',
		'Optimal Engine': 'docs.nav.group.optimalEngine',
		'Platform builders': 'docs.nav.group.platformBuilders',
		Build: 'docs.nav.group.build',
		'CLI, SDKs & MCP': 'docs.nav.group.cliSdksMcp',
		'API reference': 'docs.nav.group.apiReference',
		'Organization & billing': 'docs.nav.group.organizationBilling',
		'Security & compliance': 'docs.nav.group.securityCompliance',
		'Self-hosting': 'docs.nav.group.selfHosting',
		Compare: 'docs.nav.group.compare',
		Reference: 'docs.nav.group.reference',
		Help: 'docs.nav.group.help'
	};

	function groupLabel(title: string, titleZh?: string): string {
		if (i18n.locale === 'zh' && titleZh) return titleZh;
		const key = groupKeys[title];
		return key ? t(key) : title;
	}
	function navKey(slug: string): string {
		return `docs.nav.${slug ? slug.replaceAll('/', '.') : 'introduction'}`;
	}
	function navLabel(slug: string, fallback: string): string {
		if (i18n.locale === 'en') return fallback;
		const translated = t(navKey(slug));
		return translated === navKey(slug) ? fallback : translated;
	}
	function itemLabel(item: { slug?: string; title: string; titleZh?: string }): string {
		if (i18n.locale === 'zh') {
			if (item.titleZh) return item.titleZh;
			const translated = item.slug ? navSlugZh[item.slug] : undefined;
			if (translated) return translated;
			const structural = navLabelsZh[item.title];
			if (structural) return structural;
		}
		return item.slug ? navLabel(item.slug, item.title) : item.title;
	}
	function containsSlug(item: NavNode, slug: string): boolean {
		if (item.slug === slug) return true;
		return !!item.children?.some((child) => containsSlug(child, slug));
	}
	function findAncestorKeys(items: NavNode[], slug: string, groupTitle: string, keys: string[] = []): string[] {
		for (const item of items) {
			if (!item.children?.length) continue;
			if (containsSlug(item, slug)) {
				keys.push(subgroupKey(groupTitle, item.title));
				findAncestorKeys(item.children, slug, groupTitle, keys);
			}
		}
		return keys;
	}
	function subgroupKey(groupTitle: string, itemTitle: string): string {
		return `${groupTitle}::${itemTitle}`;
	}

	let filter = $state('');
	let expanded = $state<string[]>([]);
	let expandedSub = $state<string[]>([]);
	let previousPath = '';
	let dragging = $state(false);
	const currentSlug = $derived(page.url.pathname.replace(/^\/docs\/?/, '').replace(/\/$/, ''));
	// The credits module belongs to the practice surface only, as on the reference site.
	const practiceSlugs = new Set(['learn', 'learn/games', 'glossary']);
	const showPractice = $derived(practiceSlugs.has(currentSlug));
	let scroller = $state<HTMLElement>();
	let scrolled = $state(false);
	function onScroll() {
		if (scroller) scrolled = scroller.scrollTop > 8;
	}
	$effect(() => {
		currentSlug;
		if (scroller) scroller.scrollTop = 0;
	});
	const groups = $derived.by(() => {
		const needle = filter.trim().toLowerCase();
		return navigation
			.map((group) => {
				const items = group.items
					.map((item) => {
						const label = itemLabel(item);
						const matchingChildren = item.children
							? item.children
									.map((child) => ({ ...child, label: itemLabel(child) }))
									.filter((child) => !needle || child.label.toLowerCase().includes(needle))
							: undefined;
						const matches = !needle || label.toLowerCase().includes(needle);
						if (!matches && !matchingChildren?.length) return null;
						return {
							...item,
							label,
							children: matchingChildren
						};
					})
					.filter((item): item is NonNullable<typeof item> => item !== null);
				return {
					...group,
					label: groupLabel(group.title, group.titleZh),
					items
				};
			})
			.filter((group) => group.items.length);
	});
	function toggle(title: string) {
		expanded = expanded.includes(title)
			? expanded.filter((name) => name !== title)
			: [...expanded, title];
		localStorage.setItem('miosa-nav-v1', JSON.stringify(expanded));
	}
	function toggleSub(key: string) {
		expandedSub = expandedSub.includes(key)
			? expandedSub.filter((name) => name !== key)
			: [...expandedSub, key];
		localStorage.setItem('miosa-nav-sub-v1', JSON.stringify(expandedSub));
	}
	function resize(event: PointerEvent) {
		if (dragging) preferences.sidebarWidth = Math.max(220, Math.min(340, event.clientX));
	}
	onMount(() => {
		for (const [key, setter] of [
			['miosa-nav-v1', (value: string[]) => (expanded = value)],
			['miosa-nav-sub-v1', (value: string[]) => (expandedSub = value)]
		] as const) {
			const value = localStorage.getItem(key);
			if (!value) continue;
			try {
				const parsed = JSON.parse(value);
				if (Array.isArray(parsed)) setter(parsed.filter((name: unknown) => typeof name === 'string'));
			} catch {
				localStorage.removeItem(key);
			}
		}
	});
	$effect(() => {
		const path = page.url.pathname;
		if (path === previousPath) return;
		previousPath = path;
		const group = navigation.find((group) => group.items.some((item) => containsSlug(item, currentSlug)));
		if (group && !expanded.includes(group.title)) expanded = [...expanded, group.title];
		const parentGroup = navigation.find((group) => group.items.some((item) => containsSlug(item, currentSlug)));
		if (parentGroup) {
			for (const key of findAncestorKeys(parentGroup.items, currentSlug, parentGroup.title)) {
				if (!expandedSub.includes(key)) expandedSub = [...expandedSub, key];
			}
		}
	});
</script>



{#snippet navItems(items: NavNode[], groupTitle: string)}
	{#each items as item}
		{#if item.children?.length}
			{@const subKey = subgroupKey(groupTitle, item.title)}
			<li>
				<button
					class="nav-sub-toggle"
					class:sub-active={containsSlug(item, currentSlug) && item.slug !== currentSlug}
					aria-expanded={expandedSub.includes(subKey)}
					onclick={() => toggleSub(subKey)}
				>
					<Icon name={item.icon} size={14} /><span>{itemLabel(item)}</span>
					{#if item.count}<small>{item.count}</small>{/if}
					{#if expandedSub.includes(subKey)}<ChevronDown size={12} />{:else}<ChevronRight size={12} />{/if}
				</button>
				{#if expandedSub.includes(subKey)}
					<ul class="nav-sub-list">{@render navItems(item.children, groupTitle)}</ul>
				{/if}
			</li>
		{:else}
			<li>
				<a
					class:active={currentSlug === item.slug}
					href={`/docs${item.slug ? '/' + item.slug : ''}`}
					aria-current={currentSlug === item.slug ? 'page' : undefined}
					onclick={() => (preferences.sidebarOpen = false)}
					><Icon name={item.icon} size={14} /><span>{itemLabel(item)}</span
					>{#if 'badge' in item}<small class="nav-badge">{item.badge}</small>{/if}</a
				>
			</li>
		{/if}
	{/each}
{/snippet}

<aside
	class="sidebar"
	class:mobile-open={preferences.sidebarOpen}
	aria-label={t('docs.sidebar.aria')}
>
	<div class="sidebar-scroll" class:scrolled={scrolled} bind:this={scroller} onscroll={onScroll}>
	<div class="sidebar-top">
		<div class="filter">
			<Search size={13} /><input
				bind:value={filter}
				placeholder={t('docs.sidebar.filter')}
				aria-label={t('docs.sidebar.filterAria')}
			/>{#if filter}<button aria-label={t('docs.sidebar.clearFilter')} onclick={() => (filter = '')}
					><X size={12} /></button
				>{/if}
		</div>
		<button
			class="icon-button close-sidebar"
			aria-label={t('docs.sidebar.close')}
			onclick={() => (preferences.sidebarOpen = false)}><X size={16} /></button
		>
	</div>
	{#if showPractice}
		<a href="/docs/learn/earn" class="balance" onclick={() => (preferences.sidebarOpen = false)}
			><span class="coin"><CircleDollarSign size={15} /></span><b
				>${progress.credits.toFixed(progress.credits % 1 ? 2 : 0)}</b
			><span>/ $100</span><span class="practice-badge">{t('docs.sidebar.practice')}</span></a
		>
	{/if}
	<nav class="sidebar-nav" aria-label={t('docs.sidebar.pagesAria')}>
		{#each groups as group}
			{@const open = !!filter || expanded.includes(group.title)}
			<section class="nav-group">
				<button class="group-toggle" aria-expanded={open} onclick={() => toggle(group.title)}
					><span>{group.label}</span><small>{group.count ?? group.items.length}</small>{#if open}<ChevronDown
							size={12}
						/>{:else}<ChevronRight size={12} />{/if}</button
				>
				{#if open}<ul class="nav-list">{@render navItems(group.items, group.title)}</ul>{/if}
			</section>
		{/each}
		{#if groups.length === 0}<p class="no-pages">{t('docs.sidebar.noPages')}</p>{/if}
	</nav>
	</div>
	<div class="sidebar-bottom">
		<span class="status-dot"></span><span>{t('docs.sidebar.localWorkspace')}</span><a
			href="/docs/customization"
			aria-label={t('docs.sidebar.customizeAria')}><Icon name="settings" size={13} /></a
		>
	</div>
</aside>
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (Keyboard-operable WAI-ARIA window splitter.) -->
<div
	class="sidebar-resize"
	role="separator"
	aria-label={t('docs.sidebar.resizeAria')}
	aria-orientation="vertical"
	aria-valuenow={preferences.sidebarWidth}
	aria-valuemin={220}
	aria-valuemax={340}
	tabindex="0"
	onpointerdown={(event) => {
		dragging = true;
		event.currentTarget.setPointerCapture(event.pointerId);
	}}
	onpointermove={resize}
	onpointerup={(event) => {
		dragging = false;
		event.currentTarget.releasePointerCapture(event.pointerId);
	}}
	onkeydown={(event) => {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			preferences.sidebarWidth = Math.max(
				220,
				Math.min(340, preferences.sidebarWidth + (event.key === 'ArrowLeft' ? -16 : 16))
			);
		}
	}}
></div>

<style>
	.sidebar {
		position: fixed;
		top: 84px;
		left: 0;
		bottom: 0;
		width: var(--sidebar-width);
		display: flex;
		flex-direction: column;
		padding: 0;
		z-index: 31;
	}
	.sidebar-scroll {
		/* One scroll container for the whole rail so the scrollbar reaches the top edge. */
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: auto;
		padding: 0 12px 20px;
		scrollbar-width: thin;
		scrollbar-color: var(--dbd) transparent;
		overscroll-behavior: contain;
		mask-image: linear-gradient(to bottom, transparent 0, #000 18px);
		-webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 18px);
		mask-image: none;
	}
	.sidebar-scroll.scrolled {
		mask-image: linear-gradient(to bottom, transparent 0, #000 18px);
		-webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 18px);
	}
	.sidebar-scroll::-webkit-scrollbar {
		width: 6px;
	}
	.sidebar-scroll::-webkit-scrollbar-thumb {
		background: var(--dbd);
		border-radius: 99px;
	}
	.sidebar-top {
		display: flex;
		gap: 5px;
		align-items: center;
	}
	.filter {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		height: 31px;
		padding: 0 9px;
		flex: 1;
		color: var(--faint);
	}
	.filter input {
		min-width: 0;
		width: 100%;
		border: 0;
		outline: 0;
		background: transparent;
		font-size: 11px;
	}
	.filter input::placeholder {
		color: var(--muted);
	}
	.filter input::-webkit-search-cancel-button {
		display: none;
	}
	.filter button {
		padding: 0;
		display: flex;
	}
	.balance {
		display: flex;
		align-items: center;
		gap: 5px;
		margin: 8px 0 19px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-radius: 9px;
		height: 38px;
		padding: 0 9px;
		font-size: 11px;
	}
	.balance > span:not(.coin):not(.practice-badge) {
		color: var(--muted);
	}
	.coin {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: 1px solid var(--border);
		border-radius: 7px;
		margin-right: 2px;
		background: var(--surface);
	}
	.practice-badge {
		background: var(--button);
		color: var(--button-text);
		border-radius: 99px;
		font-size: 9px;
		padding: 1px 6px;
		margin-left: auto;
	}
	.sidebar-nav {
		flex: 1;
		min-height: 0;
		margin: 0 -4px;
		padding: 0 4px 4px;
	}
	.nav-group {
		margin-bottom: 12px;
	}
	.group-toggle {
		width: 100%;
		height: 30px;
		display: flex;
		align-items: center;
		text-align: left;
		gap: 6px;
		color: var(--muted);
		padding: 0 8px;
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.03em;
	}
	.group-toggle > span {
		flex: 1;
		text-transform: uppercase;
	}
	.group-toggle small {
		font-size: 9px;
		opacity: 0.75;
	}
	.group-toggle:hover {
		color: var(--text);
	}
	ul {
		list-style: none;
		margin: 5px 0 0;
		padding: 0;
	}
	li a {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 30px;
		margin: 2px 0;
		padding: 5px 9px;
		border-radius: 8px;
		font-size: 12px;
		line-height: 1.4;
	}
	li a > :global(svg) {
		color: var(--muted);
	}
	li a:hover {
		background: var(--hover);
	}
	li a.active {
		background: var(--active);
		font-weight: 550;
	}
	li a > span {
		flex: 1;
	}
	.nav-badge {
		padding: 0 6px;
		border: 1px solid var(--border);
		border-radius: 99px;
		color: var(--muted);
		font-weight: 400;
		font-size: 10px;
	}
	.sidebar-bottom {
		flex: none;
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 40px;
		color: var(--muted);
		font-size: 10px;
		border-top: 1px solid var(--border);
	}
	.sidebar-bottom a {
		display: flex;
		margin-left: auto;
	}
	.status-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #249660;
	}
	.close-sidebar {
		display: none;
	}
	.sidebar-resize {
		position: fixed;
		z-index: 32;
		top: 84px;
		bottom: 0;
		left: calc(var(--sidebar-width) - 3px);
		width: 6px;
		cursor: col-resize;
		touch-action: none;
	}
	.sidebar-resize:hover {
		background: var(--border);
	}
	.no-pages {
		font-size: 12px;
		color: var(--muted);
		padding: 12px;
	}
	.nav-sub-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		min-height: 30px;
		padding: 4px 9px;
		border-radius: 8px;
		color: var(--text);
		font-size: 12px;
		text-align: left;
	}
	.nav-sub-toggle > :global(svg) {
		color: var(--muted);
	}
	.nav-sub-toggle > span {
		flex: 1;
	}
	.nav-sub-toggle:hover,
	.nav-sub-toggle.sub-active {
		background: var(--hover);
	}
	.nav-sub-toggle small {
		color: var(--muted);
		font-size: 9px;
	}
	.nav-sub-list {
		margin: 2px 0 4px 14px;
		padding-left: 8px;
		border-left: 1px solid var(--border);
	}
	.nav-sub-list li a {
		min-height: 27px;
		padding: 3px 8px;
		font-size: 11.5px;
	}
	@media (max-width: 1100px) {
		.sidebar {
			transform: translateX(-100%);
			width: 280px;
			top: 0;
			bottom: 0;
			background: var(--canvas);
			padding: 22px 14px;
			transition: transform 0.2s;
			z-index: 60;
			box-shadow: 10px 0 40px #0002;
		}
		.sidebar.mobile-open {
			transform: translateX(0);
		}
		.close-sidebar {
			display: flex;
		}
		.sidebar-resize {
			display: none;
		}
		.balance {
			margin-bottom: 20px;
		}
		.sidebar-top {
			margin-top: 0;
		}
	}
</style>
