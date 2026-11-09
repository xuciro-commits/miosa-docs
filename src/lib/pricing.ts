import snapshot from '#lib/content/pricing-snapshot.json';
import comparison from '#lib/content/providers.json';

export const priceBook = snapshot;
export type Product = 'sandbox' | 'desktop' | 'app' | 'database';
export type Size = { vcpu: number; ramGib: number; diskGib: number };
type PlanRule = {
	name: string;
	usdMonth: number;
	concurrency?: number;
	maxSessionH?: number;
	maxVcpu?: number;
	minimum?: boolean;
	addOnAbove?: number;
};
type Provider = {
	id: string;
	name: string;
	products: Product[];
	source: string;
	checked: string;
	tag: string;
	activeCpu?: boolean;
	note?: string;
	price: {
		kind: 'rates' | 'sizes';
		vcpuH?: number;
		gibH?: number;
		maxVcpu?: number;
		maxRamGib?: number;
		nearest?: boolean;
		cpuActiveVcpuH?: number;
		sizes?: { vcpu: number; ramGib: number; usdHour: number; diskGib?: number; label?: string }[];
	};
	disk: {
		kind: 'included' | 'unlisted' | 'month' | 'hour';
		upToGib?: number;
		freeGib?: number;
		usdPerGibMonth?: number;
		usdPerGibHour?: number;
	};
	plans?: PlanRule[];
};
export const providers = comparison as Provider[];
export const products = [
	{ id: 'sandbox', label: 'Sandboxes' },
	{ id: 'desktop', label: 'Desktops' },
	{ id: 'app', label: 'Apps' },
	{ id: 'database', label: 'Databases' }
] as const;
export const sizes: Size[] = [
	{ vcpu: 1, ramGib: 2, diskGib: 8 },
	{ vcpu: 2, ramGib: 4, diskGib: 12 },
	{ vcpu: 4, ramGib: 8, diskGib: 50 },
	{ vcpu: 8, ramGib: 16, diskGib: 125 },
	{ vcpu: 16, ramGib: 32, diskGib: 250 }
];
export const sessionCounts = [1, 10, 100, 1000, 10_000, 100_000, 1_000_000, 10_000_000, Infinity];
export const sessionHours = [0.5, 1, 4, 8, 24, 240, 720];
export const peakCounts = [10, 50, 100, 250, 500, 1000, 2000];
export const busyFractions = [0.1, 0.25, 0.5, 0.9];
export const budgets = [20, 50, 100, 250, 500, 1000, 2500, 5000, 10_000, 25_000, 50_000, 100_000];
export const budgetPresets = [
	{ id: 'coding', label: 'Coding agents', hours: 8, size: sizes[2] },
	{ id: 'always-on', label: 'Always-on agents', hours: Infinity, size: sizes[1] },
	{ id: 'evals', label: 'Agent evals', hours: 1 / 3, size: sizes[2] },
	{ id: 'rollouts', label: 'RL rollouts', hours: 0.05, size: sizes[1] },
	{ id: 'ci', label: 'CI runners', hours: 0.2, size: sizes[3] },
	{ id: 'users', label: 'Sandboxes for your users', hours: 23 / 60, size: sizes[1] }
];
export const money = (value: number, digits = 2) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value);
export const compact = (value: number) =>
	value === Infinity
		? 'Back to back all month'
		: new Intl.NumberFormat('en-US', {
				notation: value >= 10_000 ? 'compact' : 'standard',
				maximumFractionDigits: 1
			}).format(value);
export const duration = (hours: number) =>
	hours === Infinity
		? '24/7'
		: hours < 1
			? `${Math.round(hours * 60)} min`
			: hours <= 24
				? `${hours} h`
				: `${+(hours / 24).toFixed(1)} d`;
const bookKey = (product: Product) => (product === 'desktop' ? 'computer' : product);
export function machineRate(product: Product, size: Size, busy = 1) {
	const item = priceBook.machines[bookKey(product)].sizes.find(
		(item) => item.vcpus === size.vcpu && item.memory_gib === size.ramGib
	);
	if (!item) return null;
	const cap = item.usd_per_hour;
	if (product === 'app' || product === 'database') {
		const meter = priceBook.meters.services;
		return Math.min(
			cap,
			(size.vcpu * busy * meter.usd_per_vcpu_month + size.ramGib * meter.usd_per_gib_month) /
				priceBook.month_hours
		);
	}
	return cap;
}
export function workload(sessions: number, hours: number, peak: number) {
	if (!Number.isFinite(sessions))
		return {
			machines: peak,
			hoursEach: priceBook.month_hours,
			totalHours: peak * priceBook.month_hours
		};
	const totalHours = Math.max(0, sessions) * Math.min(Math.max(0, hours), priceBook.month_hours);
	const machines = Math.max(1, peak, Math.ceil(totalHours / priceBook.month_hours));
	return { machines, hoursEach: totalHours / machines, totalHours };
}
function providerRate(
	provider: Provider,
	size: Size,
	busy: number
): { hour: number; note: string | null; disk: number | null } | null {
	const active = provider.activeCpu ? busy : 1;
	if (provider.price.kind === 'rates') {
		if (
			(provider.price.maxVcpu !== undefined && size.vcpu > provider.price.maxVcpu) ||
			(provider.price.maxRamGib !== undefined && size.ramGib > provider.price.maxRamGib)
		)
			return null;
		return {
			hour:
				size.vcpu * (provider.price.vcpuH ?? 0) * active + size.ramGib * (provider.price.gibH ?? 0),
			note: null,
			disk: null
		};
	}
	const exact = provider.price.sizes!.find(
		(item) => item.vcpu === size.vcpu && item.ramGib === size.ramGib
	);
	const nearest = provider.price.nearest
		? [...provider.price.sizes!]
				.filter((item) => item.vcpu >= size.vcpu && item.ramGib >= size.ramGib)
				.sort((a, b) => a.usdHour - b.usdHour)[0]
		: undefined;
	const item = exact ?? nearest;
	if (!item) return null;
	return {
		hour: item.usdHour + (provider.price.cpuActiveVcpuH ?? 0) * item.vcpu * active,
		note: exact ? null : `Nearest: ${item.label ?? `${item.vcpu} vCPU · ${item.ramGib} GB`}`,
		disk: item.diskGib ?? null
	};
}
function diskCharge(provider: Provider, size: Size, hours: number, included: number | null) {
	if (provider.disk.kind === 'included')
		return {
			amount: 0,
			note:
				size.diskGib > (provider.disk.upToGib ?? included ?? Infinity)
					? 'Extra disk is not priced in this reference'
					: null
		};
	if (provider.disk.kind === 'unlisted')
		return { amount: 0, note: 'Disk is not priced on the source page' };
	const rate =
		provider.disk.kind === 'month'
			? (provider.disk.usdPerGibMonth ?? 0) / priceBook.month_hours
			: (provider.disk.usdPerGibHour ?? 0);
	return {
		amount: Math.max(0, size.diskGib - (provider.disk.freeGib ?? 0)) * hours * rate,
		note: null
	};
}
export type ComparisonRow = {
	id: string;
	name: string;
	value: number | null;
	tag: string;
	notes: string[];
	source?: string;
	miosa: boolean;
};
export function hourlyComparison(product: Product, size: Size): ComparisonRow[] {
	const rows: ComparisonRow[] = providers
		.filter((provider) => provider.products.includes(product))
		.map((provider) => {
			const rate = providerRate(provider, size, 1);
			return {
				id: provider.id,
				name: provider.name,
				value: rate?.hour ?? null,
				tag: provider.tag,
				notes: rate
					? ([rate.note].filter(Boolean) as string[])
					: ['No matching size in the published reference'],
				source: provider.source,
				miosa: false
			};
		});
	rows.push({
		id: 'miosa',
		name: 'MIOSA',
		value: machineRate(product, size),
		tag: product === 'app' || product === 'database' ? 'Never more than' : 'Flat per size',
		notes: [],
		miosa: true
	});
	return rows.sort((a, b) => (a.value ?? Infinity) - (b.value ?? Infinity));
}
export function requiredPlan(product: Product, size: Size, peak: number) {
	const eligible = priceBook.plans.find((plan) => {
		if (product !== 'sandbox' && product !== 'desktop') return true;
		const limit = product === 'sandbox' ? plan.max_sandbox : plan.max_computer;
		const concurrency =
			product === 'sandbox' ? plan.concurrency.sandboxes : plan.concurrency.computers;
		return (
			peak <= concurrency &&
			size.vcpu <= limit.vcpu &&
			size.ramGib * 1024 <= limit.memory_mb &&
			size.diskGib * 1024 <= limit.disk_mb
		);
	});
	return eligible ?? null;
}
export function monthlyComparison(
	product: Product,
	size: Size,
	sessions: number,
	hours: number,
	peak: number,
	busy: number
) {
	const load = workload(sessions, hours, peak);
	const rows: ComparisonRow[] = providers
		.filter((provider) => provider.products.includes(product))
		.map((provider) => {
			const rate = providerRate(provider, size, busy);
			if (!rate)
				return {
					id: provider.id,
					name: provider.name,
					value: null,
					tag: provider.tag,
					notes: ['No matching size in the published reference'],
					source: provider.source,
					miosa: false
				};
			const disk = diskCharge(provider, size, load.totalHours, rate.disk);
			const rule = [...(provider.plans ?? [])]
				.sort((a, b) => a.usdMonth - b.usdMonth)
				.find(
					(rule) =>
						(rule.concurrency === undefined || load.machines <= rule.concurrency) &&
						(rule.maxVcpu === undefined || size.vcpu <= rule.maxVcpu) &&
						(rule.maxSessionH === undefined || hours <= rule.maxSessionH)
				);
			const notes = [rate.note, disk.note, provider.note].filter(Boolean) as string[];
			if (rule?.usdMonth)
				notes.push(
					`${money(rule.usdMonth, 0)}/mo ${rule.minimum ? 'usage minimum' : 'plan fee shown separately'}`
				);
			if (provider.plans?.length && !rule)
				notes.push('Exceeds a listed plan or session limit; a custom plan may be required');
			const usage = load.totalHours * rate.hour + disk.amount;
			return {
				id: provider.id,
				name: provider.name,
				value: Math.max(usage, rule?.minimum ? rule.usdMonth : 0),
				tag: provider.tag,
				notes,
				source: provider.source,
				miosa: false
			};
		});
	const rate = machineRate(product, size, busy);
	const plan = requiredPlan(product, size, load.machines);
	const minimum = plan ? plan.monthly_commitment_cents / 100 : 0;
	const compute = load.totalHours * (rate ?? 0);
	const disk =
		(load.totalHours * size.diskGib * priceBook.resources.disk_usd_per_gib_month) /
		priceBook.month_hours;
	const notes = !plan
		? ['Above the capacity of listed plans; contact the provider']
		: minimum > 0
			? [`${plan.name}: ${money(minimum, 0)}/mo, credited toward usage`]
			: ['Free plan usage rules apply'];
	rows.push({
		id: 'miosa',
		name: 'MIOSA',
		value: rate === null ? null : Math.max(compute + disk, minimum),
		tag:
			product === 'app' || product === 'database' ? 'Used CPU and memory, capped' : 'Flat per size',
		notes,
		miosa: true
	});
	return {
		rows: rows.sort((a, b) => (a.value ?? Infinity) - (b.value ?? Infinity)),
		compute,
		disk,
		load,
		plan
	};
}
function budgetCapacity(
	unitCost: number,
	rules: PlanRule[],
	budget: number,
	hours: number,
	size: Size
) {
	if (budget <= 0 || unitCost <= 0) return { count: 0, notes: ['No workloads fit this budget'] };
	if (!rules.length) return { count: Math.floor(budget / unitCost), notes: [] };
	const candidates = rules
		.filter(
			(rule) =>
				(rule.maxVcpu === undefined || size.vcpu <= rule.maxVcpu) &&
				(rule.maxSessionH === undefined || hours <= rule.maxSessionH) &&
				(rule.minimum ? budget >= rule.usdMonth : budget > rule.usdMonth)
		)
		.map((rule) => {
			const available = rule.minimum ? budget : budget - rule.usdMonth;
			const capacity =
				rule.concurrency === undefined
					? Infinity
					: hours === Infinity
						? rule.concurrency
						: Math.floor((rule.concurrency * priceBook.month_hours) / hours);
			return { count: Math.min(Math.floor(available / unitCost), capacity), rule };
		})
		.sort((a, b) => b.count - a.count || a.rule.usdMonth - b.rule.usdMonth);
	const best = candidates[0];
	return best
		? {
				count: best.count,
				notes: best.rule.usdMonth
					? [`${best.rule.name}${best.rule.minimum ? ' usage minimum' : ''}`]
					: []
			}
		: { count: 0, notes: ['No listed plan fits this budget and workload'] };
}
export function budgetComparison(
	product: Product,
	budget: number,
	preset: (typeof budgetPresets)[number],
	busy: number
): ComparisonRow[] {
	const hours = preset.hours === Infinity ? priceBook.month_hours : preset.hours;
	const rows: ComparisonRow[] = providers
		.filter((provider) => provider.products.includes(product))
		.map((provider) => {
			const rate = providerRate(provider, preset.size, busy);
			if (!rate)
				return {
					id: provider.id,
					name: provider.name,
					value: null,
					tag: provider.tag,
					notes: ['No matching size in the published reference'],
					source: provider.source,
					miosa: false
				};
			const disk = diskCharge(provider, preset.size, hours, rate.disk);
			const result = budgetCapacity(
				hours * rate.hour + disk.amount,
				provider.plans ?? [],
				budget,
				preset.hours,
				preset.size
			);
			return {
				id: provider.id,
				name: provider.name,
				value: result.count,
				tag: provider.tag,
				notes: [
					...result.notes,
					...(rate.note ? [rate.note] : []),
					...(disk.note ? [disk.note] : [])
				],
				source: provider.source,
				miosa: false
			};
		});
	const rate = machineRate(product, preset.size, busy);
	const rules = priceBook.plans.map((plan) => ({
		name: plan.name,
		usdMonth: plan.monthly_commitment_cents / 100,
		minimum: true,
		maxVcpu: product === 'desktop' ? plan.max_computer.vcpu : plan.max_sandbox.vcpu,
		concurrency: Math.min(
			product === 'desktop' ? plan.concurrency.computers : plan.concurrency.sandboxes,
			Math.floor(plan.limits.running_vcpu / preset.size.vcpu),
			Math.floor(plan.limits.running_ram_mb / (preset.size.ramGib * 1024))
		)
	}));
	const result =
		rate === null
			? null
			: budgetCapacity(
					hours *
						(rate +
							(preset.size.diskGib * priceBook.resources.disk_usd_per_gib_month) /
								priceBook.month_hours),
					rules,
					budget,
					preset.hours,
					preset.size
				);
	rows.push({
		id: 'miosa',
		name: 'MIOSA',
		value: result?.count ?? null,
		tag: 'Including disk and plan capacity',
		notes: result?.notes ?? ['No matching size'],
		miosa: true
	});
	return rows.sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
}
