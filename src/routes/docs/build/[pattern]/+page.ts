import { error } from '@sveltejs/kit';
import { articleMeta, loadMarkdown } from '#lib/content/catalog.js';
import { renderDoc } from '#lib/content/render.js';
import products from '#lib/content/products.json';

export const entries = () => [];

export async function load({ params, fetch }) {
	const slug = `build/${params.pattern}`;
	const meta = articleMeta.find((item) => item.slug === slug);
	if (meta) {
		const en = await loadMarkdown(slug, 'en', fetch);
		if (en) {
			const rendered = renderDoc(slug, en, meta.title);
			return {
				slug,
				html: rendered.html,
				htmlZh: '',
				title: meta.title,
				titleZh: meta.titleZh ?? meta.title,
				accordion: rendered.accordion,
				product: null,
				Content: null
			};
		}
	}
	const product = products.find((item) => item.href.split('/').pop() === params.pattern);
	if (!product) error(404, 'Product guide not found');
	return { product, Content: null, html: '', htmlZh: '' };
}
