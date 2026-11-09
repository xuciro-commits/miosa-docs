<script lang="ts">
	import {
		ArrowRight,
		Play,
		BookOpen,
		Terminal,
		Box,
		Monitor,
		Layers,
		CodeXml,
		Network,
		Database,
		Coins,
		FileText,
		ExternalLink
	} from '@lucide/svelte';
	import DocsEntrance from '#lib/components/DocsEntrance.svelte';
	import CardDeck from '#lib/components/CardDeck.svelte';
	import ProductShowcase from '#lib/components/ProductShowcase.svelte';
	import InstallCommand from '#lib/components/InstallCommand.svelte';
	import { progress } from '#lib/learning.svelte.js';
	import { t } from '#lib/i18n.svelte.js';
	const tiles = [
		{
			titleKey: 'docs.landing.tile.quickstart.title',
			descriptionKey: 'docs.landing.tile.quickstart.description',
			href: '/docs/quickstart',
			icon: Terminal
		},
		{
			titleKey: 'docs.landing.tile.sandboxes.title',
			descriptionKey: 'docs.landing.tile.sandboxes.description',
			href: '/docs/sandboxes',
			icon: Box
		},
		{
			titleKey: 'docs.landing.tile.computers.title',
			descriptionKey: 'docs.landing.tile.computers.description',
			href: '/docs/computers',
			icon: Monitor
		},
		{
			titleKey: 'docs.landing.tile.agents.title',
			descriptionKey: 'docs.landing.tile.agents.description',
			href: '/docs/agents',
			icon: CodeXml
		},
		{
			titleKey: 'docs.landing.tile.deployments.title',
			descriptionKey: 'docs.landing.tile.deployments.description',
			href: '/docs/deployments',
			icon: Layers
		},
		{
			titleKey: 'docs.landing.tile.data.title',
			descriptionKey: 'docs.landing.tile.data.description',
			href: '/docs/data',
			icon: Database
		},
		{
			titleKey: 'docs.landing.tile.networking.title',
			descriptionKey: 'docs.landing.tile.networking.description',
			href: '/docs/networking',
			icon: Network
		},
		{
			titleKey: 'docs.landing.tile.api.title',
			descriptionKey: 'docs.landing.tile.api.description',
			href: '/docs/api',
			icon: FileText
		}
	];
	const audiences = [
		{
			href: '/docs/product-model',
			labelKey: 'docs.landing.audience.customers.label',
			titleKey: 'docs.landing.audience.customers.title',
			descriptionKey: 'docs.landing.audience.customers.description',
			ctaKey: 'docs.landing.audience.customers.cta'
		},
		{
			href: '/docs/agents',
			labelKey: 'docs.landing.audience.company.label',
			titleKey: 'docs.landing.audience.company.title',
			descriptionKey: 'docs.landing.audience.company.description',
			ctaKey: 'docs.landing.audience.company.cta'
		}
	];
	const learningCards = [
		{
			titleKey: 'docs.landing.learning.words.title',
			textKey: 'docs.landing.learning.words.description',
			href: '/docs/glossary',
			labelKey: 'docs.landing.learning.words.cta'
		},
		{
			titleKey: 'docs.landing.learning.games.title',
			textKey: 'docs.landing.learning.games.description',
			href: '/docs/learn/games',
			labelKey: 'docs.landing.learning.games.cta'
		},
		{
			titleKey: 'docs.landing.learning.videos.title',
			textKey: 'docs.landing.learning.videos.description',
			href: '/docs/learn/videos',
			labelKey: 'docs.landing.learning.videos.cta'
		}
	];
	const readingPath = [
		{ labelKey: 'docs.landing.reading.productModel', href: '/docs/product-model' },
		{ labelKey: 'docs.landing.reading.quickstart', href: '/docs/quickstart' },
		{ labelKey: 'docs.landing.reading.computers', href: '/docs/computers' },
		{ labelKey: 'docs.landing.reading.snapshots', href: '/docs/snapshots' },
		{ labelKey: 'docs.landing.reading.deployments', href: '/docs/deployments' }
	];
</script>

<DocsEntrance />
<div class="landing-hero">
	<div class="hero-main">
		<div class="hero-eyebrow">
			<span>{t('docs.landing.hero.eyebrow')}</span><button
				onclick={() => window.dispatchEvent(new Event('miosa:docs-entrance-replay'))}
				><Play size={9} fill="currentColor" />{t('docs.landing.hero.replay')}</button
			>
		</div>
		<h1 id="docs-landing-title" tabindex="-1">{t('docs.landing.hero.title')}</h1>
		<p class="hero-description">{t('docs.landing.hero.description')}</p>
		<div class="landing-actions">
			<a class="primary" href="/docs/quickstart"
				>{t('docs.landing.hero.start')}<ArrowRight size={14} /></a
			><a href="/docs/api">{t('docs.landing.hero.api')}</a>
		</div>
		<InstallCommand />
	</div>
	<CardDeck />
</div>
<section class="landing-earn" aria-label={t('docs.landing.earn.aria')}>
	<div class="earn-top">
		<span class="earn-icon"><Coins size={20} /></span>
		<div>
			<h2>{t('docs.landing.earn.title')}</h2>
			<p>{t('docs.landing.earn.description')}</p>
		</div>
		<a href="/docs/learn/earn"
			>{progress.credits > 0
				? t('docs.landing.earn.continue')
				: t('docs.landing.earn.start')}<ArrowRight size={13} /></a
		>
	</div>
	<div class="earn-meter">
		<div><span style={`width:${progress.credits}%`}></span></div>
		<b>${progress.credits} / $100</b>
	</div>
	<p class="local-progress">{t('docs.landing.earn.localProgress')}</p>
</section>
<ProductShowcase />
<div class="audience-grid">
	{#each audiences as item}<a href={item.href}
			><span>{t(item.labelKey)}</span>
			<h2>{t(item.titleKey)}</h2>
			<p>{t(item.descriptionKey)}</p>
			<b>{t(item.ctaKey)}<ArrowRight size={13} /></b></a
		>{/each}
</div>
<a
	class="landing-benchmark"
	href="https://miosa.ai/docs/benchmarks"
	target="_blank"
	rel="noreferrer"
	><span>{t('docs.landing.benchmark.label')}</span><b>57.1 ms</b>
	<p>{t('docs.landing.benchmark.description')}</p>
	<ArrowRight size={16} /></a
>
<section class="start-section">
	<p class="eyebrow">{t('docs.landing.blocks.eyebrow')}</p>
	<h2>{t('docs.landing.blocks.title')}</h2>
	<div class="start-grid">
		{#each tiles as tile}<a href={tile.href}
				><tile.icon size={19} strokeWidth={1.4} />
				<h3>{t(tile.titleKey)}</h3>
				<p>{t(tile.descriptionKey)}</p>
				<ArrowRight size={12} /></a
			>{/each}
	</div>
</section>
<a class="osa-strip" href="https://github.com/Miosa-osa" target="_blank" rel="noreferrer"
	><img src="/brand/osa-orb.png" alt="" />
	<div>
		<h2>{t('docs.landing.osa.title')}</h2>
		<p>{t('docs.landing.osa.description')}</p>
	</div>
	<span>{t('docs.landing.osa.cta')}<ExternalLink size={13} /></span></a
>
<section class="learning-section">
	<p class="eyebrow">{t('docs.landing.learning.eyebrow')}</p>
	<h2>{t('docs.landing.learning.title')}</h2>
	<div class="learn-grid">
		{#each learningCards as item}<a href={item.href}
				><BookOpen size={18} />
				<h3>{t(item.titleKey)}</h3>
				<p>{t(item.textKey)}</p>
				<span>{t(item.labelKey)}<ArrowRight size={12} /></span></a
			>{/each}
	</div>
	<h3 class="reading-heading">{t('docs.landing.reading.heading')}</h3>
	<ol class="reading-path">
		{#each readingPath as item, i}<li>
				<a href={item.href}><span>{i + 1}</span>{t(item.labelKey)}<ArrowRight size={12} /></a>
			</li>{/each}
	</ol>
</section>
<section class="machine-docs">
	<div>
		<p class="eyebrow">{t('docs.landing.machine.eyebrow')}</p>
		<h2>{t('docs.landing.machine.title')}</h2>
		<p>{t('docs.landing.machine.description')}</p>
	</div>
	<div class="machine-links">
		<a href="https://miosa.ai/llms.txt" target="_blank" rel="noreferrer">llms.txt<ArrowRight size={13} /></a><a
			href="https://miosa.ai/llms-full.txt"
			target="_blank"
			data-sveltekit-reload>{t('docs.landing.machine.fullContext')}<ArrowRight size={13} /></a
		><a href="https://miosa.ai/docs.md" target="_blank" data-sveltekit-reload
			>{t('docs.landing.machine.markdown')}<ArrowRight size={13} /></a
		>
	</div>
	<details>
		<summary>{t('docs.landing.machine.summary')}</summary>
		<p>{t('docs.landing.machine.body')}</p>
	</details>
</section>

<style>
	.landing-hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 26.5rem;
		align-items: center;
		gap: 2.5rem;
		padding: 50px 0 62px;
	}
	.hero-main {
		max-width: 38rem;
	}
	.hero-eyebrow {
		margin-bottom: 1.1rem;
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: var(--muted);
	}
	.hero-eyebrow button {
		display: flex;
		align-items: center;
		gap: 5px;
		letter-spacing: 0;
		border: 1px solid var(--border);
		border-radius: 99px;
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 560;
		white-space: nowrap;
	}
	h1 {
		font-size: clamp(2.6rem, 5.6vw, 4.25rem);
		line-height: 1;
		letter-spacing: -0.058em;
		font-weight: 590;
		margin: 0;
		white-space: nowrap;
		outline: 0;
	}
	.hero-description {
		font-size: clamp(1rem, 1.4vw, 1.0625rem);
		line-height: 1.65;
		color: var(--dt2);
		margin: 20px 0 25px;
	}
	.landing-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.landing-actions a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 18px;
		border: 1px solid var(--border);
		border-radius: 99px;
		font-size: 12px;
		font-weight: 550;
	}
	.landing-actions a.primary {
		background: var(--button);
		color: var(--button-text);
		border-color: var(--button);
	}
	.landing-earn {
		max-width: 835px;
		padding: 20px;
		border: 1px solid var(--border);
		border-radius: 17px;
		box-shadow: var(--shadow);
	}
	.earn-top {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.earn-icon {
		display: grid;
		place-items: center;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 12px;
		width: 44px;
		height: 44px;
		flex: none;
	}
	.earn-top h2 {
		font-size: 16px;
		margin: 0 0 5px;
		letter-spacing: -0.035em;
	}
	.earn-top p {
		font-size: 11px;
		color: var(--muted);
		margin: 0;
		line-height: 1.6;
	}
	.earn-top > a {
		display: flex;
		align-items: center;
		gap: 13px;
		border-radius: 99px;
		background: var(--button);
		color: var(--button-text);
		font-size: 11px;
		padding: 11px 18px;
		white-space: nowrap;
		margin-left: auto;
	}
	.earn-meter {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 20px 0 12px;
	}
	.earn-meter > div {
		height: 4px;
		background: var(--surface-3);
		border-radius: 99px;
		flex: 1;
		overflow: hidden;
	}
	.earn-meter span {
		display: block;
		height: 100%;
		background: var(--green);
	}
	.earn-meter b {
		font-size: 12px;
	}
	.local-progress {
		font-size: 11px;
		color: var(--muted);
		margin: 0;
		line-height: 1.6;
	}
	.audience-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
	}
	.audience-grid > a {
		border: 1px solid var(--border);
		border-radius: 13px;
		padding: 26px;
	}
	.audience-grid > a > span {
		font-size: 9px;
		letter-spacing: 0.09em;
		color: var(--muted);
	}
	.audience-grid h2 {
		font-size: 21px;
		letter-spacing: -0.035em;
		margin: 20px 0 10px;
	}
	.audience-grid p {
		font-size: 12px;
		line-height: 1.8;
		color: var(--muted);
		max-width: 300px;
	}
	.audience-grid b {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		margin-top: 25px;
		font-weight: 500;
	}
	.landing-benchmark {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
		margin: 40px 0;
		padding: 22px 0;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.landing-benchmark > span {
		font-size: 8px;
		letter-spacing: 0.06em;
		max-width: 150px;
		color: var(--muted);
	}
	.landing-benchmark b {
		font-size: 25px;
		letter-spacing: -0.05em;
		font-weight: 550;
	}
	.landing-benchmark p {
		font-size: 11px;
		color: var(--muted);
		margin: 0;
	}
	.landing-benchmark > :global(svg) {
		margin-left: auto;
	}
	.eyebrow {
		font-size: 10px;
		letter-spacing: 0.09em;
		color: var(--muted);
		font-weight: 600;
	}
	.start-section,
	.learning-section {
		margin: 60px 0;
	}
	.start-section > h2,
	.learning-section > h2 {
		font-size: 30px;
		font-weight: 600;
		letter-spacing: -0.045em;
		margin: 12px 0 25px;
	}
	.start-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		border-top: 1px solid var(--border);
		border-left: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.start-grid > a {
		padding: 23px 20px;
		border-right: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.start-grid > a:hover,
	.audience-grid > a:hover,
	.learn-grid > a:hover {
		background: var(--surface-2);
	}
	.start-grid :global(svg) {
		color: var(--muted);
	}
	.start-grid h3 {
		font-size: 13px;
		font-weight: 550;
		margin: 18px 0 7px;
	}
	.start-grid p {
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted);
		min-height: 40px;
	}
	.start-grid a > :global(svg):last-child {
		margin-top: 12px;
	}
	.osa-strip {
		display: flex;
		align-items: center;
		gap: 20px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 13px;
		padding: 25px;
	}
	.osa-strip img {
		width: 38px;
		height: 38px;
	}
	.osa-strip h2 {
		font-size: 17px;
		letter-spacing: -0.02em;
		margin: 0 0 5px;
	}
	.osa-strip p {
		font-size: 11px;
		color: var(--muted);
		margin: 0;
	}
	.osa-strip > span {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 10px;
		margin-left: auto;
		white-space: nowrap;
	}
	.learn-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	.learn-grid > a {
		padding: 24px 20px;
		border: 1px solid var(--border);
		border-radius: 12px;
	}
	.learn-grid h3 {
		font-size: 14px;
		margin: 20px 0 10px;
	}
	.learn-grid p {
		font-size: 11px;
		color: var(--muted);
		line-height: 1.8;
		min-height: 36px;
	}
	.learn-grid span {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 10px;
		margin-top: 20px;
	}
	.reading-heading {
		font-size: 15px;
		font-weight: 550;
		margin: 40px 0 16px;
	}
	.reading-path {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.reading-path a {
		display: flex;
		align-items: center;
		gap: 15px;
		border-top: 1px solid var(--border);
		padding: 13px 0;
		font-size: 12px;
	}
	.reading-path span {
		display: grid;
		place-items: center;
		border: 1px solid var(--border);
		border-radius: 50%;
		width: 23px;
		height: 23px;
		font-size: 10px;
		color: var(--muted);
	}
	.reading-path :global(svg) {
		margin-left: auto;
	}
	.machine-docs {
		padding: 30px 0;
		margin: 40px 0 10px;
		border-top: 1px solid var(--border);
	}
	.machine-docs h2 {
		font-size: 23px;
		letter-spacing: -0.035em;
		margin: 15px 0;
	}
	.machine-docs p {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.8;
		max-width: 680px;
	}
	.machine-links {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin: 0;
	}
	.machine-links > a {
		display: flex;
		align-items: center;
		gap: 13px;
		padding: 9px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		font-family: 'Geist Mono', monospace;
		font-size: 10px;
	}
	.machine-docs summary {
		cursor: pointer;
		font-size: 12px;
	}
	.machine-docs details {
		margin-top: 25px;
	}
	@media (max-width: 1280px) {
		.landing-hero {
			gap: 16px;
			grid-template-columns: minmax(0, 1.4fr) minmax(260px, 1fr);
		}
		.start-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 700px) {
		.landing-hero {
			display: block;
			padding: 12px 0 40px;
		}
		h1 {
			white-space: normal;
		}
		.earn-top {
			gap: 10px;
			flex-wrap: wrap;
		}
		.earn-top > div {
			flex: 1;
			min-width: 190px;
		}
		.earn-top > a {
			margin-left: 54px;
		}
		.earn-top h2 {
			font-size: 14px;
		}
		.landing-earn {
			padding: 17px;
		}
		.audience-grid,
		.learn-grid {
			grid-template-columns: 1fr;
		}
		.audience-grid > a {
			padding: 22px;
		}
		.landing-benchmark {
			gap: 14px;
		}
		.landing-benchmark p {
			width: 100%;
		}
		.osa-strip {
			padding: 20px;
			flex-wrap: wrap;
		}
		.osa-strip > div {
			flex: 1;
		}
		.osa-strip > span {
			margin-left: 58px;
		}
		.osa-strip h2 {
			font-size: 15px;
		}
		.start-grid > a {
			padding: 18px 15px;
		}
		.start-section > h2,
		.learning-section > h2 {
			font-size: 28px;
		}
		.learn-grid p {
			min-height: 0;
		}
		.learn-grid > a {
			padding: 22px;
		}
		.machine-docs h2 {
			font-size: 22px;
		}
	}
</style>
