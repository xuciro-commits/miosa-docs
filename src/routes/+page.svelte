<script lang="ts">
	import { ArrowRight, ArrowUpRight, Timer, Copy, Check } from '@lucide/svelte';
	import MarketingShell from '#lib/components/MarketingShell.svelte';
	let copied = $state(false);
	let copyError = $state(false);
	const command = 'npm install -g @miosa/cli@latest';
	async function copy() {
		try {
			await navigator.clipboard.writeText(command);
			copied = true;
			copyError = false;
			setTimeout(() => (copied = false), 1800);
		} catch {
			copyError = true;
		}
	}
</script>

<svelte:head
	><title>MIOSA · Infrastructure for agent-built software</title><meta
		name="description"
		content="A faithful local reconstruction of the MIOSA infrastructure website, documentation and pricing experience."
	/></svelte:head
>
<MarketingShell
	><section class="home-hero">
		<div class="hero-copy">
			<a class="announcement" href="/docs"
				><span><i></i>New</span><b
					>Build on MIOSA: the new docs, CLI 2.2 and browser use in every sandbox</b
				><ArrowRight size={14} /></a
			>
			<p class="eyebrow">MIOSA CLOUD</p>
			<h1>Infrastructure for<br /><span>agent-built</span> software.</h1>
			<p class="hero-lead">
				Give agents isolated environments to build in, persistent computers to operate, and a direct
				path to production.
			</p>
			<div class="hero-actions">
				<a class="button primary" href="https://miosa.ai/register"
					>Start building<ArrowRight size={15} /></a
				><a class="button secondary" href="/docs">Explore the docs</a>
			</div>
			<a
				class="benchmark-link"
				href="https://miosa.ai/docs/benchmarks"
				target="_blank"
				rel="noreferrer"
				><Timer size={13} /><b>57.1 ms</b><span
					>startup in MIOSA’s published ComputeSDK benchmark</span
				><ArrowUpRight size={11} /></a
			>
		</div>
	</section>
	<section class="infrastructure home-section">
		<div class="section-heading">
			<div>
				<p class="eyebrow">The infrastructure</p>
				<h2>One API for the<br />full runtime.</h2>
			</div>
			<p>
				Create an environment, run the task, inspect the output, and publish a version through one
				resource model.
			</p>
		</div>
		<div class="infrastructure-steps">
			{#each [{ title: 'Isolated environments', text: 'An independent home for code, dependencies, tests and previews.', href: '/docs/sandboxes' }, { title: 'Persistent computers', text: 'Desktops for visual work, browser sessions and tasks that need a human handoff.', href: '/docs/computers' }, { title: 'Production delivery', text: 'Versioned releases with durable data, custom domains and a route back.', href: '/docs/deployments' }] as step, i}<a
					href={step.href}
					><small>0{i + 1}</small>
					<h3>{step.title}</h3>
					<p>{step.text}</p>
					<ArrowUpRight size={16} /></a
				>{/each}
		</div>
	</section>
	<section class="customer-section home-section">
		<div>
			<p class="eyebrow">Customer infrastructure</p>
			<h2>Isolation is part of<br />the resource model.</h2>
		</div>
		<div>
			<p>
				Give each customer a workspace and each application a project. Keep ownership, usage and
				deployment boundaries visible.
			</p>
			<a class="button primary" href="/docs/product-model"
				>Explore the resource model<ArrowRight size={14} /></a
			>
		</div>
	</section>
	<section class="closing-section home-section">
		<p class="eyebrow">Start with MIOSA</p>
		<h2>Give your agents somewhere<br />real to work.</h2>
		<p>
			A sandbox for the first experiment. A computer for the longer task.<br />A version you can
			inspect before you publish.
		</p>
		<div>
			<a class="button primary" href="https://miosa.ai/register"
				>Start building<ArrowRight size={13} /></a
			><button
				class="install-command"
				aria-label="Copy the MIOSA CLI install command"
				onclick={copy}
				><span>CLI</span><code>{command}</code><b
					>{copyError ? 'Select to copy' : copied ? 'Copied' : 'Copy'}</b
				>{#if copied}<Check size={12} />{/if}</button
			>
		</div>
		{#if copyError}<code class="copy-fallback">{command}</code>{/if}<a
			class="setup-guide"
			href="/docs/installation">CLI setup guide<ArrowUpRight size={12} /></a
		>
	</section></MarketingShell
>

<style>
	.announcement > span {
		display: inline-flex;
		flex: none;
		align-items: center;
		gap: 0.4rem;
		padding: 0.28rem 0.65rem;
		border-radius: 999px;
		color: #f4f5f7;
		background: #ffffff1a;
		font-weight: 650;
	}
	.announcement i {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: #6ee7a0;
	}
	.announcement b {
		font-weight: 400;
	}
	.benchmark-link {
		display: flex;
		align-items: center;
		gap: 7px;
		color: #c9d4e694;
		font-size: 0.74rem;
		margin: 2.25rem 0 0;
	}
	.benchmark-link b {
		color: #c4cbd7;
		font-weight: 550;
	}
	.home-section {
		margin: 0;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
	}
	.infrastructure {
		padding: 8rem clamp(1.25rem, 7vw, 7.5rem);
		background: #07080b8a;
		-webkit-backdrop-filter: blur(5px);
		backdrop-filter: blur(5px);
	}
	.section-heading {
		display: grid;
		grid-template-columns: 1fr 1.15fr;
		gap: 100px;
		align-items: end;
	}
	.home-section h2 {
		font-size: 64px;
		line-height: 1.05;
		letter-spacing: -0.045em;
		font-weight: 600;
		margin: 0;
	}
	.section-heading > p,
	.customer-section > div > p {
		font-size: 16px;
		line-height: 1.8;
		color: #a1a7b2;
		margin: 0 0 7px;
	}
	.infrastructure-steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 65px;
		margin-top: 75px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
		padding-top: 35px;
	}
	.infrastructure-steps a {
		position: relative;
	}
	.infrastructure-steps small {
		font-family: 'Geist Mono', monospace;
		font-size: 10px;
		color: #7c8697;
	}
	.infrastructure-steps h3 {
		font-size: 18px;
		margin: 68px 0 16px;
		letter-spacing: -0.02em;
	}
	.infrastructure-steps p {
		font-size: 14px;
		line-height: 1.8;
		color: #989fac;
		max-width: 340px;
	}
	.infrastructure-steps a > :global(svg) {
		position: absolute;
		right: 0;
		top: 4px;
		color: #8b96a8;
		opacity: 0;
		transition: opacity 0.2s;
	}
	.infrastructure-steps a:hover > :global(svg) {
		opacity: 1;
	}
	.customer-section {
		padding: 7rem clamp(1.25rem, 7vw, 7.5rem);
		background: #07080b70;
		-webkit-backdrop-filter: blur(4px);
		backdrop-filter: blur(4px);
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		align-items: center;
		gap: 95px;
		min-height: 68svh;
	}
	.customer-section h2 {
		font-size: 62px;
	}
	.customer-section .button {
		margin-top: 25px;
		font-size: 12px;
		padding: 13px 20px;
	}
	.closing-section {
		padding: 7rem clamp(1.25rem, 7vw, 7.5rem);
		min-height: 31rem;
		background: #050608c2;
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);
		text-align: center;
	}
	.closing-section h2 {
		font-size: 57px;
	}
	.closing-section > p:not(.eyebrow) {
		font-size: 15px;
		line-height: 1.8;
		color: #9ba2af;
		margin: 26px 0;
	}
	.closing-section > div {
		display: flex;
		justify-content: center;
		gap: 12px;
		align-items: center;
	}
	.closing-section .button {
		padding: 12px 20px;
		font-size: 12px;
	}
	.install-command {
		display: flex;
		align-items: center;
		gap: 23px;
		padding: 12px 16px;
		border: 1px solid #292c32;
		border-radius: 99px;
		background: #08090b;
		font-size: 11px;
		white-space: nowrap;
	}
	.install-command > span {
		font-family: 'Geist Mono', monospace;
		font-size: 9px;
		color: #858e9d;
		letter-spacing: 0.08em;
	}
	.install-command code {
		color: #91bdc9;
		font-size: 11px;
	}
	.install-command > b {
		font-size: 10px;
		font-weight: 400;
		color: #b7bdc8;
	}
	.setup-guide {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 10px;
		color: #a0a6b1;
		margin-top: 26px;
	}
	.copy-fallback {
		display: block;
		user-select: all;
		margin: 14px auto;
		color: #c1c8d2;
		font-size: 11px;
	}
	@media (max-width: 1000px) {
		.home-section h2 {
			font-size: 50px;
		}
		.section-heading {
			gap: 50px;
		}
		.infrastructure-steps {
			gap: 35px;
		}
		.customer-section {
			gap: 50px;
		}
		.customer-section h2 {
			font-size: 48px;
		}
	}
	@media (max-width: 650px) {
		.benchmark-link {
			font-size: 9px;
			align-items: flex-start;
			line-height: 1.8;
		}
		.benchmark-link > span {
			max-width: 220px;
		}
		.section-heading,
		.customer-section {
			grid-template-columns: 1fr;
			gap: 30px;
		}
		.home-section h2 {
			font-size: 42px;
		}
		.section-heading > p,
		.customer-section > div > p {
			font-size: 14px;
		}
		.infrastructure-steps {
			grid-template-columns: 1fr;
			gap: 30px;
			margin-top: 45px;
			padding-top: 28px;
		}
		.infrastructure-steps h3 {
			margin-top: 18px;
		}
		.infrastructure-steps a {
			padding-bottom: 20px;
			border-bottom: 1px solid #202329;
		}
		.infrastructure-steps a > :global(svg) {
			opacity: 1;
		}
		.customer-section {
			min-height: 0;
		}
		.closing-section h2 {
			font-size: 37px;
		}
		.closing-section > p:not(.eyebrow) {
			font-size: 13px;
		}
		.closing-section > div {
			flex-direction: column;
			gap: 17px;
		}
		.install-command {
			gap: 15px;
			max-width: 100%;
			padding: 11px 13px;
		}
		.install-command code {
			font-size: 10px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.infrastructure-steps a > :global(svg) {
			transition: none;
		}
	}
	.hero-actions {
		display: flex;
		align-items: center;
	}
	.home-hero {
		display: grid;
		min-height: 100svh;
		align-items: center;
		padding: 8rem clamp(1.25rem, 7vw, 7.5rem) 5rem;
	}
	.hero-copy {
		width: min(51rem, 70vw);
	}
	.eyebrow {
		margin: 0 0 1.1rem;
		color: #c9d4e6a8;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: max(var(--text-floor, 0px), 0.68rem);
		font-weight: 700;
		letter-spacing: 0.16em;
	}
	.announcement {
		display: inline-flex;
		max-width: 100%;
		box-sizing: border-box;
		align-items: center;
		gap: 0.6rem;
		margin: 0 0 1.5rem;
		padding: 0.28rem 0.8rem 0.28rem 0.28rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 999px;
		color: #e7ebf2d1;
		background: #0a0c1094;
		font-size: 0.78rem;
		line-height: 1.35;
		text-decoration: none;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease,
			color 0.15s ease;
	}
	.announcement:hover {
		border-color: #ffffff47;
		color: #fff;
		background: #12151bd1;
	}
	.announcement:focus-visible {
		outline: 2px solid rgba(201, 212, 230, 0.7);
		outline-offset: 3px;
	}
	.announcement:hover :global(svg) {
		transform: translate(0.18rem);
	}
	.hero-copy h1 {
		text-wrap: pretty;
	}
	.hero-copy h1 {
		color: #f4f5f7;
	}
	.hero-copy h1 {
		max-width: 51rem;
		margin: 0;
		font-size: clamp(3.2rem, 6vw, 6.3rem);
		font-weight: 620;
		letter-spacing: -0.058em;
		line-height: 0.92;
	}
	.hero-lead {
		max-width: 42rem;
		margin: 2rem 0 0;
		color: #e0e5eeb8;
		font-size: clamp(1rem, 1.35vw, 1.24rem);
		line-height: 1.65;
	}
	.hero-actions {
		gap: 0.8rem;
		margin-top: 2rem;
	}
	.hero-actions a {
		padding: 0.9rem 1.25rem;
		border-radius: 999px;
		font-size: 0.84rem;
		font-weight: 650;
		text-decoration: none;
	}
	.secondary {
		border: 1px solid rgba(255, 255, 255, 0.16);
		color: #f4f5f7;
		background: #0a0c109e;
	}
	@media (prefers-reduced-motion: reduce) {
		.announcement {
			transition: none;
		}
		.announcement:hover :global(svg) {
			transform: none;
		}
	}
	@media (max-width: 820px) {
		.home-hero {
			min-height: 100svh;
			padding-top: 6.75rem;
			padding-bottom: 4rem;
		}
		.hero-copy {
			width: 100%;
		}
		.hero-copy h1 {
			font-size: clamp(3rem, 15vw, 5.5rem);
		}
	}
	@media (max-width: 480px) {
		.announcement {
			align-items: center;
			gap: 0.5rem;
			margin-bottom: 1.25rem;
			padding: 0.2rem 0.75rem 0.2rem 0.2rem;
			font-size: 0.8rem;
			line-height: 1;
			border-radius: 999px;
		}
		.home-hero {
			min-height: 100svh;
			padding-inline: 1rem;
		}
		.hero-copy h1 {
			font-size: clamp(2.85rem, 13.2vw, 4rem);
			line-height: 0.94;
		}
		.hero-lead {
			margin-top: 1.5rem;
			font-size: 0.94rem;
			line-height: 1.55;
		}
		.hero-actions {
			align-items: center;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 0.6rem;
			margin-top: 1.75rem;
		}
		.hero-actions a {
			display: inline-flex;
			min-height: 2.75rem;
			box-sizing: border-box;
			align-items: center;
			justify-content: center;
			padding: 0.6rem 1.1rem;
			text-align: center;
			white-space: nowrap;
		}
	}
</style>
