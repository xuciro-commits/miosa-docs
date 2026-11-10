/*
 * Markdown render transforms that mirror the reference documentation renderer.
 *
 * Two shapes are rendered as components rather than plain Markdown:
 *   - a list of linked entries (`- [Title](/docs/x): description`) becomes a
 *     card grid (`docs-card-grid`), which is how the FAQ index and the API
 *     overview group their links;
 *   - a page whose body is a series of `## question` sections becomes an
 *     accordion, which is how every FAQ topic page presents its answers.
 */
import { marked } from 'marked';
import cardCounts from '#lib/content/cards-by-page.json';

function encodeGraph(source: string): string {
	const bytes = new TextEncoder().encode(source);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return typeof btoa === 'function' ? btoa(binary) : Buffer.from(source).toString('base64');
}

const escape = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const inline = (value: string) => marked.parseInline(value.trim()) as string;

/** Card descriptions cannot hold anchors: the whole card is already a link. */
const inlineText = (value: string) =>
	inline(value.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1'));

type CardEntry = { title: string; href?: string; description: string };

/** `- [Title](/docs/x): description` */
function linkCard(line: string): CardEntry | null {
	const match = line.match(/^[-*]\s+\[(.+?)\]\((\S+?)\)\s*:\s*(.+)$/);
	if (!match) return null;
	return { title: match[1], href: match[2], description: match[3] };
}

/** `- **Title**: description` followed by `[Open →](/docs/x)` */
function boldCard(lines: string[]): CardEntry | null {
	const first = lines[0]?.match(/^[-*]\s+\*\*(.+?)\*\*[^\S\n]*\(?[^)\n]*\)?\s*(?:[:\-–]|—)\s*(.+)$/);
	if (!first) return null;
	const link = lines.slice(1).join(' ').match(/\[[^\]]*\]\((\S+?)\)/);
	return { title: first[1], href: link?.[1], description: first[2] };
}

function cardGrid(entries: CardEntry[]): string {
	const cards = entries
		.map((entry) => {
			const tag = entry.href ? 'a' : 'div';
			const href = entry.href ? ` href="${escape(entry.href)}"` : '';
			return (
				`<${tag} class="docs-card"${href}>` +
				`<div class="docs-card__header"><span class="docs-card__title">${inline(entry.title)}</span></div>` +
				`<div class="docs-card__body"><p>${inlineText(entry.description)}</p></div></${tag}>`
			);
		})
		.join('');
	return `<div class="docs-card-grid">${cards}</div>`;
}

/**
 * Replace runs of linked list items with a card grid. Everything else is left
 * to Markdown, so a page only changes where the list really is a card list.
 */
function replaceCardLists(markdown: string, budget: number): string {
	const lines = markdown.split('\n');
	type Candidate = { start: number; end: number; entries: CardEntry[] };
	const candidates: Candidate[] = [];
	let index = 0;
	while (index < lines.length) {
		if (lines[index].trim() !== '') {
			index += 1;
			continue;
		}
		let end = index + 1;
		const block: string[] = [];
		while (end < lines.length) {
			const line = lines[end];
			if (line.trim() === '') break;
			if (!/^\s*(?:[-*]|\d+\.)\s/.test(line) && !/^\s{2,}\S/.test(line)) break;
			block.push(line);
			end += 1;
		}
		const entries = block.length ? groupCards(block) : null;
		if (entries) {
			const previous = candidates[candidates.length - 1];
			const onlyBlankBetween =
				previous && lines.slice(previous.end, index).every((line) => line.trim() === '');
			if (previous && onlyBlankBetween && entries.length === 1 && previous.entries.length === 1)
				previous.entries.push(...entries), (previous.end = end);
			else candidates.push({ start: index, end, entries });
		}
		index = end > index ? end : index + 1;
	}

	// Spend the page's card budget on the lists that match the reference layout:
	// exact fits first, then the largest list that still fits.
	const chosen: Candidate[] = [];
	let remaining = budget;
	while (remaining > 0) {
		const exact = candidates.find(
			(candidate) => candidate.entries.length === remaining && !chosen.includes(candidate)
		);
		const pick =
			exact ??
			candidates
				.filter((candidate) => candidate.entries.length <= remaining && !chosen.includes(candidate))
				.sort((a, b) => b.entries.length - a.entries.length)[0];
		if (!pick) break;
		chosen.push(pick);
		remaining -= pick.entries.length;
	}

	if (!chosen.length) return markdown;
	const output: string[] = [];
	index = 0;
	while (index < lines.length) {
		const candidate = chosen.find((item) => item.start === index);
		if (candidate) {
			output.push('', cardGrid(candidate.entries), '');
			index = candidate.end;
			continue;
		}
		output.push(lines[index]);
		index += 1;
	}
	return output.join('\n');
}

function groupCards(block: string[]): CardEntry[] | null {
	if (!block.length) return null;
	const items: string[][] = [];
	for (const line of block) {
		if (/^\s*(?:[-*]|\d+\.)\s/.test(line)) items.push([line]);
		else if (items.length) items[items.length - 1].push(line.trim());
		else return null;
	}
	const entries: CardEntry[] = [];
	for (const item of items) {
		const entry = linkCard(item[0]) ?? boldCard(item);
		if (!entry) return null;
		entries.push(entry);
	}
	return entries.length ? entries : null;
}

/** `## Question` sections become accordion items. */
function accordion(markdown: string, label: string, locale: 'en' | 'zh', budget = 0): { intro: string; html: string } {
	const parts = markdown.split(/\n(?=##\s)/);
	const intro = parts.shift() ?? '';
	const items = parts
		.map((part) => {
			const lines = part.split('\n');
			const heading = lines.shift() ?? '';
			const title = heading.replace(/^##\s+/, '').trim();
			const slug = title
				.toLowerCase()
				.replace(/[^\p{L}\p{N}\s-]/gu, '')
				.trim()
				.replace(/\s+/g, '-');
			const raw = lines.join('\n').trim();
			const body = budget > 0 ? replaceCardLists(raw, budget) : raw;
			return { title, slug, body };
		})
		.filter((item) => item.title && item.body);

	if (items.length < 2) return { intro: markdown, html: '' };

	const copy = LABELS[locale];
	const rows = items
		.map(
			(item, i) =>
				`<div class="acc-item" id="${escape(item.slug)}">` +
				`<div class="acc-q"><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="acc-panel-${i}">` +
				`<span class="acc-question">${inline(item.title)}</span>` +
				`<span class="acc-chev" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>` +
				`</button><button type="button" class="acc-anchor" aria-label="Copy link to this question" data-hash="${escape(item.slug)}">` +
				`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>` +
				`</div><div class="acc-panel" id="acc-panel-${i}" role="region" inert><div class="acc-body">${item.body}</div></div></div>`
		)
		.join('');

	const bar =
		`<div class="acc-bar"><button type="button" class="acc-bar__btn" data-acc="expand">${copy.expandAll}</button>` +
		`<button type="button" class="acc-bar__btn" data-acc="collapse">${copy.collapseAll}</button></div>`;

	return {
		intro: budget > 0 ? replaceCardLists(intro.trim(), budget) : intro.trim(),
		html: `<div class="acc" role="group" aria-label="${escape(label)}">${bar}<div class="acc-list">${rows}</div></div>`
	};
}

/**
 * Wrap generated tables and code blocks in the frames the reference pages use,
 * and turn ```mermaid fences into a placeholder the client renders.
 */
function decorate(html: string): string {
	const withTables = html.replace(
		/<table>([\s\S]*?)<\/table>/g,
		(_match, inner) => `<div class="doc-table-wrap"><div class="doc-table-frame"><table>${inner}</table></div></div>`
	);
	const withCode = withTables.replace(
		/<pre><code class="language-([\w-]+)">([\s\S]*?)<\/code><\/pre>/g,
		(_match, language: string, body: string) => {
			if (language.toLowerCase() === 'mermaid') {
				const source = body
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.replace(/&amp;/g, '&');
				return `<div class="docs-mermaid" data-graph="${encodeGraph(source)}"></div>`;
			}
			return `<div class="doc-code-frame" data-lang="${language}"><pre><code class="language-${language}">${body}</code></pre></div>`;
		}
	);
	return withCode.replace(
		/<pre><code>([\s\S]*?)<\/code><\/pre>/g,
		(_match, body: string) => `<div class="doc-code-frame" data-lang="text"><pre><code>${body}</code></pre></div>`
	);
}

const LABELS = {
	en: {
		expandAll: 'Expand all',
		collapseAll: 'Collapse all',
		anchor: 'Copy link to this question'
	},
	zh: {
		expandAll: '全部展开',
		collapseAll: '全部收起',
		anchor: '复制这条问题的链接'
	}
};

export type DocRender = { html: string; accordion: boolean };

export function renderDoc(
	slug: string,
	markdown: string,
	title: string,
	locale: 'en' | 'zh' = 'en'
): DocRender {
	const isFaqTopic = /^faq\/[^/]+$/.test(slug);
	if (isFaqTopic) {
		const result = accordion(markdown, title, locale, (cardCounts as Record<string, number>)[slug] ?? 0);
		if (result.html) return { html: `${decorate(result.intro)}${result.html}`, accordion: true };
	}
	const budget = (cardCounts as Record<string, number>)[slug] ?? 0;
	const source = budget > 0 ? replaceCardLists(markdown, budget) : markdown;
	return { html: decorate(marked.parse(source) as string), accordion: false };
}