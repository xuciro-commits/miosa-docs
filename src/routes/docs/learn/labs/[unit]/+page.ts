import { error } from '@sveltejs/kit';
import { units } from '#lib/content/learning.js';
export const entries = () => units.map((unit) => ({ unit: unit.id }));
export function load({ params }) {
	const unit = units.find((unit) => unit.id === params.unit);
	if (!unit) error(404, 'This learning lab does not exist.');
	return { unit };
}
