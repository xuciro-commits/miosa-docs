import { json } from '@sveltejs/kit';
import { sandboxes } from '#lib/server/sandboxes.js';
export function GET({ params }) {
	const sandbox = sandboxes.get(params.id);
	return sandbox ? json({ data: sandbox }) : json({ error: 'Sandbox not found.' }, { status: 404 });
}
export function DELETE({ params }) {
	return sandboxes.delete(params.id)
		? new Response(null, { status: 204 })
		: json({ error: 'Sandbox not found.' }, { status: 404 });
}
