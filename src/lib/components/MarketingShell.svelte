<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { ArrowUpRight, RotateCcw } from '@lucide/svelte';
	import ComputeScene from './ComputeScene.svelte';
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
			title: 'Get started',
			links: [
				['Introduction', '/docs'],
				['Quickstart', '/docs/quickstart'],
				['Install the CLI or SDK', '/docs/installation'],
				['The product model', '/docs/product-model'],
				['Start learning', '/docs/learn']
			]
		},
		{
			title: 'Products',
			links: [
				['Sandboxes', '/docs/sandboxes'],
				['Computers', '/docs/computers'],
				['Agents', '/docs/agents'],
				['Deployments', '/docs/deployments'],
				['Data & storage', '/docs/data'],
				['Domains', '/docs/networking']
			]
		},
		{
			title: 'Developers',
			links: [
				['SDKs overview', '/docs/sdks'],
				['TypeScript', '/docs/sdks'],
				['Python', '/docs/sdks'],
				['CLI', '/docs/cli'],
				['MCP', '/docs/mcp'],
				['API reference', '/docs/api']
			]
		},
		{
			title: 'Platform',
			links: [
				['Projects', '/docs/projects'],
				['Services', '/docs/services'],
				['Workspaces', '/docs/product-model'],
				['Permissions', '/docs/security'],
				['Customization', '/docs/customization']
			]
		},
		{
			title: 'Resources',
			links: [
				['Changelog', '/docs/changelog'],
				['Docs for LLMs', '/llms.txt'],
				['Full context', '/llms-full.txt'],
				['Pricing', '/pricing'],
				['GitHub', 'https://github.com/Miosa-osa']
			]
		},
		{
			title: 'Reference',
			links: [
				['Source website', 'https://miosa.ai'],
				['Published rates', 'https://miosa.ai/pricing'],
				['Foundation source', 'https://github.com/Miosa-osa/foundation'],
				['About this reconstruction', '/docs/customization']
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
		<a class="marketing-brand" href="/" aria-label="MIOSA home"
			><img src="/brand/osa-orb.png" alt="" /><img
				class="wordmark"
				src="/brand/miosa-white.png"
				alt="MIOSA"
			/></a
		>
		<nav aria-label="Primary navigation">
			<a href="/docs">Docs<span class="new-tag">New</span></a><a
				href="/pricing"
				class:active={page.url.pathname === '/pricing'}>Pricing</a
			><a class="sign-in" href="https://miosa.ai/login">Sign in</a><a
				class="marketing-cta"
				href="https://miosa.ai/register">Start building</a
			>
		</nav>
	</header>
	<main class="marketing-main">{@render children()}</main>
	<footer class="marketing-footer">
		<div class="footer-statement">
			<h2>Infrastructure for<br />agent-built software.</h2>
			<p>A place to build, a machine to operate,<br />and a clear path to a published version.</p>
		</div>
		<nav class="marketing-footer-grid" aria-label="Site footer">
			{#each columns as column}<div>
					<h3>{column.title}</h3>
					{#each column.links as [label, href]}<a
							{href}
							target={href.startsWith('https') ? '_blank' : undefined}
							rel={href.startsWith('https') ? 'noreferrer' : undefined}>{label}</a
						>{/each}
				</div>{/each}
		</nav>
		<div class="marketing-base">
			<span>© 2026 MIOSA · Local interface study</span><a href="/docs/customization"
				>About this project</a
			><button class="system-status" onclick={checkStatus}
				><i class:ready={status === 'ready'} class:error={status === 'error'}></i>{status ===
				'loading'
					? 'Checking local status'
					: status === 'ready'
						? 'Local preview operational'
						: 'Status unavailable · retry'}{#if status === 'error'}<RotateCcw
						size={10}
					/>{/if}</button
			><a
				href="https://github.com/Miosa-osa"
				target="_blank"
				rel="noreferrer"
				aria-label="MIOSA on GitHub"><ArrowUpRight size={14} /></a
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
