import products from '#lib/content/products.json';
import manifest from '#lib/content/docs-manifest.json';

export type DocMeta = {
	slug: string;
	title: string;
	description: string;
	section: string;
	order: number;
	titleZh?: string;
	descriptionZh?: string;
};

export type SearchEntry = {
	slug: string;
	title: string;
	description: string;
	section: string;
	text: string;
	href: string;
};

export type Article = DocMeta & { raw: string; rawZh?: string; generated?: boolean };

type ContentMaps = Record<string, string>;

/**
 * Page Markdown lives in lazily imported modules, split by language and by
 * top-level section: opening one documentation page downloads only that slice,
 * which keeps the entry bundle and the first page load small.
 */
const contentModules = import.meta.glob('/src/lib/content/docs-content.*.json', {
	import: 'default'
}) as Record<string, () => Promise<ContentMaps>>;

const sectionCache = new Map<string, Promise<ContentMaps>>();

function sectionOf(slug: string) {
	return slug.includes('/') ? slug.split('/')[0] : 'root';
}

async function loadSection(locale: 'en' | 'zh', section: string): Promise<ContentMaps> {
	const path = `/src/lib/content/docs-content.${locale}.${section}.json`;
	const loader = contentModules[path];
	if (!loader) return {};
	const key = `${locale}:${section}`;
	if (!sectionCache.has(key)) sectionCache.set(key, loader());
	return sectionCache.get(key)!;
}

/** Markdown for one page, in the requested language. */
export async function loadMarkdown(slug: string, locale: 'en' | 'zh' = 'en') {
	const map = await loadSection(locale, sectionOf(slug));
	return map[slug];
}

/** Metadata for every page, without any body text. */
export const articleMeta: DocMeta[] = (manifest.pages as DocMeta[]).slice();

/** Kept for callers that need the previous shape; body text is loaded on demand. */
export const articles: Article[] = articleMeta.map((page) => ({ ...page, raw: '', generated: true }));

export const specialPages: DocMeta[] = [
	{
		slug: 'learn',
		title: 'Learn MIOSA your way',
		description:
			'Read the words, try the labs, and understand what you build. Pick a path and make it your own.',
		section: 'Learn',
		order: 5
	},
	{
		slug: 'learn/earn',
		title: 'Learn and earn',
		description:
			'Learn how the building blocks fit together. Read, practice, and track your progress across three learning paths.',
		section: 'Learn',
		order: 6
	},
	{
		slug: 'glossary',
		title: 'Learn the words',
		description:
			'Plain-language explanations for the building blocks. Explore a category, practice the terms, then check what you know.',
		section: 'Learn',
		order: 7
	},
	{
		slug: 'learn/games',
		title: 'Learn with games',
		description:
			'Build your understanding by doing. Seven short, interactive labs take you from the vocabulary to your first product.',
		section: 'Learn',
		order: 8
	},
	{
		slug: 'learn/videos',
		title: 'Learn with videos',
		description:
			'Short lessons for the ideas behind the platform. This track opens when the lessons are ready.',
		section: 'Learn',
		order: 9
	},
	{
		slug: 'api',
		title: 'Interactive API reference',
		description:
			'Explore a working local sandbox API. Inspect its schema and try requests against this learning project.',
		section: 'API reference',
		order: 40
	}
];

export const documents: DocMeta[] = [
	...articles,
	...specialPages,
	...products
		.filter((product) => !articles.some((article) => article.slug === product.href.replace('/docs/', '')))
		.map((product) => ({
			slug: product.href.replace('/docs/', ''),
			title: (product.run ? 'Run ' : 'Build your own ') + product.name,
			description: product.blurb,
			section: 'Build',
			order: 30
		}))
].sort((a, b) => a.order - b.order);

export function getDocument(slug: string): DocMeta | undefined {
	if (slug.startsWith('learn/final/'))
		return {
			slug,
			title: 'Check your understanding',
			description:
				'A short practice check. Take your time, read each explanation, and try again whenever you like.',
			section: 'Learn',
			order: 10
		};
	if (slug.startsWith('learn/labs/'))
		return {
			slug,
			title: 'Learning lab',
			description: 'Explore the system, make a change, and see what happens.',
			section: 'Learn',
			order: 10
		};
	return documents.find((doc) => doc.slug === slug);
}

export function plainText(source: string) {
	return source
		.replace(/^---[\s\S]*?---/, '')
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[#*_`{}]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

const searchModules = import.meta.glob('/src/lib/content/docs-search.*.json', {
	import: 'default'
}) as Record<string, () => Promise<SearchEntry[]>>;

const searchCache = new Map<'en' | 'zh', SearchEntry[]>();

/** Search index for one language, loaded the first time someone searches. */
export async function loadSearchIndex(locale: 'en' | 'zh' = 'en'): Promise<SearchEntry[]> {
	if (searchCache.has(locale)) return searchCache.get(locale)!;
	const loader = searchModules[`/src/lib/content/docs-search.${locale}.json`];
	if (!loader) return [];
	const raw = (await loader()) as (SearchEntry & { text?: string })[];
	const index = raw.map((entry) => ({
		...entry,
		text: entry.text ?? plainText(descriptionOf(entry))
	}));
	searchCache.set(locale, index);
	return index;
}

function descriptionOf(entry: SearchEntry) {
	return entry.description;
}