#!/usr/bin/env node
/*
 * Split the documentation into small build-time artifacts:
 *   - docs-manifest.json   titles, descriptions and ordering (bundled, ~100 KB)
 *   - docs-content.<lang>.json   page Markdown per language (loaded on demand)
 * The Markdown used to sit inside one 13 MB bundle; keeping it in lazily
 * imported modules means a visitor downloads only the language they read, and
 * only when they open a documentation page.
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DOCS = 'src/content/docs';
const OUT = 'src/lib/content';

const LANGS = ['en', 'zh'];

function parseFrontmatter(source) {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { fields: {}, body: source };
	const fields = {};
	for (const line of match[1].split(/\r?\n/)) {
		const colon = line.indexOf(':');
		if (colon < 0) continue;
		const key = line.slice(0, colon).trim();
		let value = line.slice(colon + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		)
			value = value.slice(1, -1);
		fields[key] = value;
	}
	return { fields, body: source.slice(match[0].length) };
}

function walk(dir, base = '') {
	const rows = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) rows.push(...walk(path, join(base, entry.name)));
		else if (entry.name.endsWith('.md')) rows.push(join(base, entry.name));
	}
	return rows;
}

const manifest = new Map();

for (const lang of LANGS) {
	for (const relative of walk(join(ROOT, DOCS, lang))) {
		const slug = relative.replace(/\\/g, '/').replace(/\.md$/, '');
		const { fields } = parseFrontmatter(readFileSync(join(ROOT, DOCS, lang, relative), 'utf8'));
		const existing = manifest.get(slug) ?? { slug };
		const entry = {
			...existing,
			...(lang === 'en'
				? {
						title: fields.title ?? slug,
						description: fields.description ?? '',
						section: fields.section ?? '',
						order: Number(fields.order ?? 500000)
					}
				: { titleZh: fields.title, descriptionZh: fields.description })
		};
		manifest.set(slug, entry);
	}
}

const pages = [...manifest.values()]
	.map((page) => ({
		slug: page.slug,
		title: page.title ?? page.slug,
		description: page.description ?? '',
		section: page.section ?? '',
		order: Number.isFinite(page.order) ? page.order : 500000,
		...(page.titleZh ? { titleZh: page.titleZh } : {}),
		...(page.descriptionZh ? { descriptionZh: page.descriptionZh } : {})
	}))
	.sort((a, b) => a.order - b.order);

writeFileSync(
	join(ROOT, OUT, 'docs-manifest.json'),
	JSON.stringify({ pages }, null, '\t') + '\n'
);

console.log(
	`docs manifest: ${(statSync(join(ROOT, OUT, 'docs-manifest.json')).size / 1024).toFixed(0)} KB · ${pages.length} pages (bodies are published to the content repository)`
);