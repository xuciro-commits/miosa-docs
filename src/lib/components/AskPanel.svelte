<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { page } from '$app/state';
	import { X, ArrowUp, Square, BookOpen, ArrowUpRight, RotateCcw } from '@lucide/svelte';
	import { preferences } from '#lib/preferences.svelte.js';
	import { t } from '#lib/i18n.svelte.js';
	import { staticSite } from '#lib/site-mode.js';
	import { searchDocuments } from '#lib/search.js';
	import type { SearchEntry } from '#lib/content/catalog.js';
	let question = $state('');
	let busy = $state(false);
	let error = $state('');
	let messages = $state<
		{
			role: 'user' | 'assistant';
			text: string;
			sources?: { title: string; href: string }[];
			mode?: string;
		}[]
	>([]);
	let controller: AbortController | undefined;
	const suggestions = [
		{ key: 'docs.ask.suggestion.sandbox', query: 'What is a sandbox?' },
		{ key: 'docs.ask.suggestion.deploy', query: 'How do I deploy an app?' },
		{ key: 'docs.ask.suggestion.customize', query: 'How do I customize this site?' }
	];
	function sourceTitle(slug: string, fallback: string): string {
		const key = `docs.page.${slug.replaceAll('/', '.')}.title`;
		const translated = t(key);
		return translated === key ? fallback : translated;
	}
	$effect(() => {
		if (preferences.askOpen && preferences.askQuestion) {
			question = preferences.askQuestion;
			preferences.askQuestion = '';
		}
	});
	async function send() {
		const text = question.trim();
		if (!text || busy) return;
		question = '';
		error = '';
		busy = true;
		messages.push({ role: 'user', text });
		const answer = {
			role: 'assistant' as const,
			text: '',
			sources: [] as { title: string; href: string }[],
			mode: 'local'
		};
		messages.push(answer);
		const position = messages.length - 1;
		controller = new AbortController();
		try {
			if (staticSite) {
				const response = await fetch('/docs-search.json', { signal: controller.signal });
				if (!response.ok) throw new Error(t('docs.ask.indexUnavailable'));
				const index: SearchEntry[] = await response.json();
				const keywords = text
					.replace(/[^\p{L}\p{N}\s-]/gu, ' ')
					.split(/\s+/)
					.filter(
						(word) =>
							word &&
							!new Set([
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
							]).has(word.toLowerCase())
					)
					.join(' ');
				let relevant = searchDocuments(index, keywords).slice(0, 3);
				if (!relevant.length)
					relevant = index
						.filter((entry) => entry.href === page.url.pathname)
						.map((entry) => ({ ...entry, score: 0 }));
				messages[position].sources = relevant.map((entry) => ({
					title: sourceTitle(entry.slug, entry.title),
					href: entry.href
				}));
				messages[position].text = relevant.length
					? t('docs.ask.localAnswer', {
							passages: relevant
								.map((entry) => `${entry.title}\n${entry.text.slice(0, 700)}`)
								.join('\n\n')
						})
					: t('docs.ask.noPassage');
				return;
			}
			const response = await fetch('/api/docs/ask', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: text, path: page.url.pathname }),
				signal: controller.signal
			});
			if (!response.ok) throw new Error(t('docs.ask.assistantUnavailable'));
			const reader = response.body!.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const events = buffer.split('\n\n');
				buffer = events.pop() ?? '';
				for (const event of events) {
					const line = event.split('\n').find((line) => line.startsWith('data:'));
					if (!line) continue;
					const data = JSON.parse(line.slice(5));
					if (data.type === 'meta') {
						messages[position].sources = data.sources;
						messages[position].mode = data.mode;
					}
					if (data.type === 'token') messages[position].text += data.text;
					if (data.type === 'error') throw new Error(data.message);
				}
			}
		} catch (reason) {
			if (!(reason instanceof DOMException && reason.name === 'AbortError'))
				error = reason instanceof Error ? reason.message : t('docs.ask.couldNotLoad');
		} finally {
			busy = false;
		}
	}
</script>

<Dialog.Root bind:open={preferences.askOpen}
	><Dialog.Portal
		><Dialog.Overlay class="ask-overlay" /><Dialog.Content class="ask-panel"
			><div class="ask-header">
				<img src="/brand/osa-orb.png" alt="" />
				<div>
					<Dialog.Title>{t('docs.ask.title')}</Dialog.Title><Dialog.Description
						>{t('docs.ask.description')}</Dialog.Description
					>
				</div>
				<Dialog.Close class="icon-button" aria-label={t('docs.ask.close')}
					><X size={18} /></Dialog.Close
				>
			</div>
			<div class="ask-messages" aria-live="polite">
				{#if !messages.length}<div class="ask-intro">
						<img src="/brand/osa-orb.png" alt="" />
						<h2>{t('docs.ask.introLine1')}<br />{t('docs.ask.introLine2')}</h2>
						<p>{t('docs.ask.introBody')}</p>
						<div class="ask-suggestions">
							{#each suggestions as suggestion}<button
									onclick={() => {
										question = suggestion.query;
										send();
									}}>{t(suggestion.key)}<ArrowUpRight size={14} /></button
								>{/each}
						</div>
						<small>{t('docs.ask.localNote')}</small>
					</div>{:else}{#each messages as message}<div
							class="ask-message"
							class:user={message.role === 'user'}
						>
							{#if message.role === 'assistant'}<div class="message-label">
									<img src="/brand/osa-orb.png" alt="" />OSA<span
										>{message.mode === 'model'
											? t('docs.ask.connectedModel')
											: t('docs.ask.localDocumentation')}</span
									>
								</div>{/if}
							<div class="message-text">
								{message.text ||
									(busy ? t('docs.ask.findingPages') : t('docs.ask.responseStopped'))}
							</div>
							{#if message.sources?.length}<div class="answer-sources">
									{#each message.sources as source}<a
											href={source.href}
											onclick={() => (preferences.askOpen = false)}
											><BookOpen size={12} />{source.title}<ArrowUpRight size={11} /></a
										>{/each}
								</div>{/if}
						</div>{/each}{/if}{#if error}<div class="ask-error" role="alert">
						{error}<button
							onclick={() => {
								question = messages.findLast((m) => m.role === 'user')?.text ?? '';
								send();
							}}><RotateCcw size={12} />{t('docs.ask.tryAgain')}</button
						>
					</div>{/if}
			</div>
			<form
				class="ask-form"
				onsubmit={(event) => {
					event.preventDefault();
					send();
				}}
			>
				<textarea
					bind:value={question}
					aria-label={t('docs.ask.questionAria')}
					placeholder={t('docs.ask.placeholder')}
					rows="2"
					maxlength="2000"
					onkeydown={(event) => {
						if (event.key === 'Enter' && !event.shiftKey) {
							event.preventDefault();
							send();
						}
					}}></textarea>
				<div class="ask-form-bottom">
					<small>{busy ? t('docs.ask.reading') : t('docs.ask.localContent')}</small
					>{#if busy}<button
							type="button"
							class="send-button"
							aria-label={t('docs.ask.stop')}
							onclick={() => controller?.abort()}><Square size={13} /></button
						>{:else}<button
							class="send-button"
							type="submit"
							disabled={!question.trim()}
							aria-label={t('docs.ask.send')}><ArrowUp size={17} /></button
						>{/if}
				</div>
			</form></Dialog.Content
		></Dialog.Portal
	></Dialog.Root
>

<style>
	:global(.ask-overlay) {
		position: fixed;
		inset: 0;
		z-index: 70;
		background: #11111338;
		backdrop-filter: blur(3px);
	}
	:global(.ask-panel) {
		position: fixed;
		right: 12px;
		top: 12px;
		bottom: 12px;
		z-index: 71;
		width: min(440px, calc(100vw - 24px));
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 17px;
		box-shadow: 0 15px 70px #0003;
		overflow: hidden;
	}
	.ask-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 18px;
		border-bottom: 1px solid var(--border);
	}
	.ask-header > img {
		width: 32px;
		height: 32px;
	}
	.ask-header > div {
		flex: 1;
	}
	.ask-header :global(h2) {
		font-size: 14px;
		letter-spacing: 0;
		margin: 0 0 2px;
	}
	.ask-header :global(p) {
		font-size: 10px;
		color: var(--muted);
		margin: 0;
	}
	.ask-messages {
		flex: 1;
		overflow: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--dbd) transparent;
		padding: 22px;
	}
	.ask-intro {
		padding: 36px 8px;
	}
	.ask-intro > img {
		width: 48px;
		height: 48px;
		margin-bottom: 14px;
	}
	.ask-intro h2 {
		font-size: 26px;
		line-height: 1.25;
		margin: 0 0 16px;
	}
	.ask-intro p {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
	}
	.ask-suggestions {
		margin: 27px 0 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.ask-suggestions button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-align: left;
		gap: 12px;
		padding: 11px 12px;
		border: 1px solid var(--border);
		border-radius: 9px;
		font-size: 11px;
	}
	.ask-suggestions button:hover {
		background: var(--hover);
	}
	.ask-intro small {
		font-size: 10px;
		color: var(--muted);
		line-height: 1.7;
		display: block;
	}
	.ask-message {
		margin-bottom: 26px;
		font-size: 13px;
		line-height: 1.8;
	}
	.ask-message.user {
		margin-left: 30px;
		padding: 11px 14px;
		background: var(--hover);
		border-radius: 12px;
	}
	.message-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 550;
		margin-bottom: 10px;
	}
	.message-label img {
		width: 18px;
		height: 18px;
	}
	.message-label span {
		color: var(--muted);
		font-weight: 400;
		font-size: 9px;
		margin-left: auto;
	}
	.message-text {
		white-space: pre-wrap;
	}
	.answer-sources {
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin-top: 15px;
	}
	.answer-sources a {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 9px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 7px;
		font-size: 10px;
	}
	.answer-sources a > :global(svg):last-child {
		margin-left: auto;
	}
	.ask-form {
		margin: 0 14px 14px;
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 11px;
	}
	.ask-form textarea {
		scrollbar-width: thin;
		resize: none;
		width: 100%;
		border: 0;
		background: transparent;
		outline: none;
		font-size: 13px;
		line-height: 1.6;
	}
	.ask-form-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.ask-form-bottom small {
		font-size: 9px;
		color: var(--muted);
	}
	.send-button {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		background: var(--button);
		color: var(--button-text);
		border-radius: 7px;
	}
	.ask-error {
		font-size: 11px;
		border: 1px solid #cc7777;
		border-radius: 8px;
		padding: 10px;
		color: #b23f3f;
	}
	.ask-error button {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-top: 8px;
		font-size: 10px;
	}
</style>
