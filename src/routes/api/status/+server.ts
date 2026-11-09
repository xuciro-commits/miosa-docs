import { json } from '@sveltejs/kit';
export function GET() {
	return json(
		{ status: 'operational', scope: 'local-preview', checked_at: new Date().toISOString() },
		{ headers: { 'Cache-Control': 'no-store' } }
	);
}
