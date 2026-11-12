#!/usr/bin/env node
/*
 * Split the documentation into small build-time artifacts:
 *   - docs-manifest.json   titles, descriptions and ordering (bundled, ~100 KB)
 *   - docs-content.<lang>.json   page Markdown per language (loaded on demand)
 * The Markdown used to sit inside one 13 MB bundle; keeping it in lazily
 * imported modules means a visitor downloads only the language they read, and
 * only when they open a documentation page.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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
						...(fields.layout ? { layout: fields.layout } : {}),
						order: Number(fields.order ?? 500000)
					}
				: { titleZh: fields.title, descriptionZh: fields.description })
		};
		manifest.set(slug, entry);
	}
}

/** Pages the shell renders with a component instead of plain prose. */
function pageType(slug) {
	if (slug.startsWith('learn/final/category/')) return { type: 'quiz', quiz: slug.split('/').pop() };
	if (slug.startsWith('learn/labs/')) return { type: 'lab', lab: slug.split('/').pop() };
	if (slug === 'learn/games') return { type: 'game' };
	if (slug === 'learn/videos') return { type: 'video' };
	if (slug === 'learn/earn') return { type: 'earn' };
	if (slug === 'glossary') return { type: 'glossary' };
	if (slug === 'api') return { type: 'openapi' };
	return { type: 'markdown' };
}

const hashOf = (file) => {
	try {
		return createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 10);
	} catch {
		return '';
	}
};

const pages = [...manifest.values()]
	.map((page) => ({
		slug: page.slug,
		title: page.title ?? page.slug,
		description: page.description ?? '',
		section: page.section ?? '',
		...(page.layout ? { layout: page.layout } : {}),
		hash: hashOf(join(ROOT, DOCS, 'en', `${page.slug}.md`)),
		hashZh: hashOf(join(ROOT, DOCS, 'zh', `${page.slug}.md`)),
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
// ---------------------------------------------------------------- published set
// The Markdown itself is served straight from src/content/docs over the CDN, so
// only the generated metadata lives here: what each page is, and the search
// excerpts readers need without downloading every page.
import { mkdirSync } from 'node:fs';
const CONTENT = join(ROOT, 'content');
mkdirSync(join(CONTENT, 'data/learning'), { recursive: true });


const typed = pages.map((page) => ({
	slug: page.slug,
	hash: hashOf(join(ROOT, DOCS, 'en', `${page.slug}.md`)),
	hashZh: hashOf(join(ROOT, DOCS, 'zh', `${page.slug}.md`)),
	...pageType(page.slug),
	title: page.title,
	titleZh: page.titleZh ?? page.title,
	description: page.description,
	descriptionZh: page.descriptionZh ?? page.description,
	section: page.section,
	order: page.order
}));

const learning = JSON.parse(
	execFileSync(
		process.execPath,
		[
			'-e',
			"import('./src/lib/content/learning.ts').then((m) => console.log(JSON.stringify({ categories: m.categories, terms: m.terms, units: m.units, videos: m.videos })))"
		],
		{ cwd: ROOT, encoding: 'utf8' }
	)
);

for (const category of learning.categories)
	typed.push({
		slug: `learn/final/category/${category.id}`,
		type: 'quiz',
		quiz: category.id,
		title: category.name,
		titleZh: category.name,
		description: category.description,
		descriptionZh: category.description,
		section: 'Learn',
		order: 16000 + learning.categories.indexOf(category)
	});
for (const unit of learning.units)
	typed.push({
		slug: `learn/labs/${unit.id}`,
		type: 'lab',
		lab: unit.id,
		title: unit.title,
		titleZh: unit.title,
		description: unit.subtitle,
		descriptionZh: unit.subtitle,
		section: 'Learn',
		order: 17000 + learning.units.indexOf(unit)
	});

writeFileSync(
	join(CONTENT, 'manifest.json'),
	JSON.stringify({ pages: typed }, null, '\t') + '\n'
);
writeFileSync(join(CONTENT, 'data/learning/categories.json'), JSON.stringify(learning, null, '\t') + '\n');

for (const lang of LANGS) {
	const rows = typed.map((page) => {
		let text = page.description ?? '';
		try {
			text = readFileSync(join(ROOT, DOCS, lang, `${page.slug}.md`), 'utf8')
				.replace(/^---[\s\S]*?---\s*/, '')
				.replace(/```[\s\S]*?```/g, ' ')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
				.replace(/[#*_`{}]/g, '')
				.replace(/\s+/g, ' ')
				.trim()
				.slice(0, 240);
		} catch {}
		return {
			slug: page.slug,
			title: lang === 'zh' ? page.titleZh : page.title,
			description: lang === 'zh' ? page.descriptionZh : page.description,
			section: page.section,
			href: `/docs${page.slug ? '/' + page.slug : ''}`,
			text
		};
	});
	writeFileSync(join(CONTENT, `search.${lang}.json`), JSON.stringify(rows) + '\n');
}

// ---------------------------------------------------------------- navigation
// The sidebar reads this file at runtime, so a page added in the editor shows up
// without rebuilding the shell.
const { generatedNavigation } = await import('../src/lib/content/generated-navigation.ts');

const tree = generatedNavigation.map((group) => ({
	...group,
	items: group.items.map((item) => ({ ...item }))
}));

const findNode = (items, slug) => {
	for (const item of items) {
		if (item.slug === slug) return item;
		if (item.children) {
			const hit = findNode(item.children, slug);
			if (hit) return hit;
		}
	}
	return undefined;
};

const countLeaves = (items) =>
	items.reduce((total, item) => total + (item.children?.length ? countLeaves(item.children) : 1), 0);

const sectionToGroup = new Map(
	tree.map((group) => [group.title.toLowerCase(), group])
);

const added = new Map();

for (const page of typed) {
	// Interactive pages are reached from their section, not listed in the sidebar.
	if (page.type === 'quiz' || page.type === 'lab') continue;
	const existing = findNode(tree.flatMap((group) => group.items), page.slug);
	if (existing) {
		existing.title = page.title;
		existing.titleZh = page.titleZh;
		continue;
	}
	const parentSlug = page.slug.includes('/')
		? page.slug.split('/').slice(0, -1).join('/')
		: '';
	const parent = parentSlug
		? findNode(tree.flatMap((group) => group.items), parentSlug)
		: undefined;
	const group =
		sectionToGroup.get((page.section ?? '').toLowerCase()) ??
		sectionToGroup.get('reference') ??
		tree[tree.length - 1];
	const node = {
		slug: page.slug,
		title: page.title,
		titleZh: page.titleZh,
		icon: 'file-text'
	};
	if (parent?.children) parent.children.push(node);
	else if (parent) parent.children = [node];
	else group.items.push(node);
	added.set(group, (added.get(group) ?? 0) + 1);
}

for (const [group, count] of added)
	group.count = String(Number(group.count ?? countLeaves(group.items)) + count);

writeFileSync(join(CONTENT, 'nav.json'), JSON.stringify(tree, null, '\t') + '\n');

console.log(
	`published metadata: ${typed.length} pages · manifest ${(statSync(join(CONTENT, 'manifest.json')).size / 1024).toFixed(0)} KB · ` +
		`search ${(statSync(join(CONTENT, 'search.en.json')).size / 1024).toFixed(0)} KB en / ${(statSync(join(CONTENT, 'search.zh.json')).size / 1024).toFixed(0)} KB zh`
);
