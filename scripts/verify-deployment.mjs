import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:4173');
const spa = process.env.SPA === '1';
const browser = await chromium.launch({
	executablePath:
		process.env.CHROME_PATH ??
		(process.platform === 'darwin'
			? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
			: undefined)
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-US' });
await context.addInitScript(() => localStorage.setItem('miosa:docs-entered', '1'));
const page = await context.newPage();
page.setDefaultTimeout(30000);
page.setDefaultNavigationTimeout(60000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
async function get(url) {
	let last;
	for (let attempt = 0; attempt < 8; attempt += 1) {
		last = await context.request.get(url, { timeout: 30000 });
		if (last.status() === 200) return last;
		await new Promise((resolve) => setTimeout(resolve, 3000));
	}
	return last;
}

	for (const [path, title] of [
		['/', 'Infrastructure for'],
		['/docs/', 'Build on MIOSA'],
		['/pricing/', 'Pay per second']
	]) {
		console.log(`Verify ${path}`);
		const response = await get(new URL(path, base).href);
		assert.equal(response.status(), 200, path);
		if (!spa) assert.match(await response.text(), /<h1\b/, `${path} must contain rendered HTML`);
		await page.goto(new URL(path, base).href);
		await expect(page.locator('h1').first()).toContainText(title, { timeout: 30000 });
	}
	for (const path of ['/docs/quickstart/', '/docs/build/lovable/', '/docs/learn/labs/sandbox/']) {
		console.log(`Verify ${path}`);
		const response = await get(new URL(path, base).href);
		assert.equal(response.status(), 200, path);
	}
	console.log('Verify interactive quickstart');
	await page.goto(new URL('/docs/quickstart/', base).href);
	const codeSample = page.locator('.article-content pre, .code-body pre, .code-body .shiki').first();
	await codeSample.waitFor({ timeout: 30000 });
	await expect(codeSample).toBeVisible({ timeout: 30000 });
	await page.getByRole('button', { name: /Search docs/ }).click();
	await page.getByRole('textbox', { name: 'Search documentation' }).fill('snapshots');
	await page
		.locator('.search-result')
		.filter({ hasText: /restore, pause/i })
		.first()
		.click();
	await expect(page.locator('#article-body>h1')).toHaveText('Snapshots, restore, pause, and forks');
	await page.getByRole('button', { name: 'Ask OSA', exact: true }).click();
	await page
		.getByRole('textbox', { name: 'Ask a documentation question' })
		.fill('What is a sandbox?');
	await page.getByRole('button', { name: 'Send question' }).click();
	await expect(page.locator('.message-text').last()).toContainText('no language model was called');
	for (const path of spa ? [] : [
		'/docs/index.md',
		'/docs/quickstart.md',
		'/docs/build/lovable.md',
		'/docs/learn/labs/sandbox.md'
	]) {
		console.log(`Verify ${path}`);
		const response = await get(new URL(path, base).href);
		assert.equal(response.status(), 200, path);
		assert.match(await response.text(), /^# /);
	}
	const schema = await (await get(new URL('/openapi.json', base).href)).json();
	assert.equal(schema.servers[0].url, '/');
	const release = await (await get(new URL('/release.json', base).href)).json();
	if (process.env.GITHUB_SHA)
		assert.equal(
			release.commit,
			process.env.GITHUB_SHA,
			'Published commit must match this workflow'
		);
	assert.deepEqual(errors, [], 'Browser must not throw');
	console.log(
		JSON.stringify({
			url: base.origin,
			commit: release.commit,
			status: 'passed',
			checks: [
				'rendered HTML',
				'browser hydration',
				'deep routes',
				'search',
				'static Ask',
				'Markdown',
				'relative OpenAPI server'
			]
		})
	);
} finally {
	await browser.close();
}
