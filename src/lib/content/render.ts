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
import { tabIcons } from '#lib/content/tab-icons.js';

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
	const match = line.match(/^[-*]\s+\[(.+?)\]\((\S+?)\)\s*(?:[:：]\s*)?(.+)$/);
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
			return `<div class="doc-code-frame" data-lang="${language}"><div class="doc-code-head"><span class="doc-code-lang">${language}</span><button type="button" class="doc-code-copy" data-copy aria-label="Copy code" title="Copy code">${COPY_ICON}</button></div><pre><code class="language-${language}">${body}</code></pre></div>`;
		}
	);
	return groupTabs(withCode).replace(
		/<pre><code>([\s\S]*?)<\/code><\/pre>/g,
		(_match, body: string) =>
			`<div class="doc-code-frame" data-lang="text"><div class="doc-code-head"><span class="doc-code-lang">text</span><button type="button" class="doc-code-copy" data-copy aria-label="Copy code" title="Copy code">${COPY_ICON}</button></div><pre><code>${body}</code></pre></div>`
	);
}

const COPY_ICON =
	'<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5" y="1.75" width="8.25" height="9.5" rx="1.5" stroke="currentColor" stroke-width="1.25"/><path d="M2.75 5.5V12a2 2 0 0 0 2 2H10" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>';

/**
 * Reference pages present alternative install commands as tabs. In Markdown
 * that is a bold label line followed by a code fence, repeated; consecutive
 * runs are turned into the tabbed code group the reference uses.
 */
const LABELLED_FRAME =
	/<p><strong>([^<]{1,24})<\/strong><\/p>\s*(<div class="doc-code-frame"[^>]*><div class="doc-code-head">[\s\S]*?<\/div><pre><code[^>]*>[\s\S]*?<\/code><\/pre><\/div>)/g;

function groupTabs(html: string): string {
	const matches: { index: number; end: number; label: string; block: string }[] = [];
	let match: RegExpExecArray | null;
	LABELLED_FRAME.lastIndex = 0;
	while ((match = LABELLED_FRAME.exec(html)))
		matches.push({ index: match.index, end: match.index + match[0].length, label: match[1].trim(), block: match[2] });
	if (matches.length < 2) return html;

	const groups: typeof matches[] = [];
	for (const item of matches) {
		const current = groups[groups.length - 1];
		const gap = current ? html.slice(current[current.length - 1].end, item.index) : '';
		if (current && gap.trim() === '') current.push(item);
		else groups.push([item]);
	}

	let result = '';
	let cursor = 0;
	for (const group of groups) {
		if (group.length < 2) continue;
		result += html.slice(cursor, group[0].index);
		result += renderTabs(group.map((item) => ({ label: item.label, block: item.block })));
		cursor = group[group.length - 1].end;
	}
	if (!cursor) return html;
	return result + html.slice(cursor);
}

function renderTabs(runs: { label: string; block: string }[]) {
	const tabs = runs
		.map(
			(run, index) =>
				`<button type="button" role="tab" class="docs-tabs__tab${index === 0 ? ' is-active' : ''}" data-tab="${index}" aria-selected="${index === 0}">${tabIcons[run.label] ?? ''}<span>${escape(run.label)}</span></button>`
		)
		.join('');
	const panels = runs
		.map(
			(run, index) =>
				`<div class="docs-tab-panel${index === 0 ? ' is-active' : ''}" data-panel="${index}">${run.block}</div>`
		)
		.join('');
	return `<div class="docs-tabs"><div class="docs-tabs__bar" role="tablist">${tabs}</div>${panels}</div>`;
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



/**
 * Conservative inference for authors who only know standard Markdown: a page
 * that carries two or more lists of linked entries is a hub, so it may be
 * rendered as a card grid without a `layout` declaration. Nothing else is
 * inferred: `collection` and `accordion` reinterpret ordinary section headings,
 * so they must be declared on purpose.
 */
const QUALIFYING_ITEM = /^[-*]\s+(\[[^\]]+\]\(\/docs\/[^)]*\)|\*\*[^*]+\*\*)\s*[:：]\s+\S/;

function countLinkBlocks(markdown: string): number {
	let blocks = 0;
	let run: string[] = [];
	const flush = () => {
		const items = run.filter((line) => QUALIFYING_ITEM.test(line));
		if (items.length >= 2) blocks += 1;
		run = [];
	};
	for (const line of markdown.split('\n')) {
		if (/^[-*]\s+/.test(line)) run.push(line);
		else flush();
	}
	flush();
	return blocks;
}

function inferLayout(markdown: string): string {
	return countLinkBlocks(markdown) >= 2 ? 'cards' : 'default';
}

/**
 * `layout: collection` pages read like the glossary: groups become filter pills,
 * items become collapsible cards with a definition and one line of use. The
 * Markdown shape is `## group` / `### item` / paragraphs / one blockquote.
 */
function collectionBody(markdown: string, locale: 'en' | 'zh'): string {
	const lines = markdown.split('\n');
	type Group = { title: string; description: string; raw: string[]; items: { title: string; body: string; use: string }[] };
	const groups: Group[] = [];
	const preamble: string[] = [];
	let group: Group | null = null;
	let item: { title: string; lines: string[] } | null = null;

	const flushItem = () => {
		if (!group || !item) return;
		const text = item.lines.join('\n').trim();
		const quote = text.match(/^>\s?([\s\S]*)$/m);
		const body = quote ? text.slice(0, text.indexOf(quote[0])).trim() : text;
		const use = quote ? quote[1].replace(/^>\s?/gm, '').trim() : '';
		group.items.push({ title: item.title, body, use });
		item = null;
	};
	const flushGroup = () => {
		flushItem();
		if (group) groups.push(group);
		group = null;
	};

	for (const line of lines) {
		const h2 = line.match(/^##\s+(.+)$/);
		const h3 = line.match(/^###\s+(.+)$/);
		if (h2) {
			flushGroup();
			group = { title: h2[1].trim(), description: '', raw: [], items: [] };
			continue;
		}
		if (h3) {
			flushItem();
			if (!group) group = { title: '', description: '', raw: [], items: [] };
			item = { title: h3[1].trim(), lines: [] };
			continue;
		}
		if (item) item.lines.push(line);
		else if (!group) preamble.push(line);
		else if (group) {
			group.raw.push(line);
			if (line.trim() && !group.description) group.description = line.trim();
			else if (line.trim()) group.description += ' ' + line.trim();
		}
	}
	flushGroup();

	if (!groups.length) return '';

	// A section without items is not a filter group: it stays prose below the set.
	const sectionsWithItems = groups.filter((entry) => entry.items.length);
	const proseSections = groups.filter((entry) => !entry.items.length);

	const label = locale === 'zh'
		? { search: '查找一个词…', use: '实际应用', expand: '全部展开', collapse: '全部收起', items: '条', groups: '组' }
		: { search: 'Find an entry…', use: 'In practice', expand: 'Expand all', collapse: 'Collapse all', items: 'entries', groups: 'groups' };

	const pills = sectionsWithItems
		.map(
			(entry, index) =>
				`<button type="button" class="collection-pill${index === 0 ? ' is-active' : ''}" data-group-tab="${index}">${inline(entry.title)}</button>`
		)
		.join('');

	const sections = sectionsWithItems
		.map((entry, index) => {
			const cards = entry.items
				.map((card) => {
					const body = card.body ? marked.parse(card.body) as string : '';
					const use = card.use
						? `<div class="collection-use"><span>${label.use}</span>${marked.parse(card.use) as string}</div>`
						: '';
					return `<details class="collection-item"><summary><span>${inline(card.title)}</span><span class="collection-chevron" aria-hidden="true"></span></summary><div class="collection-item-body">${body}${use}</div></details>`;
				})
				.join('');
			return `<section class="collection-group${index === 0 ? ' is-active' : ''}" data-group-panel="${index}"><div class="collection-heading"><div><h2>${inline(entry.title)}</h2>${entry.description ? `<p>${inline(entry.description)}</p>` : ''}</div></div><div class="collection-grid">${cards}</div></section>`;
		})
		.join('');

	const totalItems = sectionsWithItems.reduce((total, entry) => total + entry.items.length, 0);
	const lead = preamble.join('\n').trim() ? (marked.parse(preamble.join('\n').trim()) as string) : '';
	return `${lead}<div class="collection" data-collection data-items-label="${label.items}" data-groups-label="${label.groups}">
<div class="collection-toolbar"><label class="collection-search"><input type="search" placeholder="${label.search}" aria-label="${label.search}" /></label><span class="collection-count">${totalItems} ${label.items} · ${sectionsWithItems.length} ${label.groups}</span><button type="button" class="collection-toggle-all" data-collapse="${label.collapse}">${label.expand}</button></div>
<div class="collection-pills">${pills}</div>
${sections}
</div>${proseSections
		.map(
			(entry) =>
				`<section class="collection-prose"><h2>${inline(entry.title)}</h2>${marked.parse(entry.raw.join('\n')) as string}</section>`
		)
		.join('')}`;
}

export function renderDoc(
	slug: string,
	markdown: string,
	title: string,
	locale: 'en' | 'zh' = 'en',
	options: { layout?: string } = {}
): DocRender {
	if (options.layout === 'collection') {
		const rendered = collectionBody(markdown, locale);
		if (rendered) return { html: decorate(rendered), accordion: false };
	}
	// A declared layout always wins; `default` opts out of inference entirely.
	const declared = options.layout ?? null;
	const layout = declared === null ? inferLayout(markdown) : declared === 'default' ? null : declared;
	const isFaqTopic = layout === 'accordion' || /^faq\/[^/]+$/.test(slug);
	if (isFaqTopic) {
		const result = accordion(markdown, title, locale, (cardCounts as Record<string, number>)[slug] ?? 0);
		if (result.html) return { html: `${decorate(result.intro)}${result.html}`, accordion: true };
	}
	// `layout: cards` renders every qualifying list as a card grid; pages without
	// the marker keep the legacy per-page budget from the reference import.
	const budget =
		layout === 'cards' ? Number.MAX_SAFE_INTEGER : ((cardCounts as Record<string, number>)[slug] ?? 0);
	const source = budget > 0 ? replaceCardLists(markdown, budget) : markdown;
	return { html: decorate(marked.parse(source) as string), accordion: false };
}