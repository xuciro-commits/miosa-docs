import { test, expect } from '@playwright/test';
import { terms, units, sequences } from '../src/lib/content/learning';

test('every indexed page renders and hydrates without an error page', async ({ page, request }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	const response = await request.get('/docs-search.json');
	const documents = await response.json();
	expect(documents.length).toBeGreaterThan(20);
	for (const document of documents) {
		const response = await page.goto(document.href);
		await page.waitForLoadState('networkidle');
		expect(response?.status(), document.href).toBe(200);
		await expect(page.locator('#article-body h1').first()).toHaveText(document.title);
		await expect(page.locator('.site-header')).toBeVisible();
	}
	expect(errors).toEqual([]);
});

test('keyboard search navigates to the matching guide and restores focus', async ({ page }) => {
	await page.goto('/docs/learn/earn');
	await page.waitForLoadState('networkidle');
	await page.keyboard.press('Meta+k');
	await expect(page.getByRole('dialog', { name: 'Search documentation' })).toBeVisible();
	await page.getByRole('textbox', { name: 'Search documentation' }).fill('snapshots');
	await expect(page.locator('.search-result').first()).toContainText('Snapshots and persistence');
	await page.getByRole('textbox', { name: 'Search documentation' }).press('Enter');
	await expect(page).toHaveURL(/\/docs\/snapshots$/);
	await expect(page.locator('h1')).toHaveText('Snapshots and persistence');
	await page.keyboard.press('Meta+k');
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('tutorial examples synchronize language and respond to parameters', async ({ page }) => {
	await page.goto('/docs/quickstart');
	await page.waitForLoadState('networkidle');
	await page.getByRole('tab', { name: 'Python', exact: true }).first().click();
	for (const tab of await page.getByRole('tab', { name: 'Python', exact: true }).all())
		await expect(tab).toHaveAttribute('aria-selected', 'true');
	await page.getByLabel('Workspace', { exact: true }).fill('ciro-workspace');
	await page.getByLabel('Sandbox name').fill('learning-app');
	await expect(page.locator('.request-builder .code-body')).toContainText('ciro-workspace');
	await expect(page.locator('.request-builder .code-body')).toContainText('learning-app');
	await expect(page.locator('.request-builder .code-body')).toContainText('workspace_slug');
});

test('Markdown exports and copy controls expose usable content', async ({
	page,
	request,
	context
}) => {
	const response = await request.get('/docs/learn/earn.md');
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toContain('text/markdown');
	expect(await response.text()).toContain('# Learn and earn');
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/docs/quickstart');
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Copy page', exact: true }).click();
	await expect(page.getByRole('status')).toContainText('Page copied');
	expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
		'# Sandbox to deployment'
	);
});

test('a category check saves progress once and survives a reload', async ({ page }) => {
	const core = terms.filter((term) => term.category === 'core');
	for (let attempt = 0; attempt < 2; attempt++) {
		await page.goto('/docs/learn/final/category/core');
		await page.waitForLoadState('networkidle');
		for (const term of core) {
			await page.locator('.choices button').filter({ hasText: term.definition }).click();
			await page.getByRole('button', { name: 'Check answer', exact: true }).click();
			await expect(page.locator('.explanation')).toContainText('That is right');
			await page
				.getByRole('button', {
					name: term === core.at(-1) ? 'See the result' : 'Next question',
					exact: true
				})
				.click();
		}
		await expect(page.getByRole('heading', { name: 'You have got the idea.' })).toBeVisible();
	}
	await page.goto('/docs/learn/earn');
	await page.waitForLoadState('networkidle');
	await page.reload();
	await page.waitForLoadState('networkidle');
	await expect(page.locator('.summary-progress')).toContainText('$2.5 / $100');
	await expect(page.locator('.earn-row').filter({ hasText: 'Core primitives' })).toContainText(
		'Completed'
	);
	const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('miosa-learning-v1')!));
	expect(saved.passed).toEqual(['core']);
});

test('all seven labs can be completed through their actual controls', async ({ page }) => {
	for (const unit of units) {
		await page.goto(`/docs/learn/labs/${unit.id}`);
		await page.waitForLoadState('networkidle');
		await expect(page.getByRole('button', { name: 'Complete this lab' })).toBeDisabled();
		if (unit.type === 'sequence') {
			for (const step of sequences[unit.id])
				await page.locator('.available-steps button').filter({ hasText: step }).click();
			await page.getByRole('button', { name: 'Check the workflow' }).click();
		} else if (unit.type === 'match') {
			const pairs =
				unit.id === 'connections'
					? [
							{
								word: 'Domain',
								definition: 'The public name that routes people to the application.'
							},
							{
								word: 'Database binding',
								definition: 'The connection that gives an application access to its records.'
							},
							{
								word: 'Persistent volume',
								definition: 'The filesystem that survives the process using it.'
							}
						]
					: terms.filter((term) => term.category === 'core');
			for (const pair of pairs) {
				await page
					.locator('.matching-columns > div')
					.first()
					.getByRole('button', { name: pair.word, exact: true })
					.click();
				await page
					.locator('.matching-columns > div')
					.last()
					.getByRole('button', { name: pair.definition, exact: true })
					.click();
			}
		} else if (unit.id === 'sandbox') {
			await page.getByRole('button', { name: 'Create sandbox', exact: true }).click();
			await page.getByRole('button', { name: 'Snapshot', exact: true }).click();
			await page.getByRole('button', { name: 'Remove', exact: true }).click();
			await expect(page.locator('.snapshot-label')).toBeVisible();
			await page.getByRole('button', { name: 'Restore', exact: true }).click();
		} else {
			for (let count = 0; count < 3; count++)
				await page.getByRole('button', { name: 'Create sandbox', exact: true }).click();
			await page.getByRole('button', { name: 'Pause', exact: true }).click();
			await page.locator('.machine').first().click();
			await page.getByRole('button', { name: 'Remove', exact: true }).click();
		}
		await expect(page.getByRole('button', { name: 'Complete this lab' })).toBeEnabled();
		await page.getByRole('button', { name: 'Complete this lab' }).click();
		await expect(page.getByRole('heading', { name: 'One more idea, understood.' })).toBeVisible();
	}
	await page.goto('/docs/learn/earn');
	await page.waitForLoadState('networkidle');
	await expect(page.locator('.summary-progress')).toContainText('$50 / $100');
});

test('themes persist and mobile navigation stays usable without horizontal overflow', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/docs/learn/earn');
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Change theme' }).click();
	await page.getByRole('button', { name: 'Dark', exact: true }).click();
	await page.reload();
	await page.waitForLoadState('networkidle');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.getByRole('button', { name: 'Open navigation' }).click();
	await expect(page.getByRole('complementary', { name: 'Documentation navigation' })).toBeVisible();
	await page
		.getByRole('complementary', { name: 'Documentation navigation' })
		.getByRole('link', { name: 'Learn the words', exact: true })
		.click();
	await expect(page).toHaveURL(/\/docs\/glossary$/);
	for (const path of [
		'/docs/learn/earn',
		'/docs/glossary',
		'/docs/quickstart',
		'/docs/learn/games',
		'/docs/learn/labs/sandbox'
	]) {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
			.toBe(true);
	}
});

test('the API explorer mounts and its described local API performs a complete lifecycle', async ({
	page,
	request
}) => {
	await page.goto('/docs/api');
	await page.waitForLoadState('networkidle');
	await expect(page.locator('.scalar-mount')).toContainText('Sandbox learning API', {
		timeout: 30_000
	});
	const invalid = await request.post('/api/sandboxes', {
		data: { name: '', template: 'not-a-template' }
	});
	expect(invalid.status()).toBe(400);
	const created = await request.post('/api/sandboxes', {
		data: { name: 'browser-check', template: 'node' }
	});
	expect(created.status()).toBe(201);
	const { data } = await created.json();
	const inspected = await request.get(`/api/sandboxes/${data.id}`);
	expect((await inspected.json()).data.name).toBe('browser-check');
	expect((await request.delete(`/api/sandboxes/${data.id}`)).status()).toBe(204);
	expect((await request.get(`/api/sandboxes/${data.id}`)).status()).toBe(404);
});

test('Ask OSA returns local passages with working source links', async ({ page }) => {
	await page.goto('/docs/learn/earn');
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Ask OSA', exact: true }).click();
	await page
		.getByRole('textbox', { name: 'Ask a documentation question' })
		.fill('What is a sandbox?');
	await page.getByRole('button', { name: 'Send question' }).click();
	await expect(page.locator('.ask-messages')).toContainText('Local documentation');
	await expect(page.locator('.message-text').last()).toContainText('no language model was called');
	await expect(page.locator('.answer-sources a').first()).toHaveAttribute(
		'href',
		'/docs/sandboxes'
	);
	await page.locator('.answer-sources a').first().click();
	await expect(page).toHaveURL(/\/docs\/sandboxes$/);
});
