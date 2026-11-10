import { error } from '@sveltejs/kit';
import { articleMeta, loadMarkdown } from '#lib/content/catalog.js';
import { renderDoc } from '#lib/content/render.js';
import products from '#lib/content/products.json';

export const entries = () => [];

export async function load({ params }) {
	const slug = `build/${params.pattern}`;
	const meta = articleMeta.find((item) => item.slug === slug);
	if (meta) {
		const [en, zhSource] = await Promise.all([
			loadMarkdown(slug, 'en'),
			loadMarkdown(slug, 'zh')
		]);
		if (en) {
			const rendered = renderDoc(slug, en, meta.title);
			const renderedZh = renderDoc(slug, zhSource ?? en, meta.titleZh ?? meta.title, 'zh');
			return {
				html: rendered.html,
				htmlZh: renderedZh.html,
				product: null,
				Content: null
			};
		}
	}
	const product = products.find((item) => item.href.split('/').pop() === params.pattern);
	if (!product) error(404, 'Product guide not found');
	return { product, Content: null, html: '', htmlZh: '' };
}
