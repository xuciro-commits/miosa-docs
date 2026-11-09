<script lang="ts">
	import { onMount } from 'svelte';
	import { Dialog } from 'bits-ui';
	import { Maximize2, X, Network } from '@lucide/svelte';
	import { preferences } from '#lib/preferences.svelte.js';
	let { source, label = 'Architecture diagram' }: { source: string; label?: string } = $props();
	let html = $state('');
	let failure = $state(false);
	let mounted = $state(false);
	let expanded = $state(false);
	let generation = 0;
	onMount(() => {
		mounted = true;
	});
	$effect(() => {
		const theme = preferences.theme;
		if (!mounted) return;
		const id = ++generation;
		import('mermaid')
			.then(async ({ default: mermaid }) => {
				mermaid.initialize({
					startOnLoad: false,
					securityLevel: 'strict',
					theme: theme.includes('dark') ? 'dark' : 'neutral',
					fontFamily: 'Geist, sans-serif',
					flowchart: { curve: 'basis', padding: 18 }
				});
				const result = await mermaid.render(`diagram-${crypto.randomUUID()}`, source);
				if (id === generation) {
					html = result.svg;
					failure = false;
				}
			})
			.catch(() => {
				failure = true;
			});
	});
</script>

<Dialog.Root bind:open={expanded}
	><div class="diagram">
		<div class="diagram-label"><Network size={14} />{label}</div>
		<button
			class="diagram-preview"
			aria-label={`Enlarge ${label}`}
			onclick={() => (expanded = true)}
			>{#if html}<div class="svg-wrap">
					{@html html}
				</div>{:else if failure}<pre>{source}</pre>{:else}<span class="loading"
					>Drawing diagram…</span
				>{/if}<span class="zoom"><Maximize2 size={13} /></span></button
		>
	</div>
	<Dialog.Portal
		><Dialog.Overlay class="diagram-overlay" /><Dialog.Content class="diagram-modal"
			><Dialog.Title>{label}</Dialog.Title><Dialog.Description class="sr-only"
				>Expanded architecture diagram</Dialog.Description
			><Dialog.Close class="diagram-close icon-button" aria-label="Close diagram"
				><X size={20} /></Dialog.Close
			>
			<div class="expanded-diagram">{@html html}</div></Dialog.Content
		></Dialog.Portal
	></Dialog.Root
>

<style>
	.diagram {
		border: 1px solid var(--border);
		border-radius: 13px;
		margin: 24px 0;
		background: var(--surface-2);
		overflow: hidden;
	}
	.diagram-label {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 11px;
		color: var(--muted);
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
	}
	.diagram-preview {
		width: 100%;
		position: relative;
		min-height: 150px;
		padding: 22px;
		display: grid;
		place-items: center;
	}
	.svg-wrap {
		width: 100%;
	}
	.svg-wrap :global(svg) {
		display: block;
		margin: auto;
		max-width: 100%;
		height: auto;
		max-height: 340px;
	}
	.zoom {
		position: absolute;
		bottom: 9px;
		right: 9px;
		display: flex;
		background: var(--surface);
		padding: 5px;
		border: 1px solid var(--border);
		border-radius: 5px;
		color: var(--muted);
	}
	.loading {
		font-size: 12px;
		color: var(--muted);
	}
	:global(.diagram-overlay) {
		position: fixed;
		inset: 0;
		z-index: 80;
		background: #0007;
		backdrop-filter: blur(5px);
	}
	:global(.diagram-modal) {
		position: fixed;
		z-index: 81;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(1000px, 92vw);
		max-height: 90vh;
		overflow: auto;
		scrollbar-width: thin;
		border-radius: 16px;
		background: var(--surface);
		padding: 30px;
		box-shadow: 0 20px 70px #0004;
	}
	:global(.diagram-modal h2) {
		margin: 0;
		font-size: 17px;
	}
	:global(.diagram-close) {
		position: absolute;
		right: 15px;
		top: 15px;
	}
	.expanded-diagram {
		padding: 30px 0;
	}
	.expanded-diagram :global(svg) {
		display: block;
		margin: auto;
		max-width: 100%;
		height: auto;
	}
</style>
