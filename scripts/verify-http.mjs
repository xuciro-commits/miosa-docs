#!/usr/bin/env node
/*
 * HTTP-level acceptance for a served build. No browser, so it runs in a few
 * seconds and is safe to use as the everyday deploy gate.
 *
 *   node scripts/verify-http.mjs https://preview-url [--sha <commit>]
 */
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:4173');
const shaArgIndex = process.argv.indexOf('--sha');
const expectedSha = shaArgIndex > -1 ? process.argv[shaArgIndex + 1] : process.env.GITHUB_SHA;

const ROUTES = [
	'/',
	'/docs/',
	'/docs/quickstart/',
	'/docs/api-reference/',
	'/docs/build/lovable/',
	'/docs/learn/labs/sandbox/',
	'/docs/develop/sandboxes/',
	'/docs/guides/agent-product-model/',
	'/pricing/',
	'/status/'
];

const ASSETS = ['/brand/miosa-black.png', '/fonts/Geist.woff2', '/docs-assets/brands/railway.svg'];

const failures = [];
const fail = (message) => failures.push(message);

async function get(path, attempt = 0) {
	try {
		const response = await fetch(new URL(path, base), { redirect: 'follow' });
		if (response.status === 200) return response;
		if (attempt < 5) {
			await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
			return get(path, attempt + 1);
		}
		return response;
	} catch (error) {
		if (attempt < 5) {
			await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
			return get(path, attempt + 1);
		}
		fail(`${path} threw ${error.message}`);
		return null;
	}
}

for (const route of ROUTES) {
	const response = await get(route);
	if (!response) continue;
	if (response.status !== 200) {
		fail(`${route} returned ${response.status}`);
		continue;
	}
	const html = await response.text();
	if (!/\/_app\/immutable\/bundle\.[A-Za-z0-9_-]+\.js/.test(html))
		fail(`${route} does not reference the application bundle`);
}

for (const asset of ASSETS) {
	const response = await get(asset);
	if (response && response.status !== 200) fail(`asset ${asset} returned ${response.status}`);
}

const release = await get('/release.json');
if (release) {
	try {
		const data = await release.json();
		if (expectedSha && data.commit !== expectedSha)
			fail(`release.json commit ${String(data.commit).slice(0, 8)} does not match ${expectedSha.slice(0, 8)}`);
	} catch {
		fail('release.json is not valid JSON');
	}
}

const schema = await get('/openapi.json');
if (schema) {
	try {
		const data = await schema.json();
		if (data.servers?.[0]?.url !== '/') fail('openapi.json server url is not relative');
	} catch {
		fail('openapi.json is not valid JSON');
	}
}

if (failures.length) {
	console.error(`verify-http: ${failures.length} failure(s) for ${base.origin}`);
	for (const message of failures) console.error(`  ${message}`);
	process.exit(1);
}

console.log(
	`verify-http: ${base.origin} ok · ${ROUTES.length} routes · ${ASSETS.length} assets · commit ${String(expectedSha ?? 'unknown').slice(0, 8)}`
);