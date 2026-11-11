#!/usr/bin/env node
/*
 * Layout inventory: what each page declares, what inference would give it, and
 * what it therefore renders as. The snapshot lets a renderer change be audited
 * page by page instead of discovered in production.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { inferLayout, layoutProblems, qualifyingItems, resolvedLayout } from './lib/layout-rules.mjs';

const ROOT = process.cwd();
const DOCS = 'src/content/docs';

function walk(dir) {
	const rows = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) rows.push(...walk(path));
		else if (entry.name.endsWith('.md')) rows.push(path);
	}
	return rows;
}

function frontmatter(source) {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};
	const fields = {};
	for (const line of match[1].split(/\r?\n/)) {
		const colon = line.indexOf(':');
		if (colon > 0) fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
	}
	return fields;
}

const pages = [];
for (const file of walk(join(ROOT, DOCS, 'en')).sort()) {
	const source = readFileSync(file, 'utf8');
	const fields = frontmatter(source);
	const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
	const declared = fields.layout ?? null;
	const slug = relative(join(ROOT, DOCS, 'en'), file).replace(/\.md$/, '');
	pages.push({
		slug,
		declared,
		inferred: inferLayout(body),
		rendered: resolvedLayout(declared, body),
		problems: declared ? layoutProblems(declared, body) : []
	});
}

const counts = pages.reduce((acc, page) => {
	acc[page.rendered] = (acc[page.rendered] ?? 0) + 1;
	return acc;
}, {});

const declaredCards = pages.filter((page) => page.declared === 'cards');
const inferredOnly = pages.filter((page) => !page.declared && page.inferred === 'cards');
const problems = pages.filter((page) => page.problems.length);

console.log(`layouts: ${pages.length} pages`);
for (const [layout, count] of Object.entries(counts)) console.log(`  ${layout.padEnd(11)} ${count}`);
console.log(`  declared cards ${declaredCards.length} · inferred cards ${inferredOnly.length}`);
if (problems.length) {
	console.log('declaration problems:');
	for (const page of problems) console.log(`  ${page.slug}: ${page.problems.join('; ')}`);
}
console.log(
	`inferred cards not declared (${inferredOnly.length}): ${inferredOnly.map((p) => p.slug).slice(0, 12).join(', ')}`
);

writeFileSync(
	join(ROOT, 'content/layouts.json'),
	JSON.stringify(
		{
			pages: pages.map((page) => ({
				slug: page.slug,
				declared: page.declared,
				inferred: page.inferred,
				rendered: page.rendered
			}))
		},
		null,
		'\t'
	) + '\n'
);
console.log('wrote content/layouts.json');
