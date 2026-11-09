<script lang="ts">
	import { ArrowRight, CodeXml } from '@lucide/svelte';
	import type { factCards } from '#lib/content/landing.js';
	let { card }: { card: (typeof factCards)[number] } = $props();
</script>

<div class="fact-card" style={`--card-bg:${card.background};--card-color:${card.color}`}>
	<div class="card-label"><span>{card.tag}</span><CodeXml size={14} /></div>
	<h3>{card.title}</h3>
	<p>{card.description}</p>
	<pre>{card.code}</pre>
	<div class="card-link">{card.link}<ArrowRight size={13} /></div>
</div>

<style>
	.fact-card {
		font-family:
			Geist,
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
		background: var(--card-bg);
		color: var(--card-color);
		border: 1px solid rgb(255 255 255 / 20%);
		border-radius: 16px;
		padding: 24px 21px 18px;
		height: 345px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 14px 30px #0002;
		font-size: 12px;
		text-align: left;
	}
	.card-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: inherit;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.08em;
	}
	.fact-card h3 {
		color: inherit;
		white-space: pre-line;
		font-size: 16px;
		font-weight: 520;
		line-height: 1.15;
		margin: 32px 0 18px;
		letter-spacing: -0.012em;
	}
	.fact-card p {
		font-size: 12px;
		line-height: 1.4;
		margin: 10px 0 20px;
		max-width: 230px;
	}
	.fact-card pre {
		background: #1c0e09;
		color: #ffe9de;
		font-family: 'Geist Mono', monospace;
		border: 0;
		border-radius: 8px;
		padding: 12px;
		font-size: 9px;
		line-height: 2;
		white-space: pre-wrap;
		margin: 0;
		overflow: hidden;
	}
	.card-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 10px;
		border-top: 1px solid #0002;
		padding-top: 14px;
		margin-top: auto;
	}
	@media (max-width: 600px) {
		.fact-card {
			height: 300px;
			padding: 21px 18px;
		}
		.fact-card h3 {
			margin: 23px 0 12px;
		}
		.fact-card p {
			margin: 8px 0 16px;
		}
		.fact-card pre {
			font-size: 8px;
		}
	}
</style>
