import { json } from '@sveltejs/kit';
import { sandboxes, type Sandbox } from '#lib/server/sandboxes.js';
export function GET() {
	return json(
		{ data: [...sandboxes.values()], total: sandboxes.size },
		{ headers: { 'Cache-Control': 'no-store' } }
	);
}
export async function POST({ request }) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Send a valid JSON object.' }, { status: 400 });
	}
	if (
		!body ||
		typeof body.name !== 'string' ||
		!body.name.trim() ||
		body.name.length > 64 ||
		!['node', 'python', 'ubuntu'].includes(body.template)
	)
		return json(
			{ error: 'Provide a name of 1–64 characters and a template: node, python or ubuntu.' },
			{ status: 400 }
		);
	const sandbox: Sandbox = {
		id: crypto.randomUUID(),
		name: body.name.trim(),
		template: body.template,
		status: 'running',
		created_at: new Date().toISOString()
	};
	sandboxes.set(sandbox.id, sandbox);
	return json({ data: sandbox }, { status: 201 });
}
