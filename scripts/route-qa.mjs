#!/usr/bin/env node
/*
 * Route and asset integrity for the generated site.
 *
 * Checks the manifest against the content tree, the built route stubs, the
 * static assets those pages reference, and the internal documentation links.
 * Runs in CI right after the build; there is no browser involved.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DOCS = 'src/content/docs';
const BUILD = 'build-static';
const manifest = JSON.parse(readFileSync('src/lib/content/docs-manifest.json', 'utf8')).pages;

const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const slugs = new Set(manifest.map((page) => page.slug));
const specialPrefixes = ['learn/labs/', 'learn/final/'];
const isKnownRoute = (slug) =>
	slugs.has(slug) || slug === '' || specialPrefixes.some((prefix) => slug.startsWith(prefix));

// 1. Every page exists in both languages.
for (const page of manifest)
	for (const lang of ['en', 'zh']) {
		const path = join(ROOT, DOCS, lang, `${page.slug}.md`);
		if (!existsSync(path)) fail(`${lang}/${page.slug}.md is in the manifest but missing on disk`);
	}

const enFiles = readdirSync(join(ROOT, DOCS, 'en'), { recursive: true })
	.filter((name) => typeof name === 'string' && name.endsWith('.md'))
	.map((name) => name.replace(/\.md$/, '').split(/[\\/]/).join('/'));
for (const slug of enFiles)
	if (!slugs.has(slug)) fail(`en/${slug}.md exists but is missing from the manifest (heap regenerates)`);

// 2. The built output has a stub for every route.
if (existsSync(BUILD)) {
	for (const page of manifest) {
		const stub = join(BUILD, 'docs', page.slug, 'index.html');
		if (!existsSync(stub)) fail(`build-static/docs/${page.slug}/index.html is missing`);
	}
	for (const route of ['index.html', '404.html', 'docs/index.html', 'pricing/index.html', 'status/index.html'])
		if (!existsSync(join(BUILD, route))) fail(`build-static/${route} is missing`);
	if (!existsSync(join(BUILD, 'release.json'))) fail('build-static/release.json is missing');
}

// 3. Static assets referenced by any page exist.
const assetRefs = new Set();
for (const lang of ['en', 'zh'])
	for (const file of readdirSync(join(ROOT, DOCS, lang), { recursive: true })) {
		if (typeof file !== 'string' || !file.endsWith('.md')) continue;
		const source = readFileSync(join(ROOT, DOCS, lang, file), 'utf8');
		for (const match of source.matchAll(/\]\((\/(?:docs-assets|brand|fonts)\/[^)\s"]+)\)/g))
			assetRefs.add(match[1]);
		for (const match of source.matchAll(/src="(\/(?:docs-assets|brand|fonts)\/[^"\s]+)"/g))
			assetRefs.add(match[1]);
	}
for (const ref of assetRefs) {
	const clean = ref.split('#')[0].split('?')[0];
	const inStatic = existsSync(join(ROOT, 'static', clean.replace(/^\//, '')));
	const inBuild = existsSync(join(ROOT, BUILD, clean.replace(/^\//, '')));
	if (!inStatic && !inBuild) fail(`referenced asset ${clean} is not in static/`);
}

// 4. Internal documentation links resolve.
const linkRefs = new Set();
for (const lang of ['en', 'zh'])
	for (const file of readdirSync(join(ROOT, DOCS, lang), { recursive: true })) {
		if (typeof file !== 'string' || !file.endsWith('.md')) continue;
		const source = readFileSync(join(ROOT, DOCS, lang, file), 'utf8');
		for (const match of source.matchAll(/\]\((\/docs(?:\/[^)\s"#?]*)?)/g)) {
			const slug = match[1].replace(/^\/docs\/?/, '').replace(/\/$/, '');
			linkRefs.add(slug);
		}
	}
for (const slug of linkRefs) if (!isKnownRoute(slug)) fail(`internal link /docs/${slug} has no page`);

// 5. Large files and names that break static hosting.
if (existsSync(BUILD))
	for (const file of readdirSync(BUILD, { recursive: true })) {
		if (typeof file !== 'string') continue;
		const path = join(BUILD, file);
		const size = statSync(path).size;
		if (size > 20 * 1024 * 1024) warn(`${file} is ${(size / 1024 / 1024).toFixed(1)} MB`);
	}

console.log(
	`route-qa: ${manifest.length} pages · ${assetRefs.size} assets · ${linkRefs.size} internal links · ${errors.length} error(s) · ${warnings.length} warning(s)`
);
for (const message of warnings.slice(0, 10)) console.warn(`  warn  ${message}`);
for (const message of errors.slice(0, 20)) console.error(`  error ${message}`);
if (errors.length) process.exit(1);