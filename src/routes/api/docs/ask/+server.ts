import { json } from '@sveltejs/kit';
import { searchIndex } from '#lib/content/catalog.js';
import { searchDocuments } from '#lib/search.js';

export async function POST({ request }) {
	let input;
	try {
		input = await request.json();
	} catch {
		return json({ error: 'Send a valid question.' }, { status: 400 });
	}
	if (
		!input ||
		typeof input.question !== 'string' ||
		!input.question.trim() ||
		input.question.length > 2000
	)
		return json({ error: 'Ask a question of 1–2000 characters.' }, { status: 400 });
	const question = input.question.trim();
	const stopWords = new Set([
		'what',
		'is',
		'a',
		'an',
		'the',
		'how',
		'do',
		'i',
		'does',
		'can',
		'to',
		'this',
		'my',
		'me',
		'about',
		'explain',
		'summarize'
	]);
	const keywords = question
		.replace(/[^\p{L}\p{N}\s-]/gu, ' ')
		.split(/\s+/)
		.filter((word: string) => word && !stopWords.has(word.toLowerCase()))
		.join(' ');
	let relevant = searchDocuments(searchIndex, keywords).slice(0, 3);
	if (!relevant.length && typeof input.path === 'string')
		relevant = searchIndex
			.filter((entry) => entry.href === input.path)
			.map((entry) => ({ ...entry, score: 0 }));
	const sources = relevant.map((entry) => ({ title: entry.title, href: entry.href }));
	const configured = !!(
		process.env.DOCS_AI_BASE_URL &&
		process.env.DOCS_AI_KEY &&
		process.env.DOCS_AI_MODEL
	);
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			const emit = (data: unknown) =>
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
			emit({ type: 'meta', mode: configured ? 'model' : 'local', sources });
			try {
				if (configured) {
					const upstream = await fetch(
						process.env.DOCS_AI_BASE_URL!.replace(/\/$/, '') + '/chat/completions',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${process.env.DOCS_AI_KEY}`
							},
							body: JSON.stringify({
								model: process.env.DOCS_AI_MODEL,
								stream: true,
								messages: [
									{
										role: 'system',
										content:
											'Answer using only these documentation passages. If the answer is missing, say so. This is a local learning reconstruction, not the official MIOSA service. Never claim an account action happened.\n\n' +
											relevant
												.map((entry) => `${entry.title}: ${entry.text.slice(0, 2400)}`)
												.join('\n\n')
									},
									{ role: 'user', content: question }
								]
							}),
							signal: request.signal
						}
					);
					if (!upstream.ok || !upstream.body)
						throw new Error(
							'The configured model service did not accept the request. Check the server configuration and try again.'
						);
					const reader = upstream.body.getReader();
					const decoder = new TextDecoder();
					let buffer = '';
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split('\n');
						buffer = lines.pop() ?? '';
						for (const line of lines) {
							if (!line.startsWith('data:')) continue;
							const data = line.slice(5).trim();
							if (!data || data === '[DONE]') continue;
							const chunk = JSON.parse(data);
							const text = chunk.choices?.[0]?.delta?.content;
							if (text) emit({ type: 'token', text });
						}
					}
				} else {
					const answer = relevant.length
						? `Here are the relevant passages from this documentation:\n\n${relevant.map((entry) => `${entry.title}\n${entry.text.slice(0, 700)}${entry.text.length > 700 ? '…' : ''}`).join('\n\n')}\n\nOpen a source below for the full guide. This response was found locally; no language model was called.`
						: 'I could not find a matching passage in the local documentation. Try a specific term such as sandbox, deployment, snapshot or customization.';
					emit({ type: 'token', text: answer });
				}
				emit({ type: 'done' });
			} catch (reason) {
				if (!request.signal.aborted)
					emit({
						type: 'error',
						message: reason instanceof Error ? reason.message : 'The answer could not be loaded.'
					});
			}
			controller.close();
		}
	});
	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream; charset=utf-8',
			'Cache-Control': 'no-cache',
			'X-Accel-Buffering': 'no'
		}
	});
}
