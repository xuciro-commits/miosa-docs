import { error } from '@sveltejs/kit';
import { articleMeta } from '#lib/content/catalog.js';

/**
 * The loader only resolves the page's metadata: Markdown is fetched by the
 * component when the page is actually opened. Link preloading therefore stays
 * cheap and a reader never downloads pages they do not open.
 */
export const entries = () => [];

export async function load({ params }) {
	const slug = (params.slug ?? '').replace(/\/$/, '');
	const meta = articleMeta.find((item) => item.slug === slug);
	if (!meta)
		error(
			404,
			'This page does not exist. Search the documentation or choose a page from the sidebar.'
		);
	return {
		slug,
		title: meta.title,
		titleZh: meta.titleZh ?? meta.title,
		layout: meta.layout ?? null
	};
}
