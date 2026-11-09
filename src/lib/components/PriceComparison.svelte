<script lang="ts">
	import {
		products,
		sizes,
		sessionCounts,
		sessionHours,
		peakCounts,
		busyFractions,
		budgets,
		budgetPresets,
		providers,
		hourlyComparison,
		monthlyComparison,
		budgetComparison,
		money,
		type Product
	} from '#lib/pricing.js';
	import { i18n, t } from '#lib/i18n.svelte.js';
	import Segmented from './Segmented.svelte';
	let product = $state<Product>('sandbox');
	let sizeIndex = $state(1);
	let mode = $state('workload');
	let sessionIndex = $state(3);
	let hours = $state(0.5);
	let peak = $state(50);
	let busy = $state(0.5);
	let budgetIndex = $state(5);
	let presetId = $state('coding');
	let showAll = $state(false);
	const size = $derived(sizes[sizeIndex]);
	const sessions = $derived(sessionCounts[sessionIndex]);
	const effectiveMode = $derived(product === 'app' || product === 'database' ? 'workload' : mode);
	const hourly = $derived(hourlyComparison(product, size));
	const monthly = $derived(monthlyComparison(product, size, sessions, hours, peak, busy));
	const preset = $derived(budgetPresets.find((preset) => preset.id === presetId)!);
	const budget = $derived(budgets[budgetIndex]);
	const capacity = $derived(budgetComparison(product, budget, preset, busy));
	const results = $derived(effectiveMode === 'workload' ? monthly.rows : capacity);
	const own = $derived(results.find((row) => row.miosa));
	const maxHour = $derived(Math.max(...hourly.map((row) => row.value ?? 0), 0.001));
	const maxResult = $derived(Math.max(...results.map((row) => row.value ?? 0), 0.001));
	const visible = $derived(showAll ? results : results.slice(0, 10));

	const productOptions = $derived(
		products.map((item) => ({
			value: item.id,
			label: t(`marketing.pricing.comparison.products.${item.id}`)
		}))
	);
	const sizeOptions = $derived(
		sizes.map((item, index) => ({
			value: index,
			label: `${item.vcpu} vCPU · ${item.ramGib} GB`,
			detail: t('marketing.pricing.comparison.disk', { disk: item.diskGib })
		}))
	);
	const sessionOptions = $derived(
		sessionHours.map((value) => ({ value, label: durationLabel(value) }))
	);
	const peakOptions = $derived(peakCounts.map((value) => ({ value, label: compactLabel(value) })));
	const workloadModes = $derived([
		{ value: 'workload', label: t('marketing.pricing.comparison.costWorkload') },
		{ value: 'budget', label: t('marketing.pricing.comparison.workloadsBudget') }
	]);
	const presetOptions = $derived(
		budgetPresets.map((item) => ({ value: item.id, label: presetLabel(item.id, item.label) }))
	);
	const busyOptions = $derived(
		busyFractions.map((value) => ({ value, label: Math.round(value * 100) + '%' }))
	);

	const tagKeys: Record<string, string> = {
		'flat per size': 'marketing.pricing.comparison.tags.flatPerSize',
		'full size': 'marketing.pricing.comparison.tags.fullSize',
		'by memory, while active': 'marketing.pricing.comparison.tags.byMemoryActive',
		'active CPU': 'marketing.pricing.comparison.tags.activeCpu',
		'active CPU · used RAM': 'marketing.pricing.comparison.tags.activeCpuUsedRam',
		'per compute unit': 'marketing.pricing.comparison.tags.perComputeUnit',
		'Flat per size': 'marketing.pricing.comparison.tags.miosaFlat',
		'Never more than': 'marketing.pricing.comparison.tags.miosaNeverMore',
		'Used CPU and memory, capped': 'marketing.pricing.comparison.tags.miosaUsedCapped',
		'Including disk and plan capacity': 'marketing.pricing.comparison.tags.miosaIncludingDisk'
	};
	const noteKeys: Record<string, string> = {
		'No matching size in the published reference':
			'marketing.pricing.comparison.notes.noMatchingSize',
		'No matching size': 'marketing.pricing.comparison.notes.noMatchingSizeShort',
		'Extra disk is not priced in this reference':
			'marketing.pricing.comparison.notes.extraDiskUnpriced',
		'Disk is not priced on the source page': 'marketing.pricing.comparison.notes.diskUnpriced',
		'Exceeds a listed plan or session limit; a custom plan may be required':
			'marketing.pricing.comparison.notes.exceedsPlan',
		'Above the capacity of listed plans; contact the provider':
			'marketing.pricing.comparison.notes.aboveCapacity',
		'Free plan usage rules apply': 'marketing.pricing.comparison.notes.freePlanRules',
		'No workloads fit this budget': 'marketing.pricing.comparison.notes.noWorkloadsFit',
		'No listed plan fits this budget and workload':
			'marketing.pricing.comparison.notes.noListedPlanFits',
		'a compute unit is about 1 vCPU and 4 GB': 'marketing.pricing.comparison.notes.computeUnit'
	};
	const presetKeys: Record<string, string> = {
		coding: 'marketing.pricing.comparison.presets.coding',
		'always-on': 'marketing.pricing.comparison.presets.alwaysOn',
		evals: 'marketing.pricing.comparison.presets.evals',
		rollouts: 'marketing.pricing.comparison.presets.rollouts',
		ci: 'marketing.pricing.comparison.presets.ci',
		users: 'marketing.pricing.comparison.presets.users'
	};

	function presetLabel(id: string, fallback: string) {
		const key = presetKeys[id];
		return key ? t(key) : fallback;
	}
	function planDisplayName(name: string) {
		const key = `marketing.pricing.planNames.${name.toLowerCase()}`;
		const translated = t(key);
		return translated === key ? name : translated;
	}
	function translateTag(tag: string) {
		const key = tagKeys[tag];
		return key ? t(key) : tag;
	}
	function translateNote(note: string) {
		const direct = noteKeys[note];
		if (direct) return t(direct);
		const nearest = note.match(/^Nearest: (.+)$/);
		if (nearest) return t('marketing.pricing.comparison.notes.nearest', { size: nearest[1] });
		const credited = note.match(/^(.+): (\$[\d,]+)\/mo, credited toward usage$/);
		if (credited)
			return t('marketing.pricing.comparison.notes.creditedTowardUsage', {
				plan: planDisplayName(credited[1]),
				amount: credited[2]
			});
		const fixedFee = note.match(/^(\$[\d,]+)\/mo (usage minimum|plan fee shown separately)$/);
		if (fixedFee)
			return t(
				fixedFee[2] === 'usage minimum'
					? 'marketing.pricing.comparison.notes.usageMinimumAmount'
					: 'marketing.pricing.comparison.notes.planFeeShown',
				{ amount: fixedFee[1] }
			);
		const usageMinimum = note.match(/^(.+) usage minimum$/);
		if (usageMinimum)
			return t('marketing.pricing.comparison.notes.usageMinimumPlan', {
				plan: planDisplayName(usageMinimum[1])
			});
		return note;
	}
	function compactLabel(value: number) {
		if (value === Infinity) return t('marketing.pricing.comparison.compactBackToBack');
		return new Intl.NumberFormat(i18n.locale === 'zh' ? 'zh-CN' : 'en-US', {
			notation: value >= 10_000 ? 'compact' : 'standard',
			maximumFractionDigits: 1
		}).format(value);
	}
	function durationLabel(hoursValue: number) {
		if (hoursValue === Infinity) return t('marketing.pricing.comparison.duration.always');
		if (hoursValue < 1)
			return t('marketing.pricing.comparison.duration.minutes', {
				minutes: Math.round(hoursValue * 60)
			});
		if (hoursValue <= 24)
			return t('marketing.pricing.comparison.duration.hours', { hours: hoursValue });
		return t('marketing.pricing.comparison.duration.days', {
			days: +(hoursValue / 24).toFixed(1)
		});
	}
	function formatChecked(value: string) {
		return new Intl.DateTimeFormat(i18n.locale === 'zh' ? 'zh-CN' : 'en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(new Date(`${value}T00:00:00Z`));
	}
</script>

<section
	id="comparison"
	class="price-comparison"
	aria-label={t('marketing.pricing.comparison.ariaLabel')}
>
	<h2>{t('marketing.pricing.comparison.heading')}</h2>
	<p class="comparison-intro">{t('marketing.pricing.comparison.intro')}</p>
	<Segmented
		label={t('marketing.pricing.comparison.product')}
		options={productOptions}
		bind:value={product}
	/><Segmented
		label={t('marketing.pricing.comparison.resourcesPerMachine')}
		options={sizeOptions}
		bind:value={sizeIndex}
	/>
	<div class="comparison-block">
		<h3>{t('marketing.pricing.comparison.perHour')}</h3>
		<ol class="hourly-results">
			{#each hourly as row}<li class:own={row.miosa}>
					<div>
						<b>{row.name}</b><small
							>{row.notes[0] ? translateNote(row.notes[0]) : translateTag(row.tag)}</small
						>
					</div>
					<span class="comparison-bar"
						><i
							style={`width:${row.value === null ? 0 : Math.max(2, (row.value / maxHour) * 100)}%`}
						></i></span
					><strong
						>{row.value === null
							? t('marketing.pricing.comparison.notListed')
							: money(row.value, 3) + '/h'}</strong
					><span class="ratio"
						>{row.value !== null && hourly.find((item) => item.miosa)?.value
							? (row.value / hourly.find((item) => item.miosa)!.value!).toFixed(1) + 'x'
							: '—'}</span
					>
				</li>{/each}
		</ol>
	</div>
	<div class="comparison-block calculator">
		<h3>{t('marketing.pricing.comparison.perMonth')}</h3>
		{#if product === 'sandbox' || product === 'desktop'}<Segmented
				label={t('marketing.pricing.comparison.compare')}
				options={workloadModes}
				bind:value={mode}
			/>{/if}{#if effectiveMode === 'workload'}<div class="range-field">
				<label for="pricing-sessions">{t('marketing.pricing.comparison.sessionsPerMonth')}</label
				><input
					id="pricing-sessions"
					type="range"
					min="0"
					max={sessionCounts.length - 1}
					step="1"
					bind:value={sessionIndex}
				/><output for="pricing-sessions">{compactLabel(sessions)}</output>
			</div>
			<Segmented
				label={t('marketing.pricing.comparison.session')}
				options={sessionOptions}
				bind:value={hours}
			/><Segmented
				label={t('marketing.pricing.comparison.peakMachines')}
				options={peakOptions}
				bind:value={peak}
			/>
			<p class="calculator-hint">
				{t('marketing.pricing.comparison.workloadHint', {
					mode:
						sessions === Infinity
							? t('marketing.pricing.comparison.backToBack')
							: t('marketing.pricing.comparison.upToAtOnce', {
									machines: compactLabel(monthly.load.machines)
								}),
					hours: compactLabel(monthly.load.totalHours)
				})}
			</p>{:else}<div class="range-field">
				<label for="pricing-budget">{t('marketing.pricing.comparison.budgetPerMonth')}</label><input
					id="pricing-budget"
					type="range"
					min="0"
					max={budgets.length - 1}
					step="1"
					bind:value={budgetIndex}
				/><output for="pricing-budget">{money(budget, 0)}</output>
			</div>
			<Segmented
				label={t('marketing.pricing.comparison.workload')}
				options={presetOptions}
				bind:value={presetId}
			/>
			<p class="calculator-hint">
				{t('marketing.pricing.comparison.workloadDetails', {
					hours: durationLabel(preset.hours),
					vcpu: preset.size.vcpu,
					ram: preset.size.ramGib,
					disk: preset.size.diskGib
				})}
			</p>{/if}<Segmented
			label={t('marketing.pricing.comparison.cpuBusy')}
			options={busyOptions}
			bind:value={busy}
		/>
		<p class="calculator-hint">{t('marketing.pricing.comparison.cpuNote')}</p>
		<div class="calculated-total" aria-live="polite">
			<div>
				<b
					>{effectiveMode === 'workload'
						? own?.value !== null && own?.value !== undefined
							? money(own.value)
							: t('marketing.pricing.comparison.noListedSize')
						: compactLabel(own?.value ?? 0)}</b
				><span
					>{effectiveMode === 'workload'
						? t('marketing.pricing.comparison.perMonthOnMiosa')
						: preset.hours === Infinity
							? t('marketing.pricing.comparison.alwaysOnAgents')
							: t('marketing.pricing.comparison.sessionsOnMiosa')}</span
				>
			</div>
			{#if effectiveMode === 'workload'}<p>
					{t('marketing.pricing.comparison.formula', {
						load:
							sessions === Infinity
								? t('marketing.pricing.comparison.machines730', {
										count: compactLabel(monthly.load.machines)
									})
								: t('marketing.pricing.comparison.sessionsTimes', {
										sessions: compactLabel(sessions),
										duration: durationLabel(hours)
									}),
						rate: money(monthly.compute / (monthly.load.totalHours || 1), 4),
						compute: money(monthly.compute),
						disk: money(monthly.disk)
					})}
				</p>
				{#if !monthly.plan}<p class="capacity-note">
						{t('marketing.pricing.comparison.capacityNote')}
					</p>{/if}{/if}{#each own?.notes ?? [] as note}<p>{translateNote(note)}</p>{/each}
		</div>
		<ol class="monthly-results">
			{#each visible as row, i}<li class:own={row.miosa}>
					<span class="rank">{i + 1}</span>
					<div class="result-name">
						<b>{row.name}</b><small>{translateTag(row.tag)}</small>
					</div>
					<div class="result-value">
						<strong
							>{row.value === null
								? t('marketing.pricing.comparison.notAvailable')
								: effectiveMode === 'workload'
									? money(row.value)
									: compactLabel(row.value)}</strong
						><small
							>{effectiveMode === 'workload'
								? t('marketing.pricing.comparison.monthSuffix')
								: preset.hours === Infinity
									? t('marketing.pricing.comparison.agents')
									: t('marketing.pricing.comparison.sessions')}</small
						>
					</div>
					<span class="comparison-bar"
						><i
							style={`width:${row.value === null ? 0 : Math.max(1.5, (row.value / maxResult) * 100)}%`}
						></i></span
					>{#if row.notes.length}<p>{row.notes.map(translateNote).join(' · ')}</p>{/if}
				</li>{/each}
		</ol>
		{#if results.length > 10}<button class="show-all" onclick={() => (showAll = !showAll)}
				>{showAll
					? t('marketing.pricing.comparison.showFewer')
					: t('marketing.pricing.comparison.showAll', { count: results.length })}</button
			>{/if}
	</div>
	<details class="comparison-method">
		<summary
			>{t('marketing.pricing.comparison.sources')}
			<span>{providers.filter((provider) => provider.products.includes(product)).length}</span
			></summary
		>
		<p>{t('marketing.pricing.comparison.methodOne')}</p>
		<p>{t('marketing.pricing.comparison.methodTwo')}</p>
		<ul>
			{#each providers.filter((provider) => provider.products.includes(product)) as provider}<li>
					<a href={provider.source} target="_blank" rel="noreferrer">{provider.name}</a><small
						>{t('marketing.pricing.comparison.checked', {
							date: formatChecked(provider.checked)
						})}</small
					>
				</li>{/each}
		</ul>
	</details>
</section>

<style>
	.price-comparison {
		padding: 75px 0;
		border-top: 1px solid var(--border);
	}
	h2 {
		font-size: 36px;
		letter-spacing: -0.035em;
		margin: 0 0 18px;
	}
	.comparison-intro {
		font-size: 13px;
		color: var(--muted);
		margin-bottom: 26px;
	}
	.comparison-block {
		border: 1px solid var(--border);
		border-radius: 13px;
		padding: 24px;
		margin-top: 23px;
		background: #090a0c88;
	}
	h3 {
		font-size: 16px;
		letter-spacing: -0.015em;
		margin: 0 0 22px;
	}
	.hourly-results,
	.monthly-results {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.hourly-results > li {
		display: flex;
		align-items: center;
		gap: 22px;
		min-height: 53px;
		padding: 8px 10px;
		border: 1px solid transparent;
		border-radius: 10px;
	}
	.hourly-results li > div {
		width: 215px;
		flex: none;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.hourly-results b,
	.monthly-results b {
		font-weight: 500;
		font-size: 13px;
	}
	.hourly-results small,
	.monthly-results small {
		font-size: 11px;
		color: var(--faint);
		line-height: 1.5;
	}
	.comparison-bar {
		display: block;
		height: 6px;
		background: #ffffff06;
		border-radius: 99px;
		overflow: hidden;
		flex: 1;
	}
	.comparison-bar i {
		display: block;
		height: 100%;
		background: #606776;
		border-radius: 99px;
		transition: width 0.3s;
	}
	.hourly-results strong {
		font-size: 12px;
		min-width: 92px;
		text-align: right;
		font-weight: 600;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.ratio {
		font-size: 11px;
		color: var(--faint);
		width: 34px;
		text-align: right;
	}
	.own {
		background: #ffffff0b !important;
		border-color: #45474e !important;
	}
	.own .comparison-bar i {
		background: #eceef3;
	}
	.range-field {
		display: grid;
		grid-template-columns: 155px 1fr 160px;
		align-items: center;
		gap: 15px;
		margin: 25px 0;
		font-size: 12px;
	}
	.range-field label {
		color: var(--muted);
	}
	.range-field input {
		width: 100%;
		accent-color: #f1f2f5;
		cursor: pointer;
	}
	.range-field output {
		text-align: right;
		font-size: 13px;
		font-weight: 550;
		font-variant-numeric: tabular-nums;
	}
	.calculator-hint {
		font-size: 11px;
		color: var(--faint);
		margin: 11px 0 20px;
	}
	.calculated-total {
		border-top: 1px solid var(--border);
		padding-top: 23px;
		margin: 25px 0;
	}
	.calculated-total > div {
		display: flex;
		align-items: baseline;
		gap: 13px;
		flex-wrap: wrap;
		margin-bottom: 10px;
	}
	.calculated-total b {
		font-size: 49px;
		letter-spacing: -0.045em;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
	}
	.calculated-total span {
		color: var(--muted);
		font-size: 13px;
	}
	.calculated-total p {
		font-size: 11px;
		color: var(--muted);
		margin: 5px 0;
		line-height: 1.8;
	}
	.calculated-total > p:first-of-type {
		font-family: 'Geist Mono', monospace;
	}
	.capacity-note {
		color: #ddb888 !important;
	}
	.monthly-results > li {
		display: flex;
		align-items: center;
		gap: 15px;
		flex-wrap: wrap;
		padding: 15px 12px;
		border: 1px solid transparent;
		border-bottom-color: var(--border);
		border-radius: 7px;
	}
	.rank {
		width: 14px;
		color: var(--faint);
		font-size: 10px;
	}
	.result-name {
		flex: 1;
		min-width: 160px;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.result-value {
		display: flex;
		align-items: baseline;
		gap: 7px;
		text-align: right;
	}
	.result-value strong {
		font-size: 17px;
		font-variant-numeric: tabular-nums;
		font-weight: 550;
	}
	.monthly-results .comparison-bar {
		flex-basis: 100%;
		margin-left: 29px;
		height: 3px;
	}
	.monthly-results li > p {
		width: 100%;
		margin: 0 0 0 29px;
		color: var(--faint);
		font-size: 10px;
		line-height: 1.7;
	}
	.show-all {
		width: 100%;
		padding: 15px;
		color: var(--muted);
		font-size: 11px;
		border-bottom: 1px solid var(--border);
	}
	.comparison-method {
		margin-top: 23px;
		color: var(--muted);
		font-size: 12px;
		border-top: 1px solid var(--border);
		padding: 18px 0;
	}
	.comparison-method summary {
		cursor: pointer;
		font-weight: 500;
	}
	.comparison-method summary span {
		font-size: 9px;
		border: 1px solid var(--border);
		border-radius: 99px;
		padding: 2px 6px;
		margin-left: 6px;
	}
	.comparison-method p {
		font-size: 11px;
		line-height: 1.9;
		margin-top: 15px;
		max-width: 900px;
	}
	.comparison-method ul {
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px 30px;
	}
	.comparison-method li {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		font-size: 11px;
	}
	.comparison-method a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.comparison-method small {
		font-size: 9px;
		color: var(--faint);
	}
	@media (max-width: 800px) {
		.hourly-results li > div {
			width: 150px;
		}
		.hourly-results > li {
			gap: 12px;
		}
		.range-field {
			grid-template-columns: 130px 1fr 75px;
		}
		.comparison-method ul {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (max-width: 550px) {
		.price-comparison {
			padding: 48px 0;
		}
		h2 {
			font-size: 29px;
		}
		.comparison-block {
			padding: 17px 11px;
		}
		.hourly-results > li {
			flex-wrap: wrap;
			padding: 11px 7px;
			gap: 8px;
		}
		.hourly-results li > div {
			width: calc(100% - 115px);
		}
		.hourly-results .comparison-bar {
			order: 4;
			flex-basis: 100%;
			height: 3px;
		}
		.hourly-results strong {
			min-width: 75px;
			font-size: 10px;
		}
		.ratio {
			width: 25px;
			font-size: 9px;
		}
		.hourly-results b {
			font-size: 12px;
		}
		.hourly-results small {
			font-size: 9px;
		}
		.range-field {
			grid-template-columns: 1fr 75px;
			gap: 13px;
		}
		.range-field label {
			grid-column: 1/-1;
			font-size: 11px;
		}
		.calculated-total b {
			font-size: 38px;
		}
		.calculated-total span {
			font-size: 11px;
		}
		.result-name {
			min-width: 110px;
		}
		.result-value {
			gap: 4px;
		}
		.result-value strong {
			font-size: 14px;
		}
		.result-value small {
			font-size: 9px;
		}
		.monthly-results > li {
			gap: 9px;
			padding: 12px 7px;
		}
		.monthly-results b {
			font-size: 12px;
		}
		.monthly-results small {
			font-size: 9px;
		}
		.comparison-method ul {
			grid-template-columns: 1fr;
		}
	}
</style>
