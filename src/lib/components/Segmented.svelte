<script lang="ts">
	import { i18n } from '#lib/i18n.svelte.js';
	import { messages } from '#lib/i18n/messages/index.js';
	/** Exact-source lookup for labels supplied by callers. */
	const tr = (value: string) => (i18n.locale === 'zh' ? ((messages.zh as Record<string, string>)[value] ?? value) : value);
	let {
		label,
		options,
		value = $bindable(),
		onchange
	}: {
		label: string;
		options: { value: string | number; label: string; detail?: string }[];
		value: string | number;
		onchange?: (value: string | number) => void;
	} = $props();
	function choose(next: string | number) {
		value = next;
		onchange?.(next);
	}
</script>

<div class="segment-field">
	<span class="segment-label">{tr(label)}</span>
	<div class="segments" role="radiogroup" aria-label={tr(label)}>
		{#each options as option, i}<button
				role="radio"
				aria-checked={value === option.value}
				tabindex={value === option.value ? 0 : -1}
				onclick={() => choose(option.value)}
				onkeydown={(event) => {
					const step =
						event.key === 'ArrowRight' || event.key === 'ArrowDown'
							? 1
							: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
								? -1
								: 0;
					if (step) {
						event.preventDefault();
						const next = (i + step + options.length) % options.length;
						choose(options[next].value);
						(event.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();
					}
				}}
				><span>{tr(option.label)}</span>{#if option.detail}<small>{tr(option.detail)}</small>{/if}</button
			>{/each}
	</div>
</div>

<style>
	.segment-field {
		margin: 15px 0;
	}
	.segment-label {
		display: block;
		font-size: 12px;
		color: var(--muted);
		margin-bottom: 9px;
	}
	.segments {
		display: flex;
		gap: 3px;
		background: #0b0c0e;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 4px;
		overflow: auto;
	}
	.segments button {
		flex: 1;
		min-width: 55px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		color: var(--muted);
		border-radius: 5px;
		padding: 9px 10px;
		font-size: 12px;
		line-height: 1.5;
		white-space: nowrap;
	}
	.segments button[aria-checked='true'] {
		background: #efeff1;
		color: #131418;
		font-weight: 550;
	}
	.segments button:hover:not([aria-checked='true']) {
		background: #ffffff08;
		color: #f5f5f7;
	}
	.segments small {
		font-size: 10px;
		font-weight: 400;
		opacity: 0.7;
	}
	@media (max-width: 600px) {
		.segments button {
			font-size: 10px;
			padding: 8px;
			min-width: 58px;
		}
		.segments small {
			font-size: 9px;
		}
		.segment-label {
			font-size: 11px;
		}
	}
</style>
