<script lang="ts">
	import { Info, Lightbulb, TriangleAlert } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	let {
		title = 'Good to know',
		kind = 'info',
		children
	}: { title?: string; kind?: 'info' | 'tip' | 'warning'; children: Snippet } = $props();
</script>

<aside class="callout" class:warning={kind === 'warning'}>
	{#if kind === 'tip'}<Lightbulb size={17} />{:else if kind === 'warning'}<TriangleAlert
			size={17}
		/>{:else}<Info size={17} />{/if}
	<div>
		<strong>{title}</strong>
		<div>{@render children()}</div>
	</div>
</aside>

<style>
	.callout {
		display: flex;
		gap: 12px;
		padding: 17px 18px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-radius: 12px;
		margin: 23px 0;
		font-size: 13px;
		line-height: 1.7;
	}
	.callout > :global(svg) {
		margin-top: 3px;
		color: var(--muted);
	}
	strong {
		font-weight: 550;
		display: block;
		margin-bottom: 4px;
	}
	.callout div :global(p) {
		margin: 0;
	}
	.callout.warning {
		background: color-mix(in srgb, #dfb12d 6%, var(--surface));
		border-color: color-mix(in srgb, #bd9634 30%, var(--border));
	}
</style>
