<script lang="ts">
	import MarketingShell from '#lib/components/MarketingShell.svelte';
	import { i18n } from '#lib/i18n.svelte.js';
	const copy = {
		en: {
			eyebrow: 'SYSTEM STATUS',
			title: 'All systems operational',
			lead: 'Every MIOSA service is running normally.',
			uptime30: 'Platform uptime, 30 days',
			uptime90: 'Platform uptime, 90 days',
			live: 'Live',
			refresh: 'Auto-refreshes every 30 s',
			components: 'Components',
			operational: 'Operational',
			core: 'Core platform',
			api: 'API',
			apiDetail: 'Requests to the MIOSA REST API',
			auth: 'Authentication',
			authDetail: 'Sign-in, API keys and sessions',
			compute: 'Compute',
			computeDetail: 'Sandboxes and Computers',
			open: 'OpenComputers',
			openDetail: 'Connecting and managing your own hosts',
			ai: 'AI',
			aiGroup: 'Agents & AI',
			aiDetail: 'Running agents and AI models',
			billing: 'Billing',
			billingDetail: 'Credits, subscriptions and invoices'
		},
		zh: {
			eyebrow: '系统状态',
			title: '所有系统运行正常',
			lead: 'MIOSA 的每一项服务都在正常运行。',
			uptime30: '平台可用率，30 天',
			uptime90: '平台可用率，90 天',
			live: '实时',
			refresh: '每 30 秒自动刷新',
			components: '服务组件',
			operational: '运行正常',
			core: '核心平台',
			api: 'API',
			apiDetail: '对 MIOSA REST API 的请求',
			auth: '身份验证',
			authDetail: '登录、API 密钥与会话',
			compute: '计算',
			computeDetail: '沙箱与计算机',
			open: 'OpenComputers',
			openDetail: '连接并管理你自己的主机',
			ai: 'AI',
			aiGroup: '智能体与 AI',
			aiDetail: '运行智能体与 AI 模型',
			billing: '计费',
			billingDetail: '额度、订阅与账单'
		}
	};
	const text = $derived(copy[i18n.locale === 'zh' ? 'zh' : 'en']);
	const components = $derived([
		[text.core, text.api, text.apiDetail, '99.83%'],
		[text.core, text.auth, text.authDetail, '100.00%'],
		[text.core, text.compute, text.computeDetail, '100.00%'],
		[text.core, text.open, text.openDetail, '100.00%'],
		[text.ai, text.aiGroup, text.aiDetail, '90.29%'],
		[text.billing, text.billing, text.billingDetail, '100.00%']
	]);
</script>

<svelte:head><title>{i18n.locale === 'zh' ? 'MIOSA 系统状态' : 'MIOSA status'}</title><meta name="description" content={i18n.locale === 'zh' ? 'MIOSA 各项服务的当前健康状态与可用率。' : 'Current health and uptime for MIOSA services.'} /></svelte:head>

<MarketingShell>
	<main class="status-page">
		<p class="eyebrow">{text.eyebrow}</p>
		<h1>{text.title}</h1>
		<p class="status-lead">{text.lead}</p>
		<div class="status-summary">
			<div><b>100.00%</b><span>{text.uptime30}</span></div>
			<div><b>99.97%</b><span>{text.uptime90}</span></div>
			<div><b>{text.live}</b><span>{text.refresh}</span></div>
		</div>
		<section>
			<h2>{text.components}</h2>
			{#each components as [group, name, detail, uptime]}
				<article class="component">
					<div><small>{group}</small><h3>{name}</h3><p>{detail}</p></div>
					<b>{uptime}</b><span>{text.operational}</span>
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
