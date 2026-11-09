<script lang="ts">
	import { page } from '$app/state';
	import {
		Search,
		Menu,
		Sun,
		Moon,
		Monitor,
		Check,
		CodeXml as Github,
		ChevronDown,
		PanelLeft
	} from '@lucide/svelte';
	import { preferences, ask, type Theme } from '#lib/preferences.svelte.js';
	let themeMenu = $state(false);
	const tabs = [
		{ title: 'Docs', href: '/docs', section: 'docs' },
		{ title: 'Learn', href: '/docs/learn', section: 'learn' },
		{ title: 'API reference', href: '/docs/api-reference', section: 'api' },
		{ title: 'SDKs', href: '/docs/sdks', section: 'sdks' },
		{ title: 'CLI & MCP', href: '/docs/cli', section: 'cli' },
		{ title: 'Changelog', href: '/docs/changelog', section: 'changelog' }
	];
	const active = $derived(
		page.url.pathname.includes('/learn') || page.url.pathname.includes('/glossary')
			? 'learn'
			: page.url.pathname.includes('/api')
				? 'api'
				: page.url.pathname.includes('/sdks')
					? 'sdks'
					: /\/(cli|mcp)/.test(page.url.pathname)
						? 'cli'
						: page.url.pathname.includes('/changelog')
							? 'changelog'
							: 'docs'
	);
	const themes: { value: Theme; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'glass', label: 'Glass' },
		{ value: 'glass-dark', label: 'Dark glass' }
	];
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') themeMenu = false;
	}}
/>
<header class="site-header">
	<div class="header-pill">
		<button
			class="icon-button mobile-menu"
			aria-label="Open navigation"
			onclick={() => (preferences.sidebarOpen = true)}><Menu size={18} /></button
		>
		<a href="/docs" class="brand" aria-label="MIOSA documentation"
			><img class="logo-light" src="/brand/miosa-black.png" alt="MIOSA" /><img
				class="logo-dark"
				src="/brand/miosa-white.png"
				alt="MIOSA"
			/><span>/</span><b>Docs</b></a
		>
		<nav class="top-tabs" aria-label="Documentation sections">
			{#each tabs as tab}<a
					href={tab.href}
					class:active={active === tab.section}
					aria-current={active === tab.section ? 'page' : undefined}>{tab.title}</a
				>{/each}
		</nav>
		<button class="search-trigger" onclick={() => (preferences.searchOpen = true)}
			><Search size={14} /><span>Search docs…</span><span class="shortcut"
				><kbd>⌘</kbd><kbd>K</kbd></span
			></button
		>
		<div class="header-actions">
			<a
				class="icon-button github"
				href="https://github.com/Miosa-osa/foundation"
				target="_blank"
				rel="noreferrer"
				aria-label="Foundation on GitHub"><Github size={15} /></a
			>
			<div class="theme-wrap">
				<button
					class="icon-button"
					aria-label="Change theme"
					aria-expanded={themeMenu}
					aria-controls="theme-menu"
					onclick={() => (themeMenu = !themeMenu)}
					>{#if preferences.theme === 'dark' || preferences.theme === 'glass-dark'}<Moon
							size={16}
						/>{:else if preferences.theme === 'system'}<Monitor size={16} />{:else}<Sun
							size={16}
						/>{/if}</button
				>
				{#if themeMenu}<div class="theme-menu" id="theme-menu">
						<p>Appearance</p>
						{#each themes as theme}<button
								class:selected={preferences.theme === theme.value}
								onclick={() => {
									preferences.theme = theme.value;
									themeMenu = false;
								}}
								><span>{theme.label}</span>{#if preferences.theme === theme.value}<Check
										size={13}
									/>{/if}</button
							>{/each}
					</div>{/if}
			</div>
			<a class="button primary start-building" href="/docs/quickstart">Start building</a>
			<button class="ask-button" onclick={() => ask()}
				><img src="/brand/osa-orb.png" alt="" /><span>Ask OSA</span></button
			>
		</div>
	</div>
</header>

<style>
	.site-header {
		height: 72px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 35;
		display: flex;
		align-items: flex-start;
		padding: 8px 20px;
		pointer-events: none;
	}
	.header-pill {
		width: 100%;
		max-width: 1312px;
		margin: 0 auto;
		min-height: 48px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 7px 9px;
		background: color-mix(in srgb, var(--dbg2) 80%, transparent);
		backdrop-filter: blur(20px);
		border: 1px solid var(--border);
		border-radius: 16px;
		box-shadow: var(--docs-shadow-nav);
		pointer-events: auto;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 9px;
		white-space: nowrap;
		padding: 0 4px;
	}
	.brand img {
		width: 67px;
		height: auto;
		max-height: 18px;
		object-fit: contain;
	}
	.brand span,
	.brand b {
		font-size: 12px;
		font-weight: 500;
		color: var(--muted);
	}
	.logo-dark {
		display: none;
	}
	:global([data-theme='dark']) .logo-dark,
	:global([data-theme='glass-dark']) .logo-dark {
		display: block;
	}
	:global([data-theme='dark']) .logo-light,
	:global([data-theme='glass-dark']) .logo-light {
		display: none;
	}
	.top-tabs {
		display: flex;
		align-items: center;
		gap: 2px;
		border-radius: 10px;
		background: var(--hover);
		padding: 3px;
		white-space: nowrap;
	}
	.top-tabs a {
		font-size: 11.5px;
		font-weight: 500;
		line-height: 22px;
		padding: 0 9px;
		color: var(--muted);
		border-radius: 6px;
	}
	.top-tabs a:hover {
		color: var(--text);
	}
	.top-tabs a.active {
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 1px 3px #0002;
	}
	.search-trigger {
		display: flex;
		align-items: center;
		gap: 7px;
		background: var(--hover);
		border: 1px solid var(--border);
		border-radius: 8px;
		min-width: 120px;
		flex: 1;
		max-width: 270px;
		height: 31px;
		padding: 0 9px;
		font-size: 11.5px;
		color: var(--muted);
		text-align: left;
	}
	.shortcut {
		margin-left: auto;
		display: flex;
		gap: 2px;
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-left: auto;
	}
	.ask-button {
		display: flex;
		align-items: center;
		gap: 5px;
		height: 30px;
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 11.5px;
		font-weight: 550;
		padding: 0 9px;
		white-space: nowrap;
	}
	.ask-button:hover {
		background: var(--hover);
	}
	.ask-button img {
		width: 18px;
		height: 18px;
	}
	.start-building {
		min-height: 30px !important;
		padding: 6px 12px !important;
		border-radius: 7px !important;
		font-size: 11px !important;
	}
	.theme-wrap {
		position: relative;
	}
	.theme-menu {
		position: absolute;
		top: 39px;
		right: 0;
		min-width: 160px;
		padding: 5px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 11px;
		box-shadow: 0 10px 30px #0002;
	}
	.theme-menu p {
		font-size: 11px;
		color: var(--muted);
		margin: 5px 8px 7px;
	}
	.theme-menu button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 7px 9px;
		text-align: left;
		border-radius: 6px;
		font-size: 12px;
	}
	.theme-menu button:hover,
	.theme-menu button.selected {
		background: var(--hover);
	}
	.mobile-menu {
		display: none;
	}
	@media (max-width: 1250px) {
		.top-tabs a {
			padding: 0 6px;
			font-size: 11px;
		}
		.header-pill {
			gap: 8px;
		}
		.github {
			display: none;
		}
	}
	@media (max-width: 1100px) {
		.top-tabs {
			display: none;
		}
		.search-trigger {
			max-width: none;
		}
		.header-pill {
			max-width: 980px;
		}
		.mobile-menu {
			display: inline-flex;
		}
	}
	@media (max-width: 600px) {
		.site-header {
			padding: 8px 9px;
		}
		.header-pill {
			gap: 6px;
			min-height: 47px;
			padding: 6px;
		}
		.brand img {
			width: 60px;
		}
		.brand span,
		.brand b,
		.start-building,
		.shortcut {
			display: none;
		}
		.search-trigger {
			min-width: 30px;
			max-width: 35px;
			background: transparent;
			border: 0;
			justify-content: center;
			padding: 0;
			margin-left: auto;
		}
		.search-trigger > span {
			display: none;
		}
		.header-actions {
			margin-left: 0;
			gap: 2px;
		}
		.ask-button {
			padding: 0 7px;
		}
		.header-pill .icon-button {
			width: 29px;
		}
		.brand {
			padding: 0 2px;
		}
	}
</style>
