<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import '../app.css';
	import { onMount } from 'svelte';
	import { preferences, type Theme } from '#lib/preferences.svelte.js';
	import { loadProgress } from '#lib/learning.svelte.js';
	import { initI18n } from '#lib/i18n.svelte.js';
	import SearchDialog from '#lib/components/SearchDialog.svelte';
	import AskPanel from '#lib/components/AskPanel.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let ready = $state(false);
	onMount(() => {
		initI18n();
		const theme = localStorage.getItem('miosa-theme');
		if (theme && ['system', 'light', 'dark', 'glass', 'glass-dark'].includes(theme))
			preferences.theme = theme as Theme;
		const width = Number(localStorage.getItem('miosa-sidebar-width'));
		if (width >= 220 && width <= 340) preferences.sidebarWidth = width;
		loadProgress();
		ready = true;
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const change = () => {
			if (preferences.theme === 'system')
				document.documentElement.dataset.theme = media.matches ? 'dark' : 'light';
		};
		media.addEventListener('change', change);
		return () => media.removeEventListener('change', change);
	});
	$effect(() => {
		if (!ready) return;
		const theme = preferences.theme;
		document.documentElement.dataset.theme =
			theme === 'system'
				? window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light'
				: theme;
		localStorage.setItem('miosa-theme', theme);
		localStorage.setItem('miosa-sidebar-width', String(preferences.sidebarWidth));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="preload"
		href="/fonts/Geist.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

{@render children()}
<SearchDialog />
<AskPanel />
{#if preferences.toast}<div class="toast" role="status">{preferences.toast}</div>{/if}
