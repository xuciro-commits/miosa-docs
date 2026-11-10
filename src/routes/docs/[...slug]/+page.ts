import { error } from '@sveltejs/kit';
import { articles } from '#lib/content/catalog.js';
import { renderDoc } from '#lib/content/render.js';

const components = import.meta.glob('/src/content/*.svx');

export const entries = () => articles.filter((article) => !article.generated).map((article) => ({ slug: article.slug }));

export async function load({ params }) {
	const slug = (params.slug ?? '').replace(/\/$/, '');
	const article = articles.find((item) => item.slug === slug);
	if (!article)
		error(
			404,
			'This page does not exist. Search the documentation or choose a page from the sidebar.'
		);
	if (article.generated) {
		const en = renderDoc(slug, article.raw, article.title);
		const zh = renderDoc(slug, article.rawZh ?? article.raw, article.titleZh ?? article.title, 'zh');
		return { html: en.html, htmlZh: zh.html, accordion: en.accordion || zh.accordion, Content: null };
	}
	if (!article.path) error(404, 'Page content is unavailable');
	const module = (await components[article.path]()) as { default: import('svelte').Component };
	return { Content: module.default, html: '' };
}
