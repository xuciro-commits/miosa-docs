/*
 * Shared rules for page layout: used by the renderer's inference, the layout
 * report and the content guard, so the three never disagree.
 */
export const LAYOUTS = new Set(['cards', 'accordion', 'collection', 'default']);

// Strict requires the colon: it is the shape the reference pages use for card
// lists, so inference needs it to avoid mistaking prose bullets for entries.
const STRICT_ITEM = /^[-*]\s+(\[[^\]]+\]\(\/docs\/[^)]*\)|\*\*[^*]+\*\*)\s*[:：]\s*\S/;
// Loose allows a link followed directly by text, which declared pages use.
const LOOSE_ITEM = /^[-*]\s+(\[[^\]]+\]\(\/docs\/[^)]*\)|\*\*[^*]+\*\*)\s*(?:[:：]\s*)?\S/;
const LIST_ITEM = /^[-*]\s+/;

/** Consecutive list lines, grouped the way a reader sees them. */
export function listBlocks(body) {
	const blocks = [];
	let run = [];
	for (const line of body.split(/\r?\n/)) {
		if (LIST_ITEM.test(line)) run.push(line);
		else if (run.length) {
			blocks.push(run);
			run = [];
		}
	}
	if (run.length) blocks.push(run);
	return blocks;
}

export function qualifyingBlocks(body, strict = true) {
	const item = strict ? STRICT_ITEM : LOOSE_ITEM;
	return listBlocks(body).filter((block) => block.filter((line) => item.test(line)).length >= 2);
}

export function qualifyingItems(body, strict = true) {
	const item = strict ? STRICT_ITEM : LOOSE_ITEM;
	return listBlocks(body).reduce(
		(total, block) => total + block.filter((line) => item.test(line)).length,
		0
	);
}

export function h2Titles(body) {
	return [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

/** H2 sections that contain at least one H3: the shape a collection needs. */
export function groupedSections(body) {
	let groups = 0;
	let inGroup = false;
	for (const line of body.split(/\r?\n/)) {
		if (/^##\s+/.test(line)) {
			if (inGroup) groups += 1;
			inGroup = false;
		} else if (/^###\s+/.test(line)) inGroup = true;
	}
	if (inGroup) groups += 1;
	return groups;
}

/** Conservative inference: two or more lists of linked entries mean a hub page. */
export function inferLayout(body) {
	return qualifyingBlocks(body, true).length >= 2 ? 'cards' : 'default';
}

/** The layout a page is rendered with: declaration wins, then inference. */
export function resolvedLayout(declared, body) {
	if (declared && declared !== 'default') return declared;
	if (declared === 'default') return 'default';
	return inferLayout(body);
}

/** Problems a declaration has with the page body. */
export function layoutProblems(declared, body) {
	if (!LAYOUTS.has(declared)) return [`unknown layout "${declared}"`];
	const problems = [];
	if (declared === 'cards') {
		if (qualifyingItems(body, false) < 2)
			problems.push('layout: cards needs at least two "link or bold label plus description" list items');
	}
	if (declared === 'accordion' && h2Titles(body).length < 2)
		problems.push('layout: accordion needs at least two "## section" headings');
	if (declared === 'collection' && groupedSections(body) < 2)
		problems.push('layout: collection needs at least two "## group" sections that contain "### items"');
	return problems;
}
