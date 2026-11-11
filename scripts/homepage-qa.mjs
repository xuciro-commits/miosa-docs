#!/usr/bin/env node
/*
 * Guard for the homepage definition.
 *
 * Errors (block the commit and the build):
 *   - `content/homepage.json` does not match its schema (shape, allowed types)
 *   - a section references a copy key that no locale defines
 *   - the English and Chinese message tables disagree on the keys
 *   - a preset names a missing section, or does not end with the footer
 *   - a homepage link points at a document that does not exist
 *
 * The point is that copy lives in one place (the message tables) and structure
 * in another (the JSON), so the static page and the app can never drift.
 */
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import {
	assetPaths,
	internalLinks,
	sectionKeys,
	sectionOrder,
	validateDefinition
} from './lib/homepage-rules.mjs';

const ROOT = process.cwd();
const errors = [];
const fail = (message) => errors.push(message);

const definition = JSON.parse(readFileSync(join(ROOT, 'content/homepage.json'), 'utf8'));
for (const problem of validateDefinition(definition)) fail(problem);

// ---------------------------------------------------------------- messages
const messages = JSON.parse(
	execFileSync(
		process.execPath,
		[
			'-e',
			"import('./src/lib/i18n/messages/marketing.ts').then((m) => console.log(JSON.stringify({ en: Object.keys(m.en), zh: Object.keys(m.zh), values: { en: m.en, zh: m.zh } })))"
		],
		{ cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 16 }
	)
);

const enKeys = new Set(messages.en.map((key) => key.replace(/^marketing\./, '')));
// Pricing copy is shared with the pricing page: it lives under marketing.pricing.*
const zhKeys = new Set(messages.zh.map((key) => key.replace(/^marketing\./, '')));
for (const key of enKeys) if (!zhKeys.has(key)) fail(`marketing.${key} exists in en but not in zh`);
for (const key of zhKeys) if (!enKeys.has(key)) fail(`marketing.${key} exists in zh but not in en`);
for (const key of enKeys) {
	const value = messages.values.en[`marketing.${key}`];
	if (typeof value === 'string' && value.trim() === '') fail(`marketing.${key} is empty in en`);
}
for (const key of zhKeys) {
	const value = messages.values.zh[`marketing.${key}`];
	if (typeof value === 'string' && value.trim() === '') fail(`marketing.${key} is empty in zh`);
}

// ------------------------------------------------------- keys and sections
let order = [];
try {
	order = sectionOrder(definition);
} catch (error) {
	fail(error.message);
}

for (const section of order) {
	for (const key of sectionKeys(section))
		if (!enKeys.has(key) && !(key.startsWith('pricing.') && enKeys.has(key))) fail(`unknown copy key "${key}"`);
}

// ------------------------------------------------------------------- links
const manifest = JSON.parse(readFileSync(join(ROOT, 'src/lib/content/docs-manifest.json'), 'utf8'));
const docSlugs = new Set(manifest.pages.map((page) => page.slug));
const standalone = new Set(['/', '/pricing', '/status', '/docs', '/zh']);

for (const section of order) {
	for (const href of internalLinks(section)) {
		if (/^https?:/.test(href)) continue;
		if (standalone.has(href)) continue;
		if (href.startsWith('/docs')) {
			const slug = href.replace(/^\/docs\/?/, '').replace(/\/$/, '');
			if (!slug) continue;
			const known =
				docSlugs.has(slug) ||
				existsSync(join(ROOT, 'src/content/docs/en', `${slug}.md`)) ||
				existsSync(join(ROOT, 'src/content/docs/en', slug, 'index.md'));
			if (!known) fail(`section "${section.name}" links to missing page ${href}`);
		}
	}
}

// ------------------------------------------------------------------ assets
for (const section of order) {
	for (const asset of assetPaths(section)) {
		if (!existsSync(join(ROOT, 'static', asset.replace(/^\//, ''))))
			fail(`section "${section.name}" references missing asset ${asset}`);
	}
}

// ------------------------------------------------------------ pricing plans
const pricing = JSON.parse(readFileSync(join(ROOT, 'src/lib/content/pricing-snapshot.json'), 'utf8'));
const planIds = new Set(pricing.plans.map((plan) => plan.id));
for (const section of order) {
	if (section.type !== 'pricing') continue;
	for (const plan of section.plans ?? [])
		if (!planIds.has(plan.id)) fail(`section "${section.name}" names unknown plan "${plan.id}"`);
}

// ---------------------------------------------------------------- schema file
const schemaPath = join(dirname(join(ROOT, 'content/homepage.json')), 'homepage.schema.json');
if (!existsSync(resolve(schemaPath))) fail('content/homepage.schema.json is missing');

if (errors.length) {
	for (const error of errors) console.error(`homepage-qa: ${error}`);
	console.error(`homepage-qa: ${errors.length} error(s)`);
	process.exit(1);
}
console.log(
	`homepage-qa: ${order.length} sections · ${[...enKeys].length} copy keys × ${Object.keys(definition.locales).length} locales · 0 error(s)`
);
