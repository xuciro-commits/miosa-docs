import products from '#lib/content/products.json';
import generatedData from '#lib/content/generated-docs.json';
export type DocMeta = {
	slug: string;
	title: string;
	description: string;
	section: string;
	order: number;
};
export type SearchEntry = {
	slug: string;
	title: string;
	description: string;
	section: string;
	text: string;
	href: string;
};
type GeneratedDoc = DocMeta & { slug: string; markdown: string };
type Article = DocMeta & { path?: string; raw: string; generated?: boolean };
const modules = import.meta.glob('/src/content/*.svx', {
	eager: true,
	import: 'metadata'
}) as Record<string, DocMeta>;
const raw = import.meta.glob('/src/content/*.svx', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;
const allArticles: Article[] = Object.entries(modules)
	.map(([path, metadata]) => ({ ...metadata, path, raw: raw[path] }))
	.sort((a, b) => a.order - b.order);
const generatedDocs = (generatedData.pages as GeneratedDoc[]).map((doc) => ({
	...doc,
	raw: doc.markdown,
	generated: true
})) as Article[];
const generatedSlugs = new Set(generatedDocs.map((article) => article.slug));
export const articles: Article[] = [
	...allArticles.filter((article) => !generatedSlugs.has(article.slug)),
	...generatedDocs
].sort((a, b) => a.order - b.order);
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
export const searchIndex: SearchEntry[] = documents.map((doc) => ({
	slug: doc.slug,
	title: doc.title,
	description: doc.description,
	section: doc.section,
	text: plainText(articles.find((a) => a.slug === doc.slug)?.raw ?? doc.description).slice(0, 240),
	href: `/docs${doc.slug ? '/' + doc.slug : ''}`
}));
