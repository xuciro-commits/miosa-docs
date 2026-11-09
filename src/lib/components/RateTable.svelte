<script lang="ts">
	import { priceBook, money } from '#lib/pricing.js';
	let {
		title,
		kind,
		description
	}: { title: string; kind: 'sandbox' | 'computer' | 'app'; description: string } = $props();
	const rows = $derived(priceBook.machines[kind].sizes);
</script>

<section class="rate-section">
	<h2>{title}</h2>
	<p>{description}</p>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable table region supports keyboard horizontal scrolling.) -->
	<div class="rate-scroll" tabindex="0" role="region" aria-label={`${title} resource rates`}>
		<table>
			<thead
				><tr><th>Size</th><th>vCPU</th><th>Memory</th><th>Price</th><th>Always on</th></tr></thead
			><tbody
				>{#each rows as row}<tr class:popular={row.size === 'small'}
						><td
							>{row.size}{#if row.size === 'small'}<span>Popular</span>{/if}</td
						><td>{row.vcpus}</td><td>{row.memory_gib} GB</td><td
							><b>{money(row.usd_per_hour, 4)}/h</b></td
						><td>{money(row.usd_per_month)}/mo</td></tr
					>{/each}</tbody
			>
		</table>
	</div>
	{#if kind === 'app'}<small
			>CPU and memory are metered by use, up to the full-size ceiling shown above.</small
		>{/if}
</section>

<style>
	.rate-section {
		padding: 48px 0;
		border-top: 1px solid var(--border);
	}
	h2 {
		font-size: 28px;
		margin: 0 0 12px;
		letter-spacing: -0.03em;
	}
	.rate-section > p {
		font-size: 12px;
		color: var(--muted);
		margin-bottom: 25px;
	}
	.rate-scroll {
		overflow: auto;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 12px;
		white-space: nowrap;
	}
	th {
		font-size: 10px;
		color: var(--faint);
		font-weight: 400;
		padding: 11px 14px;
		background: #ffffff02;
	}
	td {
		padding: 14px;
		border-top: 1px solid #292c3266;
		font-variant-numeric: tabular-nums;
	}
	td:first-child {
		width: 34%;
		font-weight: 500;
	}
	td:last-child {
		text-align: right;
		color: var(--faint);
	}
	th:last-child {
		text-align: right;
	}
	td b {
		font-weight: 550;
	}
	td > span {
		font-size: 8px;
		margin-left: 8px;
		padding: 2px 6px;
		border-radius: 99px;
		background: #ffffff0c;
		color: var(--muted);
	}
	tr.popular {
		background: #ffffff05;
	}
	.rate-section > small {
		display: block;
		font-size: 10px;
		color: var(--faint);
		margin-top: 12px;
	}
	@media (max-width: 600px) {
		.rate-section {
			padding: 35px 0;
		}
		h2 {
			font-size: 25px;
		}
		table {
			font-size: 10px;
		}
		td,
		th {
			padding: 12px 10px;
		}
		td:first-child {
			width: auto;
		}
		td > span {
			display: block;
			margin: 4px 0 0;
			width: max-content;
		}
	}
</style>
