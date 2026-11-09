<script lang="ts">
	import { copyText } from '#lib/clipboard.js';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { Copy, FileText, ThumbsUp, ThumbsDown, Flag, ArrowUp } from '@lucide/svelte';
	import { ask, notify } from '#lib/preferences.svelte.js';
	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let active = $state('');
	let feedback = $state('');
	let readProgress = $state(0);
	function update() {
		const article = document.getElementById('article-body');
		if (!article) return;
		const bounds = article.getBoundingClientRect();
		readProgress = Math.max(
			0,
			Math.min(100, ((-bounds.top + 110) / (bounds.height - window.innerHeight + 150)) * 100)
		);
		let current = headings[0]?.id ?? '';
		for (const heading of headings) {
			if (
				(document.getElementById(heading.id)?.getBoundingClientRect().top ?? Infinity) <=
				Math.max(160, window.innerHeight * 0.27)
			)
				current = heading.id;
		}
		active = current;
	}
	function collectHeadings() {
		const nodes = Array.from(
			document.querySelectorAll<HTMLElement>('#article-body h2, #article-body h3')
		).filter((node) => !node.closest('.how-grid,.unit-list,.terms'));
		const used = new Set<string>();
		headings = nodes.map((node, index) => {
			let id =
				node.id ||
				(node.textContent ?? '')
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, '')
					.trim()
					.replace(/\s+/g, '-') ||
				`section-${index}`;
			if (used.has(id)) id += `-${index}`;
			used.add(id);
			node.id = id;
			return { id, text: node.textContent ?? '', level: node.tagName === 'H2' ? 2 : 3 };
		});
		update();
	}
	$effect(() => {
		page.url.pathname;
		let current = true;
		let observer: MutationObserver;
		tick().then(() => {
			if (!current) return;
			collectHeadings();
			feedback = '';
			const article = document.getElementById('article-body');
			if (article) {
				observer = new MutationObserver(collectHeadings);
				observer.observe(article, { childList: true, subtree: true, characterData: true });
			}
		});
		return () => {
			current = false;
			observer?.disconnect();
		};
	});
	onMount(() => {
		let scheduled = false;
		const scroll = () => {
			if (!scheduled) {
				scheduled = true;
				requestAnimationFrame(() => {
					update();
					scheduled = false;
				});
			}
		};
		window.addEventListener('scroll', scroll, { passive: true });
		return () => window.removeEventListener('scroll', scroll);
	});
	async function copy() {
		const response = await fetch(
			page.url.pathname.replace(/\/$/, '') +
				(page.url.pathname === '/docs' ? '/index' : '') +
				'.md',
			{ headers: { Accept: 'text/markdown' } }
		).catch(() => null);
		if (response?.ok) {
			notify(
				(await copyText(await response.text()))
					? 'Page copied as Markdown'
					: 'Clipboard unavailable. Open the Markdown view to copy manually.'
			);
		}
	}
</script>

<aside class="toc-rail" aria-label="On this page">
	<div class="toc-sticky">
		<div class="toc-label">
			<span>On this page</span><svg
				width="15"
				height="15"
				viewBox="0 0 18 18"
				aria-label={`${Math.round(readProgress)}% read`}
				><circle cx="9" cy="9" r="7" fill="none" stroke="var(--border)" stroke-width="1.5" /><circle
					cx="9"
					cy="9"
					r="7"
					fill="none"
					stroke="var(--muted)"
					stroke-width="1.5"
					stroke-dasharray={`${readProgress * 0.44} 44`}
					transform="rotate(-90 9 9)"
				/></svg
			>
		</div>
		<nav class="toc-links">
			{#each headings as heading}<a
					href={`#${heading.id}`}
					class:active={active === heading.id}
					class:nested={heading.level === 3}
					aria-current={active === heading.id ? 'location' : undefined}>{heading.text}</a
				>{/each}
		</nav>
		<div class="rail-actions">
			<button onclick={copy}><Copy size={13} />Copy page as Markdown</button><button
				onclick={() => ask(`Summarize ${page.url.pathname}`)}
				><FileText size={13} />Explain this page</button
			><a href="/docs/customization"><Flag size={13} />Improve this documentation</a>
		</div>
		<div class="feedback">
			<span>Was this page helpful?</span><button
				class:chosen={feedback === 'yes'}
				aria-label="This page was helpful"
				aria-pressed={feedback === 'yes'}
				onclick={() => {
					feedback = 'yes';
					notify('Thanks for your feedback');
				}}><ThumbsUp size={13} /></button
			><button
				class:chosen={feedback === 'no'}
				aria-label="This page needs improvement"
				aria-pressed={feedback === 'no'}
				onclick={() => {
					feedback = 'no';
					notify('Feedback noted for this session');
				}}><ThumbsDown size={13} /></button
			>
		</div>
		<button class="help-button" onclick={() => ask()}
			><img src="/brand/osa-orb.png" alt="" /><span><b>Need help?</b><small>Ask OSA</small></span
			></button
		><button class="back-top" onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			><ArrowUp size={12} />Back to top</button
		>
	</div>
</aside>

<style>
	.toc-rail {
		padding: 38px 22px 0 4px;
		min-width: 0;
	}
	.toc-sticky {
		position: sticky;
		top: 102px;
		font-size: 11px;
	}
	.toc-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 16px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
	}
	.toc-links {
		scrollbar-width: none;
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-height: 40vh;
		overflow: auto;
		padding-bottom: 6px;
	}
	.toc-links a {
		display: block;
		padding: 5px 0 5px 13px;
		border-left: 1px solid var(--border);
		font-size: 11px;
		color: var(--muted);
		line-height: 1.5;
	}
	.toc-links a.active {
		border-color: var(--text);
		color: var(--text);
		font-weight: 500;
	}
	.toc-links a:hover {
		color: var(--text);
	}
	.toc-links a.nested {
		padding-left: 23px;
		font-size: 10px;
	}
	.rail-actions {
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		padding: 14px 0;
		margin-top: 52px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.rail-actions > button,
	.rail-actions > a {
		display: flex;
		align-items: center;
		text-align: left;
		gap: 8px;
		font-size: 11px;
		color: var(--muted);
		padding: 0;
	}
	.rail-actions > button:hover,
	.rail-actions > a:hover {
		color: var(--text);
	}
	.feedback {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 0;
		color: var(--muted);
		font-size: 10px;
	}
	.feedback span {
		margin-right: auto;
	}
	.feedback button {
		padding: 0;
		display: flex;
		color: var(--muted);
	}
	.feedback button.chosen {
		color: var(--green);
	}
	.help-button {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 9px 10px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface-2);
		text-align: left;
	}
	.help-button img {
		width: 24px;
		height: 24px;
	}
	.help-button span {
		display: flex;
		flex-direction: column;
		font-size: 11px;
		line-height: 1.5;
	}
	.help-button b {
		font-weight: 550;
	}
	.help-button small {
		color: var(--muted);
		font-size: 10px;
	}
	.back-top {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--muted);
		font-size: 10px;
		margin-top: 15px;
		padding: 0;
	}
	@media (max-width: 1279px) {
		.toc-rail {
			display: none;
		}
	}
</style>
