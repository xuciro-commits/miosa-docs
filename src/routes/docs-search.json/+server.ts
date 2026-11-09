import { json } from '@sveltejs/kit';
import { searchIndex } from '#lib/content/catalog.js';
export function GET() {
	return json(searchIndex, { headers: { 'Cache-Control': 'public, max-age=60' } });
}

export const prerender = process.env.STATIC_BUILD === '1';
export const trailingSlash = 'never';
