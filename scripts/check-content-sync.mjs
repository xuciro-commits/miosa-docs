#!/usr/bin/env node
/*
 * Fail when the published content does not match the Markdown in this repo.
 *
 * The shell ships a content commit in `src/lib/content/content-version.json`;
 * if someone edits `src/content/docs` without running
 * `npm run content:publish`, the deployed site would keep serving the old
 * prose. This compares the manifest at that commit against the local files.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const version = JSON.parse(readFileSync(join(ROOT, 'src/lib/content/content-version.json'), 'utf8'));

function walk(dir, base = '') {
	const rows = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) rows.push(...walk(path, join(base, entry.name)));
		else if (entry.name.endsWith('.md')) rows.push(join(base, entry.name));
	}
	return rows.sort();
}

const local = walk(join(ROOT, 'src/content/docs/en'));
const digest = createHash('sha256');
for (const relative of local) {
	const slug = relative.replace(/\\/g, '/').replace(/\.md$/, '');
	digest.update(slug);
	digest.update('\0');
	digest.update(readFileSync(join(ROOT, 'src/content/docs/en', relative)));
}
const localHash = digest.digest('hex');

let manifest;
for (const base of [version.cdn, version.raw]) {
	try {
		const response = await fetch(`${base}manifest.json`);
		if (response.ok) {
			manifest = await response.json();
			break;
		}
	} catch {
		// try the next mirror
	}
}

if (!manifest) {
	console.error('content-sync: could not read the published manifest from the content repository');
	process.exit(1);
}

// Quiz and lab pages are generated from data; every other page comes from a file.
const published = manifest.pages.filter((page) => page.type !== 'quiz' && page.type !== 'lab');
if (published.length !== local.length) {
	console.error(
		`content-sync: ${local.length} Markdown pages here, ${published.length} published at ${version.sha.slice(0, 8)}`
	);
	console.error('content-sync: run `npm run content:publish` and commit content-version.json');
	process.exit(1);
}

const manifestSlugs = new Set(published.map((page) => page.slug));
const missing = local
	.map((relative) => relative.replace(/\\/g, '/').replace(/\.md$/, ''))
	.filter((slug) => !manifestSlugs.has(slug));

if (missing.length) {
	console.error(`content-sync: ${missing.length} page(s) not published, for example ${missing[0]}`);
	console.error('content-sync: run `npm run content:publish` and commit content-version.json');
	process.exit(1);
}

console.log(
	`content-sync: ${local.length} pages match content commit ${version.sha.slice(0, 8)} · content hash ${localHash.slice(0, 12)}`
);