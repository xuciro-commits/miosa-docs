import { documents } from '#lib/content/catalog.js';
import type { RequestHandler } from './$types';
import { renderMarkdown } from '#lib/server/markdown.js';
export const GET: RequestHandler = async ({ params }) => renderMarkdown(params.slug);

export const trailingSlash = 'never';

export const prerender = process.env.STATIC_BUILD === '1';

export const entries = () =>
	documents
		.filter((doc) => !doc.slug.startsWith('build/'))
		.map((doc) => ({ slug: doc.slug || 'index' }));
