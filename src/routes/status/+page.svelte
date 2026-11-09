<script lang="ts">
	import MarketingShell from '#lib/components/MarketingShell.svelte';
	const components = [
		['Core platform', 'API', 'Requests to the MIOSA REST API', '99.83%'],
		['Core platform', 'Authentication', 'Sign-in, API keys and sessions', '100.00%'],
		['Core platform', 'Compute', 'Sandboxes and Computers', '100.00%'],
		['Core platform', 'OpenComputers', 'Connecting and managing your own hosts', '100.00%'],
		['AI', 'Agents & AI', 'Running agents and AI models', '90.29%'],
		['Billing', 'Billing', 'Credits, subscriptions and invoices', '100.00%']
	];
</script>

<svelte:head><title>MIOSA status</title><meta name="description" content="Current health and uptime for MIOSA services." /></svelte:head>

<MarketingShell>
	<main class="status-page">
		<p class="eyebrow">SYSTEM STATUS</p>
		<h1>All systems operational</h1>
		<p class="status-lead">Every MIOSA service is running normally.</p>
		<div class="status-summary">
			<div><b>100.00%</b><span>Platform uptime, 30 days</span></div>
			<div><b>99.97%</b><span>Platform uptime, 90 days</span></div>
			<div><b>Live</b><span>Auto-refreshes every 30 s</span></div>
		</div>
		<section>
			<h2>Components</h2>
			{#each components as [group, name, detail, uptime]}
				<article class="component">
					<div><small>{group}</small><h3>{name}</h3><p>{detail}</p></div>
					<b>{uptime}</b><span>Operational</span>
				</article>
			{/each}
		</section>
	</main>
</MarketingShell>

<style>
	.status-page { max-width: 920px; margin: 0 auto; padding: 140px 24px 80px; }
	.eyebrow { color: var(--muted); font-size: 10px; letter-spacing: .12em; }
	h1 { font-size: clamp(38px, 7vw, 68px); letter-spacing: -.05em; margin: 12px 0; }
	.status-lead { color: var(--muted); font-size: 18px; }
	.status-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin: 36px 0 54px; }
	.status-summary div { background: var(--surface); padding: 22px; display: grid; gap: 8px; }
	.status-summary b { font-size: 26px; }
	.status-summary span { color: var(--muted); font-size: 12px; }
	section h2 { font-size: 22px; margin-bottom: 16px; }
	.component { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 22px; border-top: 1px solid var(--border); padding: 18px 0; }
	.component small { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
	.component h3 { margin: 4px 0; font-size: 15px; }
	.component p { margin: 0; color: var(--muted); font-size: 12px; }
	.component > b { font-family: 'Geist Mono', monospace; font-size: 13px; }
	.component > span { color: var(--green); font-size: 11px; }
	@media (max-width: 600px) { .status-summary { grid-template-columns: 1fr; } .component { grid-template-columns: 1fr auto; } .component > span { grid-column: 2; } }
</style>
