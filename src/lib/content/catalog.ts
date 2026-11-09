import products from '#lib/content/products.json';

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
export type Article = DocMeta & {
	path?: string;
	raw: string;
	rawZh?: string;
	generated?: boolean;
};

const rawFiles = import.meta.glob('/src/content/docs/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

function parseFrontmatter(source: string): Omit<Article, 'path'> {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	const body = match ? source.slice(match[0].length) : source;
	const fields: Record<string, string> = {};
	for (const line of (match?.[1] ?? '').split(/\r?\n/)) {
		const colon = line.indexOf(':');
		if (colon < 0) continue;
		const key = line.slice(0, colon).trim();
		let value = line.slice(colon + 1).trim();
		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
			value = value.slice(1, -1);
		fields[key] = value;
	}
	return {
		slug: fields.slug ?? '',
		title: fields.title ?? fields.slug ?? 'Documentation',
		description: fields.description ?? '',
		section: fields.section ?? '',
		order: Number(fields.order ?? 500000),
		raw: body,
		generated: true
	};
}

type ParsedFile = ReturnType<typeof parseFrontmatter> & { lang: 'en' | 'zh'; path: string };
const parsedFiles: ParsedFile[] = Object.entries(rawFiles).map(([path, source]) => ({
	...parseFrontmatter(source),
	lang: path.includes('/zh/') ? 'zh' : 'en',
	path
}));
const bySlug = new Map<string, { en?: ParsedFile; zh?: ParsedFile }>();
for (const file of parsedFiles) {
	const entry = bySlug.get(file.slug) ?? {};
	if (file.lang === 'zh') entry.zh = file;
	else entry.en = file;
	bySlug.set(file.slug, entry);
}
export const articles: Article[] = [...bySlug.values()]
	.filter((entry) => entry.en)
	.map(({ en, zh }) => ({
		...en!,
		raw: en!.raw,
		rawZh: zh?.raw,
		titleZh: zh?.title,
		descriptionZh: zh?.description,
		path: en!.path,
		generated: true
	}))
	.sort((a, b) => a.order - b.order);

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

function makeSearchIndex(locale: 'en' | 'zh'): SearchEntry[] {
	return documents.map((doc) => {
		const article = articles.find((a) => a.slug === doc.slug);
		return {
			slug: doc.slug,
			title: locale === 'zh' ? doc.titleZh ?? article?.titleZh ?? doc.title : doc.title,
			description:
				locale === 'zh'
					? doc.descriptionZh ?? article?.descriptionZh ?? doc.description
					: doc.description,
			section: doc.section,
			text: plainText(
				locale === 'zh'
					? article?.rawZh ?? article?.raw ?? doc.description
					: article?.raw ?? doc.description
			).slice(0, 240),
			href: `/docs${doc.slug ? '/' + doc.slug : ''}`
		};
	});
}
export const searchIndex = makeSearchIndex('en');
export const searchIndexZh = makeSearchIndex('zh');
