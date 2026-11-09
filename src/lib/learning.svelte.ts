import { categories, units } from '#lib/content/learning.js';

export const learning = $state({
	ready: false,
	practiced: [] as string[],
	passed: [] as string[],
	labs: [] as string[]
});

export const progress = {
	get words() {
		return categories.filter((c) => learning.passed.includes(c.id)).length;
	},
	get games() {
		return units.filter((u) => learning.labs.includes(u.id)).length;
	},
	get credits() {
		return (
			this.words * 2.5 +
			units.filter((u) => learning.labs.includes(u.id)).reduce((sum, u) => sum + u.reward, 0)
		);
	}
};

export function saveProgress(kind: 'practiced' | 'passed' | 'labs', id: string) {
	if (!learning[kind].includes(id)) learning[kind] = [...learning[kind], id];
	localStorage.setItem(
		'miosa-learning-v1',
		JSON.stringify({ practiced: learning.practiced, passed: learning.passed, labs: learning.labs })
	);
}

export function loadProgress() {
	const saved = localStorage.getItem('miosa-learning-v1');
	if (saved) {
		try {
			const data = JSON.parse(saved);
			for (const key of ['practiced', 'passed', 'labs'] as const) {
				if (Array.isArray(data[key]))
					learning[key] = data[key].filter((id: unknown): id is string => typeof id === 'string');
			}
		} catch {
			localStorage.removeItem('miosa-learning-v1');
		}
	}
	learning.ready = true;
}
