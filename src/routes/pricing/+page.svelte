<script lang="ts">
	import { Check, ArrowUpRight, ArrowRight } from '@lucide/svelte';
	import MarketingShell from '#lib/components/MarketingShell.svelte';
	import RateTable from '#lib/components/RateTable.svelte';
	import PriceComparison from '#lib/components/PriceComparison.svelte';
	import { priceBook, money } from '#lib/pricing.js';
	const plans = priceBook.plans;
	const featureRows = [
		{ group: 'Capacity' },
		{
			label: 'Sandboxes at once',
			values: plans.map((plan) => plan.concurrency.sandboxes.toLocaleString())
		},
		{
			label: 'Computers at once',
			values: plans.map((plan) => plan.concurrency.computers.toLocaleString())
		},
		{
			label: 'Largest sandbox',
			values: plans.map(
				(plan) => `${plan.max_sandbox.vcpu} vCPU / ${plan.max_sandbox.memory_mb / 1024} GB`
			)
		},
		{
			label: 'Largest computer',
			values: plans.map(
				(plan) => `${plan.max_computer.vcpu} vCPU / ${plan.max_computer.memory_mb / 1024} GB`
			)
		},
		{
			label: 'Running memory',
			values: plans.map((plan) => `${plan.limits.running_ram_mb / 1024} GB`)
		},
		{ label: 'Running vCPU', values: plans.map((plan) => String(plan.limits.running_vcpu)) },
		{ group: 'Services' },
		{
			label: 'Replicas per service',
			values: plans.map((plan) => String(plan.limits.replicas_max))
		},
		{ label: 'Projects', values: plans.map((plan) => String(plan.limits.projects)) },
		{ label: 'Databases', values: plans.map((plan) => String(plan.limits.databases)) },
		{
			label: 'Dedicated vCPU',
			values: plans.map((plan) => (plan.limits.dedicated_vcpu ? 'Included' : '—'))
		},
		{ group: 'Workspace' },
		{
			label: 'Seats',
			values: plans.map((plan) =>
				plan.limits.seats === null ? 'Unlimited' : String(plan.limits.seats)
			)
		},
		{
			label: 'Egress allowance / month',
			values: plans.map((plan) => `${plan.limits.egress_gb_month} GB`)
		},
		{
			label: 'Included monthly usage',
			values: plans.map((plan) =>
				money((plan.monthly_commitment_cents || plan.monthly_grant_credits) / 100, 0)
			)
		},
		{ label: 'Per-resource rates', values: plans.map(() => 'Same rates') },
		{
			label: 'At a zero balance',
			values: plans.map((plan) => (plan.overage_enabled ? 'Metered usage' : 'Compute pauses'))
		}
	];
	const faq = [
		[
			'What is a credit?',
			'A credit is a unit of usage balance. In the captured MIOSA price book, one credit represents $0.01. The practice credits shown in this local documentation are separate and have no monetary value.'
		],
		[
			'How is usage billed?',
			'Compute is recorded by the second while the resource runs. A flat-size sandbox and a usage-metered service use different meters. Storage is separate, and a paid plan’s credited commitment acts as a monthly minimum.'
		],
		[
			'What happens at a $0 balance?',
			'The Free plan does not allow automatic overage. The published plan description says machines pause when the balance reaches zero; additional credit can be purchased on the official service.'
		],
		[
			'Is there a free plan?',
			'Yes. The captured rate sheet lists a $0 Free plan with a small monthly usage allowance and lower capacity limits. Check the comparison table for the exact published limits.'
		],
		[
			'Do idle sandboxes keep billing?',
			'A running sandbox is still a running resource. Pausing stops its compute meter, while retained disk or other persistent resources can continue to have their own charges.'
		],
		[
			'Do builds cost anything?',
			'The structured build-price field captured for this reconstruction marks builds as free. The original service controls actual billing; use its current price book when making a purchase.'
		]
	];
	const commands = [
		['miosa create', 'Create an isolated sandbox'],
		['miosa exec', 'Run a command'],
		['miosa ssh', 'Open a shell session'],
		['miosa preview create', 'Inspect a listening port'],
		['miosa prompt', 'Run an agent task'],
		['miosa pause / resume', 'Control a resource’s lifecycle'],
		['miosa files cp', 'Move a file or artifact'],
		['miosa deploy', 'Publish your application']
	];
</script>

<svelte:head
	><title>Pricing · MIOSA</title><meta
		name="description"
		content="Published plan and machine rates, with interactive workload and budget comparisons."
	/></svelte:head
>
<MarketingShell
	><div class="pricing-container">
		<header class="pricing-hero">
			<p class="eyebrow">MIOSA pricing</p>
			<h1>Pay per second<br /> for what you run.</h1>
			<p>Compute is billed while a machine runs. Stop the machine to stop its compute meter.</p>
		</header>
		<section class="plans-section" id="plans">
			<p class="eyebrow">Plans</p>
			<h2>Four plans. One price list.</h2>
			<p class="section-description">
				Begin with a small free allowance. Paid plans apply their monthly commitment toward resource
				usage.
			</p>
			<div class="plan-grid">
				{#each plans as plan}<article class:featured={plan.id === 'developer'}>
						<div class="plan-top">
							<p class="plan-name">
								{plan.name}{#if plan.id === 'developer'}<span>Popular</span>{/if}
							</p>
							<div class="plan-price">
								<b>{money(plan.price_cents / 100, 0)}</b><small
									>{plan.price_cents ? '/ mo.' : 'no monthly charge'}</small
								>
							</div>
							<h3>{plan.concurrency.sandboxes.toLocaleString()} sandboxes at once</h3>
							<p class="plan-sub">
								{plan.concurrency.computers}
								{plan.concurrency.computers === 1 ? 'computer' : 'computers'} · up to {plan
									.max_sandbox.vcpu} vCPU / {plan.max_sandbox.memory_mb / 1024} GB per machine
							</p>
							<p class="plan-description">
								{plan.id === 'free'
									? 'A small workspace for a first experiment.'
									: plan.id === 'developer'
										? 'Room for development, prototypes and agent workloads.'
										: plan.id === 'business'
											? 'Higher limits for teams running production workloads.'
											: 'The largest published capacity and workspace limits.'}
							</p>
						</div>
						<div class="plan-features">
							<p>
								{plan.price_cents
									? `${money(plan.monthly_commitment_cents / 100, 0)} a month, credited toward usage`
									: `${money(plan.monthly_grant_credits / 100, 0)} of usage each month`}
							</p>
							<ul>
								<li>
									<Check size={13} />Running total: {plan.limits.running_ram_mb / 1024} GB · {plan
										.limits.running_vcpu} vCPU
								</li>
								<li><Check size={13} />Replicas per service: {plan.limits.replicas_max}</li>
								<li><Check size={13} />Seats: {plan.limits.seats ?? 'Unlimited'}</li>
								<li>
									<Check size={13} />Egress / month: {plan.limits.egress_gb_month >= 1000
										? `${plan.limits.egress_gb_month / 1000} TB`
										: `${plan.limits.egress_gb_month} GB`}
								</li>
								<li><Check size={13} />Same resource rates across plans</li>
								<li>
									<Check size={13} />{plan.overage_enabled
										? 'Usage beyond the commitment is metered.'
										: 'No automatic overage at a zero balance.'}
								</li>
							</ul>
						</div>
						<a
							href={`https://miosa.ai/register${plan.id === 'free' ? '' : '?plan=' + plan.id}`}
							class="plan-button"
							>{plan.id === 'developer' ? 'Start developing' : `Choose ${plan.name}`}<ArrowUpRight
								size={12}
							/></a
						>
					</article>{/each}
			</div>
			<div class="included">
				<h3>Included on every plan</h3>
				<ul>
					{#each ['Web services, workers and schedules', 'Managed data services', 'Pull-request previews', 'Custom domains', 'Logs and metrics', 'Access protection'] as feature}<li
						>
							{feature}
						</li>{/each}
				</ul>
				<p>Business and Enterprise include dedicated vCPU sizes.</p>
			</div>
		</section>
		<RateTable
			title="Sandboxes"
			kind="sandbox"
			description="A flat compute rate for each size, measured by the second while it runs."
		/><RateTable
			title="Desktops"
			kind="computer"
			description="The same resource model, with a desktop for visual work and shared sessions."
		/><RateTable
			title="Apps & databases"
			kind="app"
			description="Measured CPU and memory usage, with a full-size ceiling."
		/>
		<section class="other-rates">
			<h2>Everything else</h2>
			<p>Persistent resources have their own meter, separate from running compute.</p>
			<div class="simple-table">
				<table>
					<tbody
						>{#each [['Disk', money(priceBook.resources.disk_usd_per_gib_month) + '/ GiB-month', 'Provisioned persistent disk'], ['Snapshots', money(priceBook.resources.snapshot_usd_per_gib_month, 3) + '/ GiB-month', 'Stored snapshot data'], ['Object storage', money(priceBook.resources.object_storage_usd_per_gib_month, 4) + '/ GiB-month', 'Stored application artifacts'], ['Outbound transfer', money(priceBook.resources.egress_usd_per_gb, 3) + '/ GB', 'Network egress'], ['Builds', priceBook.build.free ? 'Free' : 'Metered', 'Structured rate-book setting']] as [name, price, note]}<tr
								><td>{name}</td><td><b>{price}</b></td><td>{note}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
		</section>
		<section class="model-rates">
			<p class="eyebrow">Models</p>
			<h2>Models, priced per million tokens.</h2>
			<p>Input and output have separate rates. The model’s context window is a capacity limit.</p>
			<div class="simple-table">
				<table>
					<thead
						><tr><th>Model</th><th>Input / 1M</th><th>Output / 1M</th><th>Context</th></tr></thead
					><tbody
						>{#each priceBook.ai.models as model}<tr
								><td
									><b>{model.name}</b>{#if model.default}<small>Default</small>{/if}</td
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
			<p class="eyebrow">For developers</p>
			<h2>Simple API</h2>
			<div class="command-grid">
				{#each commands as [command, description]}<a href="/docs/cli"
						><code><span>$</span> {command}</code>
						<p>{description}</p>
						<ArrowUpRight size={13} /></a
					>{/each}
			</div>
			<p class="api-note">
				Continue with the <a href="/docs/api">API explorer</a>,
				<a href="/docs/sdks">SDK examples</a>, or <a href="/docs/cli">CLI guide</a>.
			</p>
		</section>
		<section class="plan-comparison">
			<p class="eyebrow">Capacity</p>
			<h2>Compare plans</h2>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable table region supports keyboard horizontal scrolling.) -->
			<div
				class="simple-table plan-table"
				tabindex="0"
				role="region"
				aria-label="Plan feature comparison"
			>
				<table>
					<thead
						><tr
							><th>Feature</th>{#each plans as plan}<th>{plan.name}</th>{/each}</tr
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
			<p class="eyebrow">Your infrastructure</p>
			<h2>Run MIOSA on your own cloud</h2>
			<p>Keep the resource model while choosing where the work runs.</p>
			<div class="byoc-grid">
				{#each [{ title: 'Your account', text: 'Keep the cloud resources in the account your organization owns.' }, { title: 'Your cloud bill', text: 'Compute and storage remain visible on the infrastructure provider’s bill.' }, { title: 'Get an estimate', text: 'Confirm the control-plane contract and capacity requirements before deploying.' }] as item}<article
					>
						<h3>{item.title}</h3>
						<p>{item.text}</p>
					</article>{/each}
			</div>
			<a
				class="small-link"
				href="https://miosa.ai/docs/infrastructure/byoc/overview"
				target="_blank"
				rel="noreferrer">Read the official BYOC guide<ArrowUpRight size={12} /></a
			>
		</section>
		<section class="faq-section">
			<div>
				<p class="eyebrow">FAQ</p>
				<h2>Questions</h2>
			</div>
			<div class="faq-list">
				{#each faq as [question, answer], i}<details open={i === 0}>
						<summary><span>{String(i + 1).padStart(2, '0')}</span>{question}<b>+</b></summary>
						<p>{answer}</p>
					</details>{/each}
			</div>
		</section>
		<p class="pricing-date">
			Rate snapshot: {new Date(priceBook.as_of).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				timeZone: 'UTC'
			})}. This is a local interface reconstruction. Account and plan actions continue on
			<a href="https://miosa.ai/pricing" target="_blank" rel="noreferrer">miosa.ai</a>.
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
