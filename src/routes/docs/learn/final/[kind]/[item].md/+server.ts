import { categories } from '#lib/content/learning.js';
import type { RequestHandler } from './$types';
import { renderMarkdown } from '#lib/server/markdown.js';
export const GET: RequestHandler = ({ params }) =>
	renderMarkdown(`learn/final/${params.kind}/${params.item}`);
export const trailingSlash = 'never';

export const prerender = process.env.STATIC_BUILD === '1';

export const entries = () =>
	categories.map((category) => ({ kind: 'category', item: category.id }));
