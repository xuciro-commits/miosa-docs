#!/usr/bin/env node
/*
 * Content guard for the bilingual docs tree.
 *
 * Errors (block the commit / the build):
 *   - missing or malformed frontmatter fields
 *   - slug that does not match the file path
 *   - a page that exists in one language but not the other (unless allowlisted)
 *   - structural drift between the en and zh Markdown (headings, fences, table cells)
 *   - leftover translation placeholders
 *   - unbalanced or glued code fences
 *   - committed secrets and oversized files
 *
 * Warnings (printed, exit 0 unless --strict):
 *   - English prose left in a Chinese page
 *   - machine-translated product names
 *   - duplicated numeric table cells
 */
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';

const ROOT = process.cwd();
const DOCS = 'src/content/docs';
const LANGS = ['en', 'zh'];

/** Pages that intentionally exist in one language only. */
const SINGLE_LANGUAGE_ALLOWLIST = new Set([
	// 'en/some-page.md',
]);

const REQUIRED_FIELDS = ['slug', 'title', 'description', 'section', 'order'];

const PLACEHOLDER_PATTERNS = [
	/\[\[\[(?:CODE|INLINE|HTML|URL|代码|内联|网址)\d+\]\]\]/,
	/@@\d+@@/,
	/\{\{PLACEHOLDER_\d+\}\}/
];

const BAD_TERMS = [
	'米奥萨',
	'铁路',
	'云耀',
	'韦尔塞尔',
	'莫代尔',
	'法学硕士',
	'神器',
	'安全带',
	'剧作家',
	'木偶师',
	'最佳发动机'
];

// Documentation samples use obvious placeholders, so they are excluded on purpose.
const SAMPLE_KEY = /(?:your[_-]?key|xxx{2,}|a1b2c3d4|x{4,}|\.\.\.|<[^>]+>)/i;
const SECRET_PATTERNS = [
	/\bmsk_[A-Za-z0-9_-]{12,}/,
	/\bsk-[A-Za-z0-9]{20,}/,
	/\bAKIA[0-9A-Z]{16}\b/,
	/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/
];

const MAX_FILE_BYTES = 2 * 1024 * 1024;

/** Table rows whose numbers legitimately differ; see .content-qa-allow.json. */
let tableNumberAllowlist = {};
try {
	tableNumberAllowlist = JSON.parse(readFileSync('.content-qa-allow.json', 'utf8')).tableNumbers ?? {};
} catch {}

const args = new Set(process.argv.slice(2));
const staged = args.has('--staged');
const strict = args.has('--strict');
const quiet = args.has('--quiet');

const errors = [];
const warnings = [];

function fail(file, message) {
	errors.push(`${file}: ${message}`);
}
function warn(file, message) {
	warnings.push(`${file}: ${message}`);
}

function changedFiles() {
	try {
		const out = execFileSync(
			'git',
			['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
			{ encoding: 'utf8' }
		);
		return out.split('\n').filter(Boolean);
	} catch {
		return [];
	}
}

function allDocFiles() {
	try {
		const out = execFileSync('git', ['ls-files', `${DOCS}/**/*.md`], { encoding: 'utf8' });
		const tracked = out.split('\n').filter(Boolean);
		if (tracked.length) return tracked;
	} catch {}
	// Fallback for a fresh checkout without git metadata.
	return walk(join(ROOT, DOCS)).map((file) => relative(ROOT, file));
}

function walk(dir) {
	const { readdirSync } = require('node:fs');
	const found = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...walk(path));
		else if (entry.name.endsWith('.md')) found.push(path);
	}
	return found;
}

function parseFrontmatter(source) {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { fields: null, body: source };
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

function structure(body) {
	const withoutFences = body.replace(/```[\s\S]*?```/g, '');
	return {
		headings: withoutFences
			.split(/\r?\n/)
			.filter((line) => /^#{1,6} \S/.test(line))
			.map((line) => (line.match(/^#+/) ?? [''])[0].length),
		fences: (body.match(/^```/gm) ?? []).length,
		tables: withoutFences
			.split(/\r?\n/)
			.filter((line) => line.trim().startsWith('|'))
			.map((line) => line.split('|').length - 1)
	};
}

const files = staged ? changedFiles() : allDocFiles();
const docs = files.filter((file) => file.startsWith(`${DOCS}/`) && file.endsWith('.md'));

if (!docs.length) {
	if (!quiet) console.log('content-qa: no documentation files to check');
	process.exit(0);
}

const parsed = new Map();

for (const file of docs) {
	let source;
	try {
		source = readFileSync(join(ROOT, file), 'utf8');
	} catch {
		continue; // deleted in this change set
	}

	let size = 0;
	try {
		size = statSync(join(ROOT, file)).size;
	} catch {}
	if (size > MAX_FILE_BYTES) fail(file, `file is ${(size / 1024 / 1024).toFixed(1)} MB, over the 2 MB limit`);

	const { fields, body } = parseFrontmatter(source);
	if (!fields) {
		fail(file, 'missing frontmatter block');
		continue;
	}

	for (const field of REQUIRED_FIELDS)
		if (!fields[field]) fail(file, `frontmatter is missing "${field}"`);

	const parts = file.split('/');
	const lang = parts[parts.length - 2] === 'en' || parts[parts.length - 2] === 'zh' ? parts[parts.length - 2] : parts[3];
	const slugParts = parts.slice(parts.indexOf('docs') + 2);
	const slugFromPath = slugParts.join('/').replace(/\.md$/, '');
	if (fields.slug && fields.slug !== slugFromPath)
		fail(file, `slug "${fields.slug}" does not match the file path "${slugFromPath}"`);
	if (fields.order && Number.isNaN(Number(fields.order)))
		fail(file, `order "${fields.order}" is not a number`);

	for (const pattern of PLACEHOLDER_PATTERNS)
		if (pattern.test(source)) {
			fail(file, 'leftover translation placeholder');
			break;
		}

	for (const pattern of SECRET_PATTERNS) {
		const match = source.match(pattern);
		if (!match || SAMPLE_KEY.test(match[0])) continue;
		fail(file, `looks like a committed secret (${match[0].slice(0, 12)}…)`);
		break;
	}

	if (/^```/m.test(body)) {
		const fences = (body.match(/^```/gm) ?? []).length;
		if (fences % 2 !== 0) fail(file, `unbalanced code fences (${fences})`);
		const glued = body
			.split(/\r?\n/)
			.filter((line) => line.includes('```') && !/^\s*(?:>\s*)?```/.test(line));
		if (glued.length) fail(file, `code fence glued to text on line "${glued[0].trim().slice(0, 40)}"`);
	}

	parsed.set(`${lang}/${slugFromPath}`, { file, fields, body });
}

// Cross-language pairing and structural parity.
for (const [key, entry] of parsed) {
	const lang = key.slice(0, key.indexOf('/'));
	const slug = key.slice(key.indexOf('/') + 1);
	const otherLang = lang === 'en' ? 'zh' : 'en';
	const other = parsed.get(`${otherLang}/${slug}`) ?? readPair(otherLang, slug);
	if (!other) {
		if (!SINGLE_LANGUAGE_ALLOWLIST.has(key) && !SINGLE_LANGUAGE_ALLOWLIST.has(`${otherLang}/${slug}`))
			fail(entry.file, `no ${otherLang} counterpart at ${DOCS}/${otherLang}/${slug}.md`);
		continue;
	}
	if (lang !== 'en') continue;

	const a = structure(entry.body);
	const b = structure(other.body);
	if (a.headings.length !== b.headings.length)
		fail(entry.file, `heading count ${a.headings.length} vs ${b.headings.length} in ${other.file}`);
	else if (a.headings.join(',') !== b.headings.join(','))
		fail(entry.file, `heading levels differ from ${other.file}`);
	if (a.fences !== b.fences) fail(entry.file, `code fence count ${a.fences} vs ${b.fences} in ${other.file}`);
	if (a.tables.length !== b.tables.length)
		fail(entry.file, `table row count ${a.tables.length} vs ${b.tables.length} in ${other.file}`);
	else {
		const drift = a.tables.findIndex((cells, index) => cells !== b.tables[index]);
		if (drift >= 0) fail(entry.file, `table row ${drift + 1} cell count differs from ${other.file}`);
		else {
			// Same shape, but machine translation can still glue a value into the next cell.
			const enRows = entry.body.split(/\r?\n/).filter((line) => line.trim().startsWith('|'));
			const zhRows = other.body.split(/\r?\n/).filter((line) => line.trim().startsWith('|'));
			for (let index = 0; index < enRows.length; index += 1) {
				const numbers = (line) =>
					(line.match(/\d+(?:[.,]\d+)*/g) ?? []).map((value) => value.replace(/,/g, ''));
				const enNumbers = numbers(enRows[index]).sort().join(' ');
				const zhNumbers = numbers(zhRows[index] ?? '').sort().join(' ');
				const allowKey = `${other.file.replace(`${DOCS}/`, '')}#${index + 1}`;
				if (enNumbers !== zhNumbers && !tableNumberAllowlist[allowKey]) {
					fail(other.file, `table row ${index + 1} has different numbers than the English source`);
					break;
				}
			}
		}
	}

	// The English table may repeat a value on purpose; only a Chinese extra repetition is suspicious.
	const enTableRows = entry.body.split(/\r?\n/).filter((line) => line.trim().startsWith('|'));
	const zhTableRows = other.body.split(/\r?\n/).filter((line) => line.trim().startsWith('|'));
	const repeated = (line) =>
		line
			.split('|')
			.slice(1, -1)
			.map((cell) => cell.trim())
			.filter((cell, index, cells) => cell && cells.indexOf(cell) !== index && /^[\d.,%]+$/.test(cell))
			.length;
	zhTableRows.forEach((line, index) => {
		if (repeated(line) > repeated(enTableRows[index] ?? ''))
			warn(other.file, `table row ${index + 1} repeats a numeric value that the English row does not`);
	});
}

// Chinese-only quality signals: English prose and machine-translated product names.
for (const [key, entry] of parsed) {
	if (!key.startsWith('zh/')) continue;
	const withoutCode = entry.body.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
	for (const [idx, line] of withoutCode.split(/\r?\n/).entries()) {
		const text = line.trim();
		if (!text || /[\u4e00-\u9fff]/.test(text)) continue;
		if (text.startsWith('|') && (text.match(/[A-Za-z]{3,}/g) ?? []).length < 6) continue;
		if ((text.match(/[A-Za-z']+/g) ?? []).length < 7) continue;
		if (!/\b[a-z]{3,}\b/.test(text) || !/[.,;:]\s|[a-z]\s[a-z]/.test(text)) continue;
		warn(entry.file, `line ${idx + 1} still looks like English prose`);
	}
	for (const term of BAD_TERMS)
		if (entry.body.includes(term)) warn(entry.file, `machine-translated term "${term}"`);
}

function readPair(lang, slug) {
	const path = join(ROOT, DOCS, lang, `${slug}.md`);
	try {
		const source = readFileSync(path, 'utf8');
		const { fields, body } = parseFrontmatter(source);
		return { file: relative(ROOT, path), fields, body };
	} catch {
		return null;
	}
}

if (!quiet) {
	const scope = staged ? 'staged files' : `${docs.length} files`;
	console.log(
		`content-qa: checked ${scope} · ${errors.length} error(s) · ${warnings.length} warning(s)`
	);
	for (const message of warnings.slice(0, 20)) console.warn(`  warn  ${message}`);
	if (warnings.length > 20) console.warn(`  warn  … ${warnings.length - 20} more`);
	for (const message of errors.slice(0, 30)) console.error(`  error ${message}`);
	if (errors.length > 30) console.error(`  error … ${errors.length - 30} more`);
}

if (errors.length || (strict && warnings.length)) process.exit(1);