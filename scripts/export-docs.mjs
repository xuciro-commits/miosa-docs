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
const content = { en: {}, zh: {} };

for (const lang of LANGS) {
	for (const relative of walk(join(ROOT, DOCS, lang))) {
		const slug = relative.replace(/\\/g, '/').replace(/\.md$/, '');
		const { fields, body } = parseFrontmatter(readFileSync(join(ROOT, DOCS, lang, relative), 'utf8'));
		content[lang][slug] = body.trim();
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

// Content is split by language and by top-level section so a page only loads
// the part of the docs it needs. Search gets its own small excerpt file.
const sections = { en: new Map(), zh: new Map() };
for (const lang of LANGS) {
	for (const [slug, markdown] of Object.entries(content[lang])) {
		const section = slug.includes('/') ? slug.split('/')[0] : 'root';
		const bucket = sections[lang].get(section) ?? {};
		bucket[slug] = markdown;
		sections[lang].set(section, bucket);
	}
	for (const [section, bucket] of sections[lang])
		writeFileSync(
			join(ROOT, OUT, `docs-content.${lang}.${section}.json`),
			JSON.stringify(bucket)
		);
	const exclaim = (source) => source;
	const search = pages.map((page) => {
		const markdown = content[lang][page.slug] ?? '';
		return {
			slug: page.slug,
			title: lang === 'zh' ? page.titleZh ?? page.title : page.title,
			description: lang === 'zh' ? page.descriptionZh ?? page.description : page.description,
			section: page.section,
			href: `/docs${page.slug ? '/' + page.slug : ''}`,
			text: exclaim(
				markdown
					.replace(/```[\s\S]*?```/g, ' ')
					.replace(/<[^>]+>/g, ' ')
					.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
					.replace(/[#*_`{}]/g, '')
					.replace(/\s+/g, ' ')
					.trim()
			).slice(0, 240)
		};
	});
	writeFileSync(join(ROOT, OUT, `docs-search.${lang}.json`), JSON.stringify(search));
}

const bytes = (pattern) => {
	const dir = join(ROOT, OUT);
	return readdirSync(dir)
		.filter((name) => pattern.test(name))
		.reduce((total, name) => total + statSync(join(dir, name)).size, 0);
};
const mb = (value) => (value / 1024 / 1024).toFixed(1);
console.log(
	`docs artifacts: manifest ${(statSync(join(ROOT, OUT, 'docs-manifest.json')).size / 1024).toFixed(0)} KB · ` +
		`sections en ${mb(bytes(/^docs-content\.en\./))} MB / zh ${mb(bytes(/^docs-content\.zh\./))} MB · ` +
		`search en ${mb(bytes(/^docs-search\.en\./))} MB / zh ${mb(bytes(/^docs-search\.zh\./))} MB · ${pages.length} pages`
);