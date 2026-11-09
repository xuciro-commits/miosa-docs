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
	import { preferences } from '#lib/preferences.svelte.js';
	import { progress } from '#lib/learning.svelte.js';
	import Icon from './Icon.svelte';
	let filter = $state('');
	let expanded = $state<string[]>([
		navigation.find((group) =>
			group.items.some((item) => `/docs${item.slug ? '/' + item.slug : ''}` === page.url.pathname)
		)?.title ?? 'Learn'
	]);
	let previousPath = '';
	let dragging = $state(false);
	const currentSlug = $derived(page.url.pathname.replace(/^\/docs\/?/, '').replace(/\/$/, ''));
	const groups = $derived(
		navigation
			.map((group) => ({
				...group,
				items: group.items.filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()))
			}))
			.filter((group) => group.items.length)
	);
	onMount(() => {
		const value = localStorage.getItem('miosa-nav-v1');
		if (value) {
			try {
				expanded = JSON.parse(value).filter((name: unknown) => typeof name === 'string');
			} catch {
				localStorage.removeItem('miosa-nav-v1');
			}
		}
	});
	function toggle(title: string) {
		expanded = expanded.includes(title)
			? expanded.filter((t) => t !== title)
			: [...expanded, title];
		localStorage.setItem('miosa-nav-v1', JSON.stringify(expanded));
	}
	function resize(event: PointerEvent) {
		if (dragging) preferences.sidebarWidth = Math.max(220, Math.min(340, event.clientX));
	}
	$effect(() => {
		const path = page.url.pathname;
		if (path === previousPath) return;
		previousPath = path;
		const group = navigation.find((group) =>
			group.items.some((item) => `/docs${item.slug ? '/' + item.slug : ''}` === path)
		);
		if (group && !expanded.includes(group.title)) expanded = [...expanded, group.title];
	});
</script>

<aside
	class="sidebar"
	class:mobile-open={preferences.sidebarOpen}
	aria-label="Documentation navigation"
>
	<div class="sidebar-top">
		<div class="filter">
			<Search size={13} /><input
				bind:value={filter}
				placeholder="Filter pages"
				aria-label="Filter pages"
			/>{#if filter}<button aria-label="Clear filter" onclick={() => (filter = '')}
					><X size={12} /></button
				>{/if}
		</div>
		<button
			class="icon-button close-sidebar"
			aria-label="Close navigation"
			onclick={() => (preferences.sidebarOpen = false)}><X size={16} /></button
		>
	</div>
	<a href="/docs/learn/earn" class="balance" onclick={() => (preferences.sidebarOpen = false)}
		><span class="coin"><CircleDollarSign size={15} /></span><b
			>${progress.credits.toFixed(progress.credits % 1 ? 2 : 0)}</b
		><span>/ $100</span><span class="practice-badge">Practice</span></a
	>
	<nav class="sidebar-nav" aria-label="Pages">
		{#each groups as group}
			{@const open = !!filter || expanded.includes(group.title)}
			<section class="nav-group">
				<button class="group-toggle" aria-expanded={open} onclick={() => toggle(group.title)}
					><span>{group.title}</span><small>{group.items.length}</small>{#if open}<ChevronDown
							size={12}
						/>{:else}<ChevronRight size={12} />{/if}</button
				>
				{#if open}<ul>
						{#each group.items as item}<li>
								<a
									class:active={currentSlug === item.slug}
									href={`/docs${item.slug ? '/' + item.slug : ''}`}
									aria-current={currentSlug === item.slug ? 'page' : undefined}
									onclick={() => (preferences.sidebarOpen = false)}
									><Icon name={item.icon} size={14} /><span>{item.title}</span
									>{#if 'badge' in item}<small class="nav-badge">{item.badge}</small>{/if}</a
								>
							</li>{/each}
					</ul>{/if}
			</section>
		{/each}
		{#if groups.length === 0}<p class="no-pages">No matching pages.</p>{/if}
	</nav>
	<div class="sidebar-bottom">
		<span class="status-dot"></span><span>Local learning workspace</span><a
			href="/docs/customization"
			aria-label="Customize this site"><Icon name="settings" size={13} /></a
		>
	</div>
</aside>
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (Keyboard-operable WAI-ARIA window splitter.) -->
<div
	class="sidebar-resize"
	role="separator"
	aria-label="Resize navigation"
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
		padding: 0 12px;
		z-index: 31;
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
		overflow: auto;
		flex: 1;
		margin: 0 -4px;
		padding: 0 4px 20px;
		scrollbar-width: thin;
		scrollbar-color: var(--dbd) transparent;
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
