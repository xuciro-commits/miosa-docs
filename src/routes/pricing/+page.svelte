<script lang="ts">
	import { Check, ArrowUpRight, ArrowRight } from '@lucide/svelte';
	import { i18n, t } from '#lib/i18n.svelte.js';
	import MarketingShell from '#lib/components/MarketingShell.svelte';
	import RateTable from '#lib/components/RateTable.svelte';
	import PriceComparison from '#lib/components/PriceComparison.svelte';
	import { priceBook, money } from '#lib/pricing.js';
	const plans = priceBook.plans;
	function planName(id: string, fallback: string) {
		const key = `marketing.pricing.planNames.${id}`;
		const value = t(key);
		return value === key ? fallback : value;
	}
	function planDescription(id: string) {
		return t(`marketing.pricing.plans.description.${id}`);
	}
	const featureRows = $derived([
		{ group: t('marketing.pricing.comparison.group.capacity') },
		{
			label: t('marketing.pricing.comparison.sandboxesAtOnce'),
			values: plans.map((plan) => plan.concurrency.sandboxes.toLocaleString())
		},
		{
			label: t('marketing.pricing.comparison.computersAtOnce'),
			values: plans.map((plan) => plan.concurrency.computers.toLocaleString())
		},
		{
			label: t('marketing.pricing.comparison.largestSandbox'),
			values: plans.map(
				(plan) => `${plan.max_sandbox.vcpu} vCPU / ${plan.max_sandbox.memory_mb / 1024} GB`
			)
		},
		{
			label: t('marketing.pricing.comparison.largestComputer'),
			values: plans.map(
				(plan) => `${plan.max_computer.vcpu} vCPU / ${plan.max_computer.memory_mb / 1024} GB`
			)
		},
		{
			label: t('marketing.pricing.comparison.runningMemory'),
			values: plans.map((plan) => `${plan.limits.running_ram_mb / 1024} GB`)
		},
		{
			label: t('marketing.pricing.comparison.runningVcpu'),
			values: plans.map((plan) => String(plan.limits.running_vcpu))
		},
		{ group: t('marketing.pricing.comparison.group.services') },
		{
			label: t('marketing.pricing.comparison.replicas'),
			values: plans.map((plan) => String(plan.limits.replicas_max))
		},
		{
			label: t('marketing.pricing.comparison.projects'),
			values: plans.map((plan) =>
				plan.limits.projects === null
					? t('marketing.pricing.comparison.unlimited')
					: String(plan.limits.projects)
			)
		},
		{
			label: t('marketing.pricing.comparison.databases'),
			values: plans.map((plan) =>
				plan.limits.databases === null
					? t('marketing.pricing.comparison.unlimited')
					: String(plan.limits.databases)
			)
		},
		{
			label: t('marketing.pricing.comparison.dedicatedVcpu'),
			values: plans.map((plan) =>
				plan.limits.dedicated_vcpu ? t('marketing.pricing.comparison.included') : '—'
			)
		},
		{ group: t('marketing.pricing.comparison.group.workspace') },
		{
			label: t('marketing.pricing.comparison.seats'),
			values: plans.map((plan) =>
				plan.limits.seats === null
					? t('marketing.pricing.comparison.unlimited')
					: String(plan.limits.seats)
			)
		},
		{
			label: t('marketing.pricing.comparison.egress'),
			values: plans.map((plan) => `${plan.limits.egress_gb_month} GB`)
		},
		{
			label: t('marketing.pricing.comparison.monthlyUsage'),
			values: plans.map((plan) =>
				money((plan.monthly_commitment_cents || plan.monthly_grant_credits) / 100, 0)
			)
		},
		{
			label: t('marketing.pricing.comparison.perResourceRates'),
			values: plans.map(() => t('marketing.pricing.comparison.sameRates'))
		},
		{
			label: t('marketing.pricing.comparison.zeroBalance'),
			values: plans.map((plan) =>
				plan.overage_enabled
					? t('marketing.pricing.comparison.meteredUsage')
					: t('marketing.pricing.comparison.computePauses')
			)
		}
	]);
	const faq = $derived([
		[t('marketing.pricing.faq.credit.question'), t('marketing.pricing.faq.credit.answer')],
		[t('marketing.pricing.faq.billing.question'), t('marketing.pricing.faq.billing.answer')],
		[t('marketing.pricing.faq.zero.question'), t('marketing.pricing.faq.zero.answer')],
		[t('marketing.pricing.faq.free.question'), t('marketing.pricing.faq.free.answer')],
		[t('marketing.pricing.faq.idle.question'), t('marketing.pricing.faq.idle.answer')],
		[t('marketing.pricing.faq.builds.question'), t('marketing.pricing.faq.builds.answer')]
	]);
	const commands = $derived([
		['miosa create', t('marketing.pricing.api.create')],
		['miosa exec', t('marketing.pricing.api.exec')],
		['miosa ssh', t('marketing.pricing.api.ssh')],
		['miosa preview create', t('marketing.pricing.api.preview')],
		['miosa prompt', t('marketing.pricing.api.prompt')],
		['miosa pause / resume', t('marketing.pricing.api.lifecycle')],
		['miosa files cp', t('marketing.pricing.api.files')],
		['miosa deploy', t('marketing.pricing.api.deploy')]
	]);
	const includedFeatures = $derived([
		t('marketing.pricing.included.webServices'),
		t('marketing.pricing.included.dataServices'),
		t('marketing.pricing.included.previews'),
		t('marketing.pricing.included.domains'),
		t('marketing.pricing.included.logs'),
		t('marketing.pricing.included.access')
	]);
	const otherRates = $derived([
		{
			name: t('marketing.pricing.other.disk'),
			price: t('marketing.pricing.other.perGiBMonth', {
				price: money(priceBook.resources.disk_usd_per_gib_month)
			}),
			note: t('marketing.pricing.other.diskNote')
		},
		{
			name: t('marketing.pricing.other.snapshots'),
			price: t('marketing.pricing.other.perGiBMonth', {
				price: money(priceBook.resources.snapshot_usd_per_gib_month, 3)
			}),
			note: t('marketing.pricing.other.snapshotsNote')
		},
		{
			name: t('marketing.pricing.other.objectStorage'),
			price: t('marketing.pricing.other.perGiBMonth', {
				price: money(priceBook.resources.object_storage_usd_per_gib_month, 4)
			}),
			note: t('marketing.pricing.other.objectStorageNote')
		},
		{
			name: t('marketing.pricing.other.egress'),
			price: t('marketing.pricing.other.perGb', {
				price: money(priceBook.resources.egress_usd_per_gb, 3)
			}),
			note: t('marketing.pricing.other.egressNote')
		},
		{
			name: t('marketing.pricing.other.builds'),
			price: priceBook.build.free
				? t('marketing.pricing.other.free')
				: t('marketing.pricing.other.metered'),
			note: t('marketing.pricing.other.buildNote')
		}
	]);
	const byocItems = $derived([
		{
			title: t('marketing.pricing.byoc.account.title'),
			text: t('marketing.pricing.byoc.account.text')
		},
		{
			title: t('marketing.pricing.byoc.bill.title'),
			text: t('marketing.pricing.byoc.bill.text')
		},
		{
			title: t('marketing.pricing.byoc.estimate.title'),
			text: t('marketing.pricing.byoc.estimate.text')
		}
	]);
	const rateSnapshotDate = $derived(
		new Intl.DateTimeFormat(i18n.locale === 'zh' ? 'zh-CN' : 'en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(new Date(priceBook.as_of))
	);
</script>

<svelte:head
	><title>{t('marketing.pricing.meta.title')}</title><meta
		name="description"
		content={t('marketing.pricing.meta.description')}
	/></svelte:head
>
<MarketingShell
	><div class="pricing-container">
		<header class="pricing-hero">
			<p class="eyebrow">{t('marketing.pricing.hero.eyebrow')}</p>
			<h1>
				{t('marketing.pricing.hero.titleLine1')}<br />
				{t('marketing.pricing.hero.titleLine2')}
			</h1>
			<p>{t('marketing.pricing.hero.lead')}</p>
		</header>
		<section class="plans-section" id="plans">
			<p class="eyebrow">{t('marketing.pricing.plans.eyebrow')}</p>
			<h2>{t('marketing.pricing.plans.title')}</h2>
			<p class="section-description">{t('marketing.pricing.plans.description')}</p>
			<div class="plan-grid">
				{#each plans as plan}<article class:featured={plan.id === 'developer'}>
						<div class="plan-top">
							<p class="plan-name">
								{planName(plan.id, plan.name)}{#if plan.id === 'developer'}<span
										>{t('marketing.pricing.plans.popular')}</span
									>{/if}
							</p>
							<div class="plan-price">
								<b>{money(plan.price_cents / 100, 0)}</b><small
									>{plan.price_cents
										? t('marketing.pricing.plans.perMonth')
										: t('marketing.pricing.plans.noMonthlyCharge')}</small
								>
							</div>
							<h3>
								{t(
									plan.concurrency.sandboxes === 1
										? 'marketing.pricing.plans.sandboxOne'
										: 'marketing.pricing.plans.sandboxesMany',
									{ count: plan.concurrency.sandboxes.toLocaleString() }
								)}
							</h3>
							<p class="plan-sub">
								{t(
									plan.concurrency.computers === 1
										? 'marketing.pricing.plans.computerOne'
										: 'marketing.pricing.plans.computersMany',
									{
										count: plan.concurrency.computers,
										vcpu: plan.max_sandbox.vcpu,
										memory: plan.max_sandbox.memory_mb / 1024
									}
								)}
							</p>
							<p class="plan-description">{planDescription(plan.id)}</p>
						</div>
						<div class="plan-features">
							<p>
								{plan.price_cents
									? t('marketing.pricing.plans.commitment', {
											amount: money(plan.monthly_commitment_cents / 100, 0)
										})
									: t('marketing.pricing.plans.grant', {
											amount: money(plan.monthly_grant_credits / 100, 0)
										})}
							</p>
							<ul>
								<li>
									<Check size={13} />{t('marketing.pricing.plans.runningTotal', {
										memory: plan.limits.running_ram_mb / 1024,
										vcpu: plan.limits.running_vcpu
									})}
								</li>
								<li>
									<Check size={13} />{t('marketing.pricing.plans.replicas', {
										count: plan.limits.replicas_max
									})}
								</li>
								<li>
									<Check size={13} />{t('marketing.pricing.plans.seats', {
										seats: plan.limits.seats ?? t('marketing.pricing.comparison.unlimited')
									})}
								</li>
								<li>
									<Check size={13} />{t('marketing.pricing.plans.egress', {
										amount:
											plan.limits.egress_gb_month >= 1000
												? `${plan.limits.egress_gb_month / 1000} TB`
												: `${plan.limits.egress_gb_month} GB`
									})}
								</li>
								<li><Check size={13} />{t('marketing.pricing.plans.sameRates')}</li>
								<li>
									<Check size={13} />{plan.overage_enabled
										? t('marketing.pricing.plans.metered')
										: t('marketing.pricing.plans.noOverage')}
								</li>
							</ul>
						</div>
						<a
							href={`https://miosa.ai/register${plan.id === 'free' ? '' : '?plan=' + plan.id}`}
							class="plan-button"
							>{plan.id === 'developer'
								? t('marketing.pricing.plans.startDeveloping')
								: t('marketing.pricing.plans.choosePlan', {
										plan: planName(plan.id, plan.name)
									})}<ArrowUpRight size={12} /></a
						>
					</article>{/each}
			</div>
			<div class="included">
				<h3>{t('marketing.pricing.included.title')}</h3>
				<ul>
					{#each includedFeatures as feature}<li>{feature}</li>{/each}
				</ul>
				<p>{t('marketing.pricing.included.dedicatedNote')}</p>
			</div>
		</section>
		<RateTable
			titleKey="marketing.pricing.rates.sandboxes.title"
			kind="sandbox"
			descriptionKey="marketing.pricing.rates.sandboxes.description"
		/><RateTable
			titleKey="marketing.pricing.rates.desktops.title"
			kind="computer"
			descriptionKey="marketing.pricing.rates.desktops.description"
		/><RateTable
			titleKey="marketing.pricing.rates.apps.title"
			kind="app"
			descriptionKey="marketing.pricing.rates.apps.description"
		/>
		<section class="other-rates">
			<h2>{t('marketing.pricing.other.title')}</h2>
			<p>{t('marketing.pricing.other.description')}</p>
			<div class="simple-table">
				<table>
					<tbody
						>{#each otherRates as row}<tr
								><td>{row.name}</td><td><b>{row.price}</b></td><td>{row.note}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
		</section>
		<section class="model-rates">
			<p class="eyebrow">{t('marketing.pricing.models.eyebrow')}</p>
			<h2>{t('marketing.pricing.models.title')}</h2>
			<p>{t('marketing.pricing.models.description')}</p>
			<div class="simple-table">
				<table>
					<thead
						><tr
							><th>{t('marketing.pricing.models.model')}</th><th
								>{t('marketing.pricing.models.input')}</th
							><th>{t('marketing.pricing.models.output')}</th><th
								>{t('marketing.pricing.models.context')}</th
							></tr
						></thead
					><tbody
						>{#each priceBook.ai.models as model}<tr
								><td
									><b>{model.name}</b>{#if model.default}<small
											>{t('marketing.pricing.models.default')}</small
										>{/if}</td
								><td>{money(model.input_usd_per_1m_tokens)}</td><td
									>{money(model.output_usd_per_1m_tokens)}</td
								><td>{model.context_window >= 1000000 ? '1M' : '256k'}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
		</section>
		<PriceComparison />
		<section class="api-section">
			<p class="eyebrow">{t('marketing.pricing.api.eyebrow')}</p>
			<h2>{t('marketing.pricing.api.title')}</h2>
			<div class="command-grid">
				{#each commands as [command, description]}<a href="/docs/cli"
						><code><span>$</span> {command}</code>
						<p>{description}</p>
						<ArrowUpRight size={13} /></a
					>{/each}
			</div>
			<p class="api-note">
				{t('marketing.pricing.api.notePrefix')}<a href="/docs/api"
					>{t('marketing.pricing.api.apiExplorer')}</a
				>{t('marketing.pricing.api.listSeparator')}<a href="/docs/sdks"
					>{t('marketing.pricing.api.sdkExamples')}</a
				>{t('marketing.pricing.api.orSeparator')}<a href="/docs/cli"
					>{t('marketing.pricing.api.cliGuide')}</a
				>{t('marketing.pricing.api.noteSuffix')}
			</p>
		</section>
		<section class="plan-comparison">
			<p class="eyebrow">{t('marketing.pricing.comparison.eyebrow')}</p>
			<h2>{t('marketing.pricing.comparison.title')}</h2>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable table region supports keyboard horizontal scrolling.) -->
			<div
				class="simple-table plan-table"
				tabindex="0"
				role="region"
				aria-label={t('marketing.pricing.comparison.regionLabel')}
			>
				<table>
					<thead
						><tr
							><th>{t('marketing.pricing.comparison.feature')}</th>{#each plans as plan}<th
									>{planName(plan.id, plan.name)}</th
								>{/each}</tr
						></thead
					><tbody
						>{#each featureRows as row}{#if 'group' in row}<tr class="feature-group"
									><td colspan="5">{row.group}</td></tr
								>{:else}<tr
									><td>{row.label}</td>{#each row.values as value}<td>{value}</td>{/each}</tr
								>{/if}{/each}</tbody
					>
				</table>
			</div>
		</section>
		<section class="byoc-section">
			<p class="eyebrow">{t('marketing.pricing.byoc.eyebrow')}</p>
			<h2>{t('marketing.pricing.byoc.title')}</h2>
			<p>{t('marketing.pricing.byoc.description')}</p>
			<div class="byoc-grid">
				{#each byocItems as item}<article>
						<h3>{item.title}</h3>
						<p>{item.text}</p>
					</article>{/each}
			</div>
			<a
				class="small-link"
				href="https://miosa.ai/docs/infrastructure/byoc/overview"
				target="_blank"
				rel="noreferrer">{t('marketing.pricing.byoc.link')}<ArrowUpRight size={12} /></a
			>
		</section>
		<section class="faq-section">
			<div>
				<p class="eyebrow">{t('marketing.pricing.faq.eyebrow')}</p>
				<h2>{t('marketing.pricing.faq.title')}</h2>
			</div>
			<div class="faq-list">
				{#each faq as [question, answer], i}<details open={i === 0}>
						<summary><span>{String(i + 1).padStart(2, '0')}</span>{question}<b>+</b></summary>
						<p>{answer}</p>
					</details>{/each}
			</div>
		</section>
		<p class="pricing-date">
			{t('marketing.pricing.date.prefix', { date: rateSnapshotDate })}<a
				href="https://miosa.ai/pricing"
				target="_blank"
				rel="noreferrer">{t('marketing.pricing.date.link')}</a
			>{t('marketing.pricing.date.suffix')}
		</p>
	</div></MarketingShell
>

<style>
	.plan-top {
		min-height: 232px;
		padding-bottom: 20px;
		border-bottom: 1px solid #242424;
	}
	.pricing-container {
		max-width: 1280px;
		margin: 0 auto;
		width: min(calc(100% - 48px), 1080px);
	}
	.eyebrow {
		font-family:
			Geist Mono,
			ui-monospace,
			SFMono-Regular,
			Menlo,
			monospace;
		font-size: max(var(--text-floor, 0px), 10px);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #777;
		font-weight: 650;
		margin: 0 0 18px;
	}
	.pricing-hero {
		padding: 118px 0 54px;
		border-bottom: none;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding-top: 132px;
		padding-bottom: 40px;
	}
	.pricing-hero h1 {
		font-size: clamp(46px, 6vw, 72px);
		letter-spacing: -0.06em;
		line-height: 0.94;
		font-weight: 540;
		margin: 0;
		color: #f5f5f5;
	}
	.pricing-hero > p:last-child {
		font-size: 15px;
		color: #8b8b8b;
		max-width: 570px;
		line-height: 1.65;
		margin: 28px 0 0;
	}
	.plans-section {
		padding: 70px 0 50px;
		border-top: 1px solid #292929;
	}
	h2 {
		font-size: 40px;
		letter-spacing: -0.035em;
		font-weight: 530;
		margin: 0 0 17px;
		line-height: 1.1;
	}
	.section-description {
		color: var(--muted);
		font-size: 13px;
		line-height: 1.8;
		max-width: 610px;
		margin-bottom: 35px;
	}
	.plan-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		border: 1px solid #292929;
		border-radius: var(--pr-radius-card);
		overflow: hidden;
		background: #292929;
		gap: 1px;
	}
	.plan-grid article {
		display: flex;
		flex-direction: column;
		padding: 30px 26px 26px;
		border-right: 0;
		position: relative;
		min-width: 0;
		min-height: 450px;
		background: #060709d1;
		transition: background 0.18s ease;
		-webkit-backdrop-filter: blur(15px);
		backdrop-filter: blur(15px);
	}
	.plan-grid article:last-child {
		border: 0;
	}
	.plan-grid article.featured {
		background: #111318e0;
		border-top: 0;
		padding-top: 27px;
	}
	.plan-name {
		font-size: max(var(--text-floor, 0px), 11px);
		font-weight: 400;
		margin: 0 0 13px;
		display: flex;
		align-items: center;
		gap: 7px;
		height: 18px;
	}
	.plan-name > span {
		display: inline-block;
		margin-left: 8px;
		padding: 3px 7px;
		font-size: max(var(--text-floor, 0px), 10px);
		color: #ddd;
		background: #303030;
		border-radius: var(--pr-radius-badge);
		line-height: 1;
	}
	.plan-price {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-bottom: 0;
	}
	.plan-price b {
		font-size: 39px;
		line-height: 1.5;
		font-weight: 520;
		letter-spacing: -0.055em;
		font-variant-numeric: tabular-nums;
		margin: 0;
		color: #f5f5f5;
	}
	.plan-price small {
		font-size: 9px;
		color: var(--faint);
	}
	.plan-top h3 {
		font-size: 16px;
		letter-spacing: -0.015em;
		margin: 0 0 9px;
		line-height: 1.5;
	}
	.plan-sub,
	.plan-description {
		font-size: 12px;
		line-height: 1.75;
		color: var(--muted);
		margin: 0 0 12px;
	}
	.plan-description {
		min-height: 0;
		max-width: 225px;
		margin: 12px 0 0;
		color: #8a8a8a;
		font-size: 12px;
		line-height: 1.5;
	}
	.plan-features {
		margin-top: auto;
		padding-top: 20px;
		border-top: 0;
	}
	.plan-features > p {
		font-size: 10px;
		color: var(--muted);
		min-height: 32px;
		line-height: 1.8;
		margin: 0 0 15px;
	}
	.plan-features ul {
		list-style: none;
		padding: 0;
		margin: 0 0 24px;
	}
	.plan-features li {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		font-size: 11px;
		line-height: 1.8;
		margin: 8px 0;
	}
	.plan-features li > :global(svg) {
		margin-top: 3px;
		color: var(--muted);
	}
	.plan-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		width: 100%;
		min-height: 37px;
		background: #eceef2;
		color: #101115;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 550;
	}
	.plan-button:hover {
		background: #fff;
	}
	.included {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 18px 22px;
		margin-top: 16px;
		background: #ffffff02;
	}
	.included h3 {
		font-size: 12px;
		font-weight: 550;
		letter-spacing: 0;
		margin: 0 0 12px;
	}
	.included ul {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 23px;
		list-style: none;
		margin: 0 0 15px;
		padding: 0;
	}
	.included li {
		font-size: 11px;
		color: var(--muted);
	}
	.included > p {
		font-size: 10px;
		color: var(--faint);
		margin: 0;
	}
	.other-rates,
	.model-rates,
	.api-section,
	.plan-comparison,
	.byoc-section {
		border-top: 1px solid var(--border);
		padding: 60px 0;
	}
	.other-rates h2 {
		font-size: 28px;
	}
	.other-rates > p,
	.model-rates > p:not(.eyebrow),
	.byoc-section > p:not(.eyebrow) {
		font-size: 12px;
		color: var(--muted);
		margin-bottom: 25px;
		line-height: 1.8;
	}
	.model-rates h2,
	.api-section h2,
	.plan-comparison h2,
	.byoc-section h2 {
		font-size: 34px;
	}
	.simple-table {
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: auto;
		background: #08090cf7;
	}
	.simple-table table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		white-space: nowrap;
		font-size: 12px;
	}
	.simple-table th {
		font-size: 10px;
		color: var(--faint);
		font-weight: 400;
		background: #ffffff03;
		padding: 12px 16px;
	}
	.simple-table td {
		padding: 14px 16px;
		border-top: 1px solid #272a3066;
		font-variant-numeric: tabular-nums;
	}
	.simple-table td b {
		font-weight: 500;
	}
	.simple-table td > small {
		font-size: 9px;
		margin-left: 8px;
		color: var(--faint);
		border: 1px solid var(--border);
		border-radius: 99px;
		padding: 1px 6px;
	}
	.other-rates td:first-child {
		width: 26%;
	}
	.other-rates td:nth-child(2) {
		width: 25%;
	}
	.other-rates td:last-child {
		color: var(--faint);
		font-size: 11px;
	}
	.command-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
	}
	.command-grid a {
		padding: 20px;
		position: relative;
		border-right: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.command-grid a:nth-child(even) {
		border-right: 0;
	}
	.command-grid a:nth-last-child(-n + 2) {
		border-bottom: 0;
	}
	.command-grid a:hover {
		background: #ffffff04;
	}
	.command-grid code {
		font-size: 12px;
	}
	.command-grid code > span {
		color: var(--faint);
		margin-right: 5px;
	}
	.command-grid p {
		font-size: 11px;
		color: var(--muted);
		margin: 9px 0 0;
	}
	.command-grid a > :global(svg) {
		position: absolute;
		right: 20px;
		top: 22px;
		color: var(--faint);
	}
	.api-note {
		font-size: 11px;
		color: var(--muted);
		margin-top: 22px;
	}
	.api-note a {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.plan-table table {
		min-width: 700px;
	}
	.plan-table th:first-child,
	.plan-table td:first-child {
		width: 30%;
	}
	.plan-table th:not(:first-child),
	.plan-table td:not(:first-child) {
		width: 17.5%;
	}
	.plan-table td {
		font-size: 11px;
	}
	.feature-group td {
		padding: 21px 16px 10px !important;
		font-size: 10px !important;
		color: var(--faint);
		font-weight: 500;
	}
	.byoc-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
	}
	.byoc-grid article {
		padding: 25px;
		border-right: 1px solid var(--border);
	}
	.byoc-grid article:last-child {
		border: 0;
	}
	.byoc-grid h3 {
		font-size: 14px;
		margin: 0 0 13px;
		letter-spacing: -0.015em;
	}
	.byoc-grid p {
		font-size: 12px;
		line-height: 1.8;
		color: var(--muted);
		margin: 0;
	}
	.small-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: var(--muted);
		margin-top: 20px;
	}
	.faq-section {
		padding: 65px 0;
		border-top: 1px solid var(--border);
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 70px;
	}
	.faq-section h2 {
		font-size: 37px;
	}
	.faq-list details {
		border-bottom: 1px solid var(--border);
	}
	.faq-list summary {
		display: flex;
		align-items: center;
		gap: 15px;
		list-style: none;
		padding: 20px 0;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
	}
	.faq-list summary::-webkit-details-marker {
		display: none;
	}
	.faq-list summary > span {
		font-family: 'Geist Mono', monospace;
		font-size: 9px;
		color: var(--faint);
	}
	.faq-list summary > b {
		margin-left: auto;
		color: var(--muted);
		font-size: 18px;
		font-weight: 300;
		transition: transform 0.2s;
	}
	.faq-list details[open] summary > b {
		transform: rotate(45deg);
	}
	.faq-list details > p {
		font-size: 12px;
		line-height: 1.9;
		color: var(--muted);
		padding: 0 28px 20px;
		margin: 0;
	}
	.pricing-date {
		font-size: 10px;
		color: var(--faint);
		line-height: 1.9;
		padding-bottom: 35px;
		max-width: 800px;
	}
	.pricing-date a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	@media (max-width: 1400px) {
		.plan-grid article {
			padding-left: 22px;
			padding-right: 22px;
		}
	}
	@media (max-width: 1000px) {
		.plan-grid {
			grid-template-columns: 1fr 1fr;
		}
		.plan-grid article:nth-child(2) {
			border-right: 0;
		}
		.plan-grid article:nth-child(-n + 2) {
			border-bottom: 1px solid var(--border);
		}
		.plan-description {
			min-height: 40px;
		}
		.pricing-hero h1 {
			font-size: 65px;
		}
		.faq-section {
			gap: 35px;
			grid-template-columns: 1fr 2fr;
		}
		.model-rates h2 {
			font-size: 32px;
		}
	}
	@media (max-width: 600px) {
		.pricing-hero {
			padding: 80px 0 40px;
		}
		.pricing-hero h1 {
			font-size: 46px;
			letter-spacing: -0.04em;
			line-height: 1.03;
		}
		.pricing-hero > p:last-child {
			font-size: 13px;
		}
		.eyebrow {
			font-size: 9px;
			margin-bottom: 20px;
		}
		.plans-section {
			padding: 45px 0 35px;
		}
		h2 {
			font-size: 32px;
		}
		.section-description {
			font-size: 12px;
		}
		.plan-grid {
			grid-template-columns: 1fr;
		}
		.plan-grid article {
			border-right: 0;
			border-bottom: 1px solid var(--border);
			padding: 25px;
		}
		.plan-grid article.featured {
			padding-top: 25px;
		}
		.plan-top h3 {
			font-size: 17px;
		}
		.plan-description {
			min-height: 0;
		}
		.plan-features {
			margin-top: 12px;
		}
		.plan-features > p {
			min-height: 0;
		}
		.plan-features ul {
			margin-bottom: 20px;
		}
		.plan-features li {
			font-size: 12px;
		}
		.plan-button {
			min-height: 42px;
		}
		.included {
			padding: 17px;
		}
		.included ul {
			gap: 8px 15px;
		}
		.included li {
			font-size: 10px;
		}
		.other-rates,
		.model-rates,
		.api-section,
		.plan-comparison,
		.byoc-section {
			padding: 42px 0;
		}
		.model-rates h2,
		.api-section h2,
		.plan-comparison h2,
		.byoc-section h2 {
			font-size: 29px;
		}
		.simple-table td,
		.simple-table th {
			font-size: 10px;
			padding: 12px;
		}
		.command-grid {
			grid-template-columns: 1fr;
		}
		.command-grid a {
			border-right: 0;
		}
		.command-grid a:nth-last-child(2) {
			border-bottom: 1px solid var(--border);
		}
		.byoc-grid {
			grid-template-columns: 1fr;
		}
		.byoc-grid article {
			padding: 22px;
			border-right: 0;
			border-bottom: 1px solid var(--border);
		}
		.faq-section {
			grid-template-columns: 1fr;
			gap: 18px;
			padding: 45px 0;
		}
		.faq-list summary {
			font-size: 12px;
		}
		.faq-list details > p {
			font-size: 11px;
			padding-left: 25px;
		}
		.faq-section h2 {
			font-size: 31px;
		}
	}
	@media (min-width: 941px) {
		.pricing-container {
			width: min(calc(100% - 48px), 1280px);
		}
	}
	.plan-grid article.featured:before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(214, 222, 238, 0.72), transparent);
	}
	.plan-grid article {
		position: relative;
	}
	.plan-grid article:hover {
		background: #080808;
	}
	.plan-grid article.featured:hover {
		background: #0d0e11;
	}
</style>
