import { error } from '@sveltejs/kit';
import { renderDoc } from '#lib/content/render.js';
import { articles } from '#lib/content/catalog.js';
import products from '#lib/content/products.json';

const components = import.meta.glob('/src/content/*.svx');

export const entries = () =>
	articles
		.filter((article) => article.slug.startsWith('build/'))
		.map((article) => ({ pattern: article.slug.split('/').pop()! }));

export async function load({ params }) {
	const slug = `build/${params.pattern}`;
	const article = articles.find((item) => item.slug === slug);
	if (article?.generated) {
		const en = renderDoc(slug, article.raw, article.title);
		const zh = renderDoc(slug, article.rawZh ?? article.raw, article.titleZh ?? article.title, 'zh');
		return { html: en.html, htmlZh: zh.html, product: null, Content: null };
	}
	if (article?.path) {
		const module = (await components[article.path]()) as {
			default: import('svelte').Component;
		};
		return { Content: module.default, product: null, html: '' };
	}
	const product = products.find((item) => item.href.split('/').pop() === params.pattern);
	if (!product) error(404, 'Product guide not found');
	return { product, Content: null, html: '' };
}
