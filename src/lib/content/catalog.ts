import products from '#lib/content/products.json';
import manifest from '#lib/content/docs-manifest.json';
import { fetchContent, fetchContentJson, stripFrontmatter } from '#lib/content/remote.js';

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
 * Page Markdown comes from the public content repository, one file per page and
 * language, pinned to a content commit. It never enters the app bundle: a page
 * costs a few kilobytes over the CDN and is cached forever after that.
 */
const markdownCache = new Map<string, Promise<string | undefined>>();

export async function loadMarkdown(
	slug: string,
	locale: 'en' | 'zh' = 'en',
	fetcher: typeof fetch = fetch
) {
	if (!slug) return undefined;
	const key = `${locale}/${slug}`;
	if (!markdownCache.has(key)) {
		markdownCache.set(
			key,
			fetchContent(`src/content/docs/${locale}/${slug}.md`, fetcher).then((body) =>
				body ? stripFrontmatter(body) : undefined
			)
		);
	}
	return markdownCache.get(key)!;
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

const searchCache = new Map<'en' | 'zh', SearchEntry[]>();

/** Search excerpts come from the content repository, only when someone searches. */
export async function loadSearchIndex(
	locale: 'en' | 'zh' = 'en',
	fetcher: typeof fetch = fetch
): Promise<SearchEntry[]> {
	if (searchCache.has(locale)) return searchCache.get(locale)!;
	const remote = await fetchContentJson<SearchEntry[]>(`content/search.${locale}.json`, fetcher);
	const index =
		remote ??
		documents.map((doc) => ({
			slug: doc.slug,
			title: locale === 'zh' ? doc.titleZh ?? doc.title : doc.title,
			description: locale === 'zh' ? doc.descriptionZh ?? doc.description : doc.description,
			section: doc.section,
			href: `/docs${doc.slug ? '/' + doc.slug : ''}`,
			text: doc.description
		}));
	searchCache.set(locale, index);
	return index;
}

/** Data behind the learning checks and labs, with the bundled copy as fallback. */
export type QuizData = {
	categories: { id: string; name: string; description: string }[];
	terms: { word: string; category: string; definition: string; example: string }[];
	units: { id: string; title: string; subtitle: string; reward: number; icon: string; type: string }[];
	videos: string[];
};

let quizCache: Promise<QuizData> | undefined;

export function loadLearningData(fetcher: typeof fetch = fetch): Promise<QuizData> {
	quizCache ??= (async () => {
		const remote = await fetchContentJson<QuizData>('content/data/learning/categories.json', fetcher);
		if (remote?.categories?.length) return remote;
		const local = await import('#lib/content/learning.js');
		return {
			categories: local.categories as QuizData['categories'],
			terms: local.terms as QuizData['terms'],
			units: local.units as unknown as QuizData['units'],
			videos: local.videos as unknown as string[]
		};
	})();
	return quizCache;
}
