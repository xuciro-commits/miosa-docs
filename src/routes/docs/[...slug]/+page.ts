import { error } from '@sveltejs/kit';
import { articles } from '#lib/content/catalog.js';
const components = import.meta.glob('/src/content/*.svx');
export const entries = () => articles.map((article) => ({ slug: article.slug }));
export async function load({ params }) {
	const slug = (params.slug ?? '').replace(/\/$/, '');
	const article = articles.find((article) => article.slug === slug);
	if (!article)
		error(
			404,
			'This page does not exist. Search the documentation or choose a page from the sidebar.'
		);
	const module = (await components[article.path]()) as { default: import('svelte').Component };
	return { Content: module.default };
}
