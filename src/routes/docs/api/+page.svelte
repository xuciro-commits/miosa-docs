<script lang="ts">
	import { onMount } from 'svelte';
	import { staticSite } from '#lib/site-mode.js';
	import '@scalar/api-reference/style.css';
	import { ExternalLink, RotateCcw } from '@lucide/svelte';
	let mount: HTMLDivElement;
	let loading = $state(true);
	let failed = $state(false);
	onMount(() => {
		let reference: { destroy: () => void } | undefined;
		let alive = true;
		import('@scalar/api-reference')
			.then(({ createApiReference }) => {
				if (!alive) return;
				reference = createApiReference(mount, {
					url: '/openapi.json',
					theme: 'kepler',
					layout: 'modern',
					hideDarkModeToggle: true,
					hideClientButton: true,
					hideTestRequestButton: staticSite,
					showSidebar: false,
					defaultOpenAllTags: true,
					hideModels: false,
					agent: { disabled: true }
				});
				loading = false;
			})
			.catch(() => {
				failed = true;
				loading = false;
			});
		return () => {
			alive = false;
			reference?.destroy();
		};
	});
</script>

<div class="api-notice">
	<span class="api-dot"></span><span
		>{staticSite
			? 'Static documentation · run the Node server locally to send API requests'
			: 'Working local API · example resources only'}</span
	><a href="/openapi.json" target="_blank" rel="noreferrer"
		>OpenAPI schema<ExternalLink size={11} /></a
	>
</div>
{#if loading}<div class="api-loading">
		<span></span>Loading the API explorer…
	</div>{:else if failed}<div class="empty-state">
		<p>The API explorer could not load.</p>
		<button class="button" onclick={() => location.reload()}><RotateCcw size={13} />Reload</button>
	</div>{/if}
<div bind:this={mount} class="scalar-mount"></div>

<style>
	.api-notice {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 12px 14px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-radius: 9px;
		font-size: 11px;
		margin: 20px 0;
	}
	.api-dot {
		width: 5px;
		height: 5px;
		background: var(--green);
		border-radius: 50%;
	}
	.api-notice > a {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-left: auto;
		color: var(--muted);
	}
	.scalar-mount {
		--scalar-font: Geist, sans-serif;
		--scalar-font-code: 'Geist Mono', monospace;
		--scalar-background-1: var(--surface);
		--scalar-background-2: var(--surface-2);
		--scalar-background-3: var(--hover);
		--scalar-color-1: var(--text);
		--scalar-color-2: var(--muted);
		--scalar-color-3: var(--faint);
		--scalar-border-color: var(--border);
		min-height: 600px;
	}
	.api-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-height: 250px;
		font-size: 13px;
		color: var(--muted);
	}
	.api-loading > span {
		width: 13px;
		height: 13px;
		border: 1px solid var(--border);
		border-top-color: var(--text);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (max-width: 600px) {
		.api-notice {
			flex-wrap: wrap;
			font-size: 10px;
		}
		.api-notice > a {
			margin-left: 12px;
		}
	}
</style>
