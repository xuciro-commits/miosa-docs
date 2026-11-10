import { error } from '@sveltejs/kit';
import { articleMeta, loadMarkdown } from '#lib/content/catalog.js';
import { renderDoc } from '#lib/content/render.js';

const components = import.meta.glob('/src/content/*.svx');

export const entries = () => [];

export async function load({ params, fetch }) {
	const slug = (params.slug ?? '').replace(/\/$/, '');
	const meta = articleMeta.find((item) => item.slug === slug);
	if (!meta)
		error(
			404,
			'This page does not exist. Search the documentation or choose a page from the sidebar.'
		);
	const en = await loadMarkdown(slug, 'en', fetch);
	if (!en) error(404, 'Page content is unavailable');
	const rendered = renderDoc(slug, en, meta.title);
	return {
		slug,
		html: rendered.html,
		htmlZh: '',
		title: meta.title,
		titleZh: meta.titleZh ?? meta.title,
		accordion: rendered.accordion,
		Content: null
	};
}
