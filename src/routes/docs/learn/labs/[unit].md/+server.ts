import { units } from '#lib/content/learning.js';
import type { RequestHandler } from './$types';
import { renderMarkdown } from '#lib/server/markdown.js';
export const GET: RequestHandler = ({ params }) => renderMarkdown(`learn/labs/${params.unit}`);
export const trailingSlash = 'never';

export const prerender = process.env.STATIC_BUILD === '1';

export const entries = () => units.map((unit) => ({ unit: unit.id }));
