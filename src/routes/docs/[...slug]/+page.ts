import { error } from '@sveltejs/kit';
import { articleMeta, loadMarkdown } from '#lib/content/catalog.js';
import { renderDoc } from '#lib/content/render.js';

const components = import.meta.glob('/src/content/*.svx');

export const entries = () => [];

export async function load({ params }) {
	const slug = (params.slug ?? '').replace(/\/$/, '');
	const meta = articleMeta.find((item) => item.slug === slug);
	if (!meta)
		error(
			404,
			'This page does not exist. Search the documentation or choose a page from the sidebar.'
		);
	const [en, zhSource] = await Promise.all([
		loadMarkdown(slug, 'en'),
		loadMarkdown(slug, 'zh')
	]);
	if (!en) error(404, 'Page content is unavailable');
	const rendered = renderDoc(slug, en, meta.title);
	const renderedZh = renderDoc(slug, zhSource ?? en, meta.titleZh ?? meta.title, 'zh');
	return {
		html: rendered.html,
		htmlZh: renderedZh.html,
		accordion: rendered.accordion || renderedZh.accordion,
		Content: null
	};
}
