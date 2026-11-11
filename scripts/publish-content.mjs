#!/usr/bin/env node
/*
 * Publish the documentation content to the public content repository.
 *
 * The site shell stays on MIOSA; the prose, the page metadata and the data for
 * interactive pages live in `miosa-docs-content` and are read from jsDelivr,
 * pinned to the commit this script prints. That keeps the shell small (no
 * Markdown in the bundle), gives every file a permanent cache entry, and gets
 * gzip/brotli for content, which the static host does not do.
 *
 * Usage:
 *   node scripts/publish-content.mjs            # commit and push, prints the SHA
 *   node scripts/publish-content.mjs --dry-run  # build the tree, do not push
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const REPO = process.env.CONTENT_REPO ?? 'xuciro-commits/miosa-docs-content';
const ROOT = process.cwd();
const DRY = process.argv.includes('--dry-run');
const LANGS = ['en', 'zh'];
const WORK = join(tmpdir(), 'miosa-docs-content-work');

/** Pages whose body is not Markdown: the shell renders a component for them. */
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

const run = (command, args, options = {}) =>
	execFileSync(command, args, { encoding: 'utf8', stdio: 'pipe', ...options });

function walk(dir, base = '') {
	const rows = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) rows.push(...walk(path, join(base, entry.name)));
		else if (entry.name.endsWith('.md')) rows.push(join(base, entry.name));
	}
	return rows;
}

const write = (relative, body) => {
	const target = join(WORK, relative);
	mkdirSync(join(target, '..'), { recursive: true });
	writeFileSync(target, body);
};

// ------------------------------------------------------------------ worktree
rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
if (DRY) {
	run('git', ['init', '-q', WORK]);
	run('git', ['-C', WORK, 'remote', 'add', 'origin', `https://github.com/${REPO}.git`]);
} else {
	run('git', ['clone', '--depth', '1', `https://github.com/${REPO}.git`, WORK]);
}
for (const stale of ['en', 'zh', 'data', 'manifest.json', 'index.md'])
	rmSync(join(WORK, stale), { recursive: true, force: true });

// Data behind the interactive learning pages, straight from the app source.
const learning = JSON.parse(
	run(process.execPath, [
		'-e',
		"import('./src/lib/content/learning.ts').then((m) => console.log(JSON.stringify({ categories: m.categories, terms: m.terms, units: m.units, videos: m.videos })))"
	], { cwd: ROOT })
);

const manifest = JSON.parse(readFileSync(join(ROOT, 'src/lib/content/docs-manifest.json'), 'utf8'));
const pages = new Map();

for (const lang of LANGS) {
	for (const relative of walk(join(ROOT, 'src/content/docs', lang))) {
		const slug = relative.replace(/\\/g, '/').replace(/\.md$/, '');
		const target = join(WORK, lang, relative);
		mkdirSync(join(target, '..'), { recursive: true });
		cpSync(join(ROOT, 'src/content/docs', lang, relative), target);
		if (lang === 'en') pages.set(slug, { slug, ...pageType(slug) });
	}
}

// Generated pages get a stub with frontmatter so the content repository is the
// single source of truth for what each page is and how it is rendered.
const quizIntro = {
	en: (name) => `## ${name}\n\nPick the definition that matches each word, then see how you did.`,
	zh: (name) => `## ${name}\n\n为每个词选出正确的定义，然后查看结果。`
};

for (const category of learning.categories) {
	const slug = `learn/final/category/${category.id}`;
	pages.set(slug, {
		slug,
		type: 'quiz',
		quiz: category.id,
		title: category.name,
		titleZh: category.nameZh ?? category.name,
		description: category.description,
		descriptionZh: category.descriptionZh ?? category.description,
		section: 'Learn',
		order: 16000 + learning.categories.indexOf(category)
	});
	for (const lang of LANGS)
		write(
			`${lang}/${slug}.md`,
			`---\ntype: quiz\nquiz: ${category.id}\ntitle: ${category.name}\n---\n\n${quizIntro[lang](category.name)}\n`
		);
}

for (const unit of learning.units) {
	const slug = `learn/labs/${unit.id}`;
	pages.set(slug, {
		slug,
		type: 'lab',
		lab: unit.id,
		title: unit.title,
		titleZh: unit.titleZh ?? unit.title,
		description: unit.subtitle,
		descriptionZh: unit.subtitleZh ?? unit.subtitle,
		section: 'Learn',
		order: 17000 + learning.units.indexOf(unit)
	});
	for (const lang of LANGS)
		write(
			`${lang}/${slug}.md`,
			`---\ntype: lab\nlab: ${unit.id}\ntitle: ${unit.title}\n---\n\n${unit.subtitle}\n`
		);
}

// Titles, descriptions and ordering for the Markdown pages.
for (const page of manifest.pages) {
	const entry = pages.get(page.slug) ?? { slug: page.slug, ...pageType(page.slug) };
	entry.title = page.title;
	entry.titleZh = page.titleZh ?? page.title;
	entry.description = page.description;
	entry.descriptionZh = page.descriptionZh ?? page.description;
	entry.section = page.section;
	entry.order = page.order;
	pages.set(page.slug, entry);
}

write(
	'manifest.json',
	JSON.stringify({ generated: new Date().toISOString(), pages: [...pages.values()] }, null, '\t') + '\n'
);
write('data/learning/categories.json', JSON.stringify(learning, null, '\t') + '\n');

// Search excerpts: small, one file per language, fetched only when someone
// actually searches.
for (const lang of LANGS) {
	const rows = [];
	for (const page of pages.values()) {
		let text = page.description ?? '';
		const file = join(WORK, lang, `${page.slug}.md`);
		try {
			text = readFileSync(file, 'utf8')
				.replace(/^---[\s\S]*?---\s*/, '')
				.replace(/```[\s\S]*?```/g, ' ')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
				.replace(/[#*_`{}]/g, '')
				.replace(/\s+/g, ' ')
				.trim()
				.slice(0, 240);
		} catch {}
		rows.push({
			slug: page.slug,
			title: lang === 'zh' ? page.titleZh ?? page.title : page.title,
			description: lang === 'zh' ? page.descriptionZh ?? page.description : page.description,
			section: page.section,
			href: `/docs${page.slug ? '/' + page.slug : ''}`,
			text
		});
	}
	write(`data/search.${lang}.json`, JSON.stringify(rows) + '\n');
}
write(
	'index.md',
	`# MIOSA docs content

Generated from the site repository. Do not edit by hand: run
\`node scripts/publish-content.mjs\` in \`miosa-docs\` instead.

- \`manifest.json\` — every page: slug, titles (en/zh), section, order, page type
- \`en/<slug>.md\`, \`zh/<slug>.md\` — page bodies, frontmatter included
- \`data/learning/categories.json\` — data behind the learning checks and labs
`
);

if (DRY) {
	console.log(`dry run: content tree at ${WORK} · ${pages.size} pages`);
	process.exit(0);
}

// -------------------------------------------------------------- commit, push
run('git', ['-C', WORK, 'add', '-A']);
if (!run('git', ['-C', WORK, 'status', '--porcelain']).trim()) {
	const sha = run('git', ['-C', WORK, 'rev-parse', 'HEAD']).trim();
	console.log(`unchanged · content sha ${sha}`);
	writeVersion(sha);
	process.exit(0);
}
run('git', [
	'-C',
	WORK,
	'-c',
	'user.name=miosa-docs',
	'-c',
	'user.email=docs@norsky.cn',
	'commit',
	'-q',
	'-m',
	`Publish docs content ${new Date().toISOString().slice(0, 16)}Z`
]);
run('git', ['-C', WORK, 'push', '-q', 'origin', 'HEAD:main']);
const sha = run('git', ['-C', WORK, 'rev-parse', 'HEAD']).trim();
console.log(`published · content sha ${sha} · ${pages.size} pages`);
writeVersion(sha);

function writeVersion(contentSha) {
	writeFileSync(
		join(ROOT, 'src/lib/content/content-version.json'),
		JSON.stringify(
			{
				repo: REPO,
				sha: contentSha,
				cdn: `https://cdn.jsdelivr.net/gh/${REPO}@${contentSha}/`,
				raw: `https://raw.githubusercontent.com/${REPO}/${contentSha}/`
			},
			null,
			'\t'
		) + '\n'
	);
}