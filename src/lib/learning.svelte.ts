import { categories, units, terms, videos, sequences } from '#lib/content/learning.js';
import { t } from './i18n.svelte.js';

/** Stable key fragment for a glossary term, independent of display language. */
export function termId(word: string): string {
	return word
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export function categoryName(id: string): string {
	return t(`learning.category.${id}.name`);
}

export function categoryDescription(id: string): string {
	return t(`learning.category.${id}.description`);
}

export function unitTitle(id: string): string {
	return t(`learning.unit.${id}.title`);
}

export function unitSubtitle(id: string): string {
	return t(`learning.unit.${id}.subtitle`);
}

export function termWord(term: { word: string }): string {
	return t(`learning.term.${termId(term.word)}.word`);
}

export function termDefinition(term: { word: string; definition: string }): string {
	return t(`learning.term.${termId(term.word)}.definition`);
}

export function termExample(term: { word: string; example: string }): string {
	return t(`learning.term.${termId(term.word)}.example`);
}

/** Translate a glossary word from its canonical English source. */
export function termWordByEnglish(word: string): string {
	const term = terms.find((candidate) => candidate.word === word);
	return term ? termWord(term) : word;
}

/** Translate a glossary definition from its canonical English source. */
export function termDefinitionByEnglish(definition: string): string {
	const term = terms.find((candidate) => candidate.definition === definition);
	return term ? termDefinition(term) : definition;
}

/** Translate a glossary example from its canonical English source. */
export function termExampleByEnglish(example: string): string {
	const term = terms.find((candidate) => candidate.example === example);
	return term ? termExample(term) : example;
}

export function videoTitle(video: string): string {
	return t(`learning.video.${termId(video)}`);
}

export function sequenceStep(unitId: string, step: string): string {
	const index = (sequences[unitId] ?? []).indexOf(step);
	return index >= 0 ? t(`learning.sequence.${unitId}.${index}`) : step;
}

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
