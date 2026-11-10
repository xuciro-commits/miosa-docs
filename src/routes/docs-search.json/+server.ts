import { json } from '@sveltejs/kit';
import { loadSearchIndex } from '#lib/content/catalog.js';

export async function GET({ url }) {
	const locale = url.searchParams.get('lang') === 'zh' ? 'zh' : 'en';
	const index = await loadSearchIndex(locale);
	return json(index, { headers: { 'Cache-Control': 'public, max-age=60' } });
}

export const prerender = process.env.STATIC_BUILD === '1';
export const trailingSlash = 'never';
