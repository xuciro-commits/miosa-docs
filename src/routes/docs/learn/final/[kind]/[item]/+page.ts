import { error } from '@sveltejs/kit';
import { categories, terms } from '#lib/content/learning.js';
export const entries = () => categories.map((category) => ({ kind: 'category', item: category.id }));
export function load({ params }) {
	const category = categories.find((category) => category.id === params.item);
	if (params.kind !== 'category' || !category) error(404, 'This learning check does not exist.');
	const questions = terms
		.filter((term) => term.category === category.id)
		.map((term, index) => {
			const other = terms
				.filter((candidate) => candidate.category !== category.id)
				.slice(index * 2, index * 2 + 3);
			const choices = [term, ...other].sort((a, b) => a.definition.localeCompare(b.definition));
			return {
				word: term.word,
				definition: term.definition,
				example: term.example,
				choices: choices.map((item) => item.definition),
				correct: choices.findIndex((item) => item.word === term.word)
			};
		});
	return { category, questions };
}
