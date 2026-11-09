<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { staticSite } from '#lib/site-mode.js';
	import { onMount } from 'svelte';
	import { ArrowUpRight, RotateCcw } from '@lucide/svelte';
	import { t } from '#lib/i18n.svelte.js';
	import ComputeScene from './ComputeScene.svelte';
	import LanguageToggle from './LanguageToggle.svelte';
	let { children }: { children: Snippet } = $props();
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	async function checkStatus() {
		status = 'loading';
		try {
			const response = await fetch('/api/status');
			const data = await response.json();
			status = response.ok && data.status === 'operational' ? 'ready' : 'error';
		} catch {
			status = 'error';
		}
	}
	onMount(() => {
		checkStatus();
	});
	const columns = [
		{
			titleKey: 'marketing.footer.columns.getStarted',
			links: [
				{ labelKey: 'marketing.footer.links.introduction', href: '/docs' },
				{ labelKey: 'marketing.footer.links.quickstart', href: '/docs/quickstart' },
				{ labelKey: 'marketing.footer.links.installation', href: '/docs/installation' },
				{ labelKey: 'marketing.footer.links.productModel', href: '/docs/product-model' },
				{ labelKey: 'marketing.footer.links.startLearning', href: '/docs/learn' }
			]
		},
		{
			titleKey: 'marketing.footer.columns.products',
			links: [
				{ labelKey: 'marketing.footer.links.sandboxes', href: '/docs/sandboxes' },
				{ labelKey: 'marketing.footer.links.computers', href: '/docs/computers' },
				{ labelKey: 'marketing.footer.links.agents', href: '/docs/agents' },
				{ labelKey: 'marketing.footer.links.deployments', href: '/docs/deployments' },
				{ labelKey: 'marketing.footer.links.dataStorage', href: '/docs/data' },
				{ labelKey: 'marketing.footer.links.domains', href: '/docs/networking' }
			]
		},
		{
			titleKey: 'marketing.footer.columns.developers',
			links: [
				{ labelKey: 'marketing.footer.links.sdksOverview', href: '/docs/sdks' },
				{ labelKey: 'marketing.footer.links.typescript', href: '/docs/sdks' },
				{ labelKey: 'marketing.footer.links.python', href: '/docs/sdks' },
				{ labelKey: 'marketing.footer.links.cli', href: '/docs/cli' },
				{ labelKey: 'marketing.footer.links.mcp', href: '/docs/mcp' },
				{ labelKey: 'marketing.footer.links.apiReference', href: '/docs/api' }
			]
		},
		{
			titleKey: 'marketing.footer.columns.platform',
			links: [
				{ labelKey: 'marketing.footer.links.projects', href: '/docs/projects' },
				{ labelKey: 'marketing.footer.links.services', href: '/docs/services' },
				{ labelKey: 'marketing.footer.links.workspaces', href: '/docs/product-model' },
				{ labelKey: 'marketing.footer.links.permissions', href: '/docs/security' },
				{ labelKey: 'marketing.footer.links.customization', href: '/docs/customization' }
			]
		},
		{
			titleKey: 'marketing.footer.columns.resources',
			links: [
				{ labelKey: 'marketing.footer.links.changelog', href: '/docs/changelog' },
				{ labelKey: 'marketing.footer.links.docsForLlms', href: '/llms.txt' },
				{ labelKey: 'marketing.footer.links.fullContext', href: '/llms-full.txt' },
				{ labelKey: 'marketing.footer.links.pricing', href: '/pricing' },
				{ labelKey: 'marketing.footer.links.github', href: 'https://github.com/Miosa-osa' }
			]
		},
		{
			titleKey: 'marketing.footer.columns.reference',
			links: [
				{ labelKey: 'marketing.footer.links.sourceWebsite', href: 'https://miosa.ai' },
				{ labelKey: 'marketing.footer.links.publishedRates', href: 'https://miosa.ai/pricing' },
				{
					labelKey: 'marketing.footer.links.foundationSource',
					href: 'https://github.com/Miosa-osa/foundation'
				},
				{ labelKey: 'marketing.footer.links.aboutReconstruction', href: '/docs/customization' }
			]
		}
	];
</script>

<div class="marketing-page" class:pricing={page.url.pathname === '/pricing'}>
	<div class="marketing-fabric">
		<ComputeScene wheelNavigation={page.url.pathname !== '/pricing'} />
	</div>
	<div class="fabric-shade"></div>
	<header class="marketing-header">
		<a class="marketing-brand" href="/" aria-label={t('marketing.nav.home')}
			><img src="/brand/osa-orb.png" alt="" /><img
				class="wordmark"
				src="/brand/miosa-white.png"
				alt="MIOSA"
			/></a
		>
		<nav aria-label={t('marketing.nav.primary')}>
			<a href="/docs"
				>{t('marketing.nav.docs')}<span class="new-tag">{t('marketing.nav.new')}</span></a
			><a href="/pricing" class:active={page.url.pathname === '/pricing'}
				>{t('marketing.nav.pricing')}</a
			>
			<div class="marketing-language"><LanguageToggle /></div>
			<a class="sign-in" href="https://miosa.ai/login">{t('marketing.nav.signIn')}</a><a
				class="marketing-cta"
				href="https://miosa.ai/register">{t('marketing.nav.startBuilding')}</a
			>
		</nav>
	</header>
	<main class="marketing-main">{@render children()}</main>
	<footer class="marketing-footer">
		<div class="footer-statement">
			<h2>
				{t('marketing.footer.statement.line1')}<br />{t('marketing.footer.statement.line2')}
			</h2>
			<p>
				{t('marketing.footer.statement.bodyLine1')}<br />{t('marketing.footer.statement.bodyLine2')}
			</p>
		</div>
		<nav class="marketing-footer-grid" aria-label={t('marketing.footer.navLabel')}>
			{#each columns as column}<div>
					<h3>{t(column.titleKey)}</h3>
					{#each column.links as link}<a
							href={link.href}
							target={link.href.startsWith('https') ? '_blank' : undefined}
							rel={link.href.startsWith('https') ? 'noreferrer' : undefined}>{t(link.labelKey)}</a
						>
					{/each}
				</div>{/each}
		</nav>
		<div class="marketing-base">
			<span>{t('marketing.footer.copyright')}</span><a href="/docs/customization"
				>{t('marketing.footer.about')}</a
			><button class="system-status" onclick={checkStatus}
				><i class:ready={status === 'ready'} class:error={status === 'error'}></i>{status ===
				'loading'
					? t('marketing.status.checking')
					: status === 'ready'
						? staticSite
							? t('marketing.status.docsAvailable')
							: t('marketing.status.previewOperational')
						: t('marketing.status.unavailableRetry')}{#if status === 'error'}<RotateCcw
						size={10}
					/>{/if}</button
			><a
				href="https://github.com/Miosa-osa"
				target="_blank"
				rel="noreferrer"
				aria-label={t('marketing.footer.github')}><ArrowUpRight size={14} /></a
			>
		</div>
	</footer>
</div>

<style>
	:global(html:has(.marketing-page)) {
		background: #07080b;
	}
	.marketing-page {
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		background: #07080b;
		color: #f2f4f7;
		line-height: 1.5;
		min-height: 100vh;
		font-size: 16px;
		isolation: isolate;
		--canvas: #07080b;
		--surface: #0d0e10;
		--surface-2: #151619;
		--surface-3: #222329;
		--text: #ededed;
		--muted: #8b8b8b;
		--faint: #777;
		--border: #292929;
		--hover: #1a1c20;
		--active: #22252b;
		--button: #f2f3f5;
		--button-text: #090a0c;
		--green: #8bdab1;
		--green-bg: #14291f;
	}
	.marketing-fabric {
		position: fixed;
		inset: 0;
		z-index: -2;
		opacity: 0.72;
		overflow: hidden;
	}
	.fabric-shade {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: linear-gradient(90deg, #07080bd6, #07080b61 53%, #07080bb8);
	}
	.marketing-header {
		height: 80px;
		width: 100%;
		padding: 20px clamp(20px, 4vw, 64px);
		margin: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 20;
	}
	.marketing-brand {
		display: flex;
		align-items: center;
		gap: 13px;
	}
	.marketing-brand > img:first-child {
		width: 34px;
		height: 34px;
		filter: drop-shadow(0 0 10px #bcc4dc44);
	}
	.marketing-brand .wordmark {
		width: 65px;
		height: auto;
	}
	.marketing-header nav {
		display: flex;
		align-items: center;
		gap: 1.45rem;
		font-size: 0.74rem;
		font-weight: 620;
	}
	.marketing-language {
		display: flex;
		align-items: center;
		flex: none;
	}
	.marketing-language :global(.language-toggle) {
		height: 36px;
		padding: 3px 5px 3px 8px;
		border-color: #ffffff24;
		border-radius: 999px;
		background: #ffffff0d;
		color: #f4f6faad;
		-webkit-backdrop-filter: blur(14px);
		backdrop-filter: blur(14px);
		box-shadow: inset 0 1px 0 #ffffff0a;
	}
	.marketing-language :global(.language-toggle:hover) {
		background: #ffffff1a;
		color: #fff;
	}
	.marketing-language :global(.language-globe) {
		color: #8d94a3;
	}
	.marketing-language :global(.language-choice) {
		height: 26px;
		padding: 0 6px;
		border-radius: 999px;
		color: #8f96a3;
		font-size: 10px;
	}
	.marketing-language :global(.language-choice.active) {
		background: #f7f9fc;
		color: #15171b;
		box-shadow: 0 1px 3px #0006;
	}
	.marketing-header nav > a {
		color: #f4f6faad;
		white-space: nowrap;
	}
	.marketing-header nav > a:hover,
	.marketing-header nav > a.active {
		color: #fff;
	}
	.marketing-header nav > a.marketing-cta {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 42px;
		padding: 0 19px;
		border-radius: 999px;
		background: #f7f9fcd6;
		color: #15171b;
		border: 1px solid #ffffff7a;
		font-size: 12px;
	}
	.new-tag {
		display: inline-block;
		color: #a4d9bd;
		border: 1px solid #20362c;
		font-size: 9px;
		padding: 0 6px;
		margin-left: 7px;
		border-radius: 99px;
	}
	.marketing-main {
		position: relative;
		z-index: 1;
	}
	.marketing-footer {
		position: relative;
		z-index: 1;
		border-top: 1px solid var(--border);
		max-width: 1280px;
		margin: auto;
		padding: 75px 0 30px;
	}
	.footer-statement {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 40px;
		border-bottom: 1px solid var(--border);
		padding-bottom: 55px;
	}
	.footer-statement h2 {
		font-size: 32px;
		font-weight: 600;
		line-height: 1.2;
		margin: 0;
		letter-spacing: -0.035em;
	}
	.footer-statement p {
		font-size: 12px;
		color: var(--faint);
		text-align: right;
		line-height: 1.8;
		margin: 0;
	}
	.marketing-footer-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 30px;
		padding: 55px 0 65px;
	}
	.marketing-footer-grid h3 {
		font-size: 11px;
		font-weight: 550;
		letter-spacing: 0;
		margin: 0 0 16px;
	}
	.marketing-footer-grid a {
		font-size: 11px;
		color: var(--faint);
		display: block;
		padding: 5px 0;
	}
	.marketing-footer-grid a:hover {
		color: #fff;
	}
	.marketing-base {
		display: flex;
		align-items: center;
		gap: 20px;
		padding-top: 25px;
		border-top: 1px solid var(--border);
		color: var(--faint);
		font-size: 10px;
	}
	.system-status {
		display: flex;
		align-items: center;
		gap: 6px;
		border: 1px solid var(--border);
		border-radius: 99px;
		margin-left: auto;
		padding: 3px 8px;
		font-size: 10px;
		color: var(--muted);
	}
	.system-status i {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--muted);
	}
	.system-status i.ready {
		background: #8bdab1;
	}
	.system-status i.error {
		background: #d5a17e;
	}
	.marketing-page:not(.pricing) .marketing-footer {
		max-width: none;
		margin: 0;
		padding: 5rem clamp(1.25rem, 7vw, 7.5rem) 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		background: #050608db;
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
	}
	.marketing-page:not(.pricing) .footer-statement {
		border-bottom: 0;
		padding-bottom: 3.5rem;
	}
	.marketing-page:not(.pricing) .marketing-footer-grid {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 3.5rem 0 4rem;
		gap: 2.5rem 2rem;
	}
	.marketing-page:not(.pricing) .marketing-base {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding-top: 2rem;
	}
	@media (max-width: 480px) {
		.marketing-page:not(.pricing) .marketing-footer {
			padding-inline: 1rem;
		}
	}

	.pricing {
		--pr-radius-card: 12px;
		--pr-radius-control: 8px;
		--pr-radius-badge: 6px;
		font-family:
			Geist,
			Inter,
			ui-sans-serif,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		color: #ededed;
	}
	.pricing .marketing-header {
		position: absolute;
	}
	.pricing .marketing-fabric {
		opacity: 0.2;
	}
	.pricing .fabric-shade {
		background: linear-gradient(180deg, #07080b61, #07080bb8 23%, #07080bf0 55%, #07080b);
	}
	@media (max-width: 820px) {
		.marketing-page:not(.pricing) .marketing-fabric {
			position: absolute;
			height: 100svh;
			opacity: 0.54;
			transform: scale(1.08);
			transform-origin: 58% 38%;
		}
		.marketing-page:not(.pricing) .fabric-shade {
			position: absolute;
			height: 100svh;
			background: linear-gradient(180deg, #07080b38, #07080b7a 58%, #07080b);
		}
		.marketing-page:not(.pricing) .marketing-header {
			position: absolute;
			height: 4.25rem;
			padding: 0.75rem 1rem;
			background: linear-gradient(180deg, #07080bad, #07080b00);
		}
		.marketing-page:not(.pricing) .marketing-header nav > a:not(.marketing-cta):not(.sign-in) {
			display: none;
		}
		.marketing-page:not(.pricing) .sign-in {
			display: block;
		}
	}
	@media (max-width: 1400px) {
		.marketing-header {
			margin: 0;
		}
		.marketing-footer {
			margin: 0 72px;
		}
	}
	@media (max-width: 940px) {
		.pricing .marketing-fabric {
			opacity: 0.16;
		}
	}
	@media (max-width: 800px) {
		.marketing-header {
			margin: 0;
			padding-left: 23px;
			padding-right: 23px;
		}
		.marketing-header nav {
			gap: 19px;
		}
		.marketing-footer {
			margin: 0 28px;
			padding-top: 45px;
		}
		.marketing-footer-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 30px;
		}
		.footer-statement h2 {
			font-size: 28px;
		}
		.footer-statement p {
			max-width: 220px;
		}
		.marketing-base {
			flex-wrap: wrap;
			gap: 14px;
		}
		.system-status {
			margin-left: 0;
		}
	}
	@media (max-width: 640px) {
		.pricing .marketing-header nav > a:nth-child(-n + 2) {
			display: none;
		}
		.pricing .sign-in {
			display: block;
		}
		.pricing .marketing-fabric {
			opacity: 0.12;
		}
		.pricing .fabric-shade {
			background: #07080bc7;
		}
	}
	@media (max-width: 500px) {
		.marketing-header {
			height: 68px;
			margin: 0;
			padding: 12px 16px;
		}
		.marketing-brand {
			gap: 8px;
		}
		.marketing-brand > img:first-child {
			width: 28px;
			height: 28px;
		}
		.marketing-brand .wordmark {
			width: 54px;
		}
		.marketing-header nav {
			gap: 15px;
			font-size: 11px;
		}
		.marketing-language :global(.language-toggle) {
			height: 32px;
			padding: 2px 4px 2px 6px;
		}
		.marketing-language :global(.language-choice) {
			height: 24px;
			padding: 0 5px;
			font-size: 9px;
		}
		.new-tag,
		.sign-in {
			display: none;
		}
		.marketing-header nav > a.marketing-cta {
			font-size: 10px;
			min-height: 34px;
			padding: 0 12px;
		}
		.marketing-footer {
			margin: 0 22px;
		}
		.footer-statement {
			display: block;
			padding-bottom: 35px;
		}
		.footer-statement p {
			text-align: left;
			margin-top: 18px;
		}
		.marketing-footer-grid {
			grid-template-columns: 1fr 1fr;
			padding: 35px 0 40px;
		}
		.marketing-base > span {
			width: 100%;
		}
	}
</style>
