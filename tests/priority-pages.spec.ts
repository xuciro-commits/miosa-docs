import { test, expect } from '@playwright/test';
import reference from '../docs/reference/style-contract.json' with { type: 'json' };

async function ready(page: import('@playwright/test').Page, path: string) {
	await page.goto(path);
	await page.waitForLoadState('networkidle');
}
async function entered(page: import('@playwright/test').Page) {
	await page.addInitScript(() => localStorage.setItem('miosa:docs-entered', '1'));
	await ready(page, '/docs');
}

test('first visit traps focus, pauses the sky, skips, remembers and replays the entrance', async ({
	page
}) => {
	await ready(page, '/docs');
	const intro = page.getByRole('dialog', { name: 'Build on MIOSA' });
	await expect(intro).toBeVisible();
	await page.getByRole('button', { name: 'Pause sky' }).click();
	await expect(page.getByRole('button', { name: 'Resume sky' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	for (let i = 0; i < 9; i++) {
		await page.keyboard.press('Tab');
		expect(await intro.evaluate((el) => el.contains(document.activeElement))).toBe(true);
	}
	await page.keyboard.press('Escape');
	await expect(intro).not.toBeVisible();
	await expect(page.locator('#docs-landing-title')).toBeFocused();
	await page.reload();
	await page.waitForLoadState('networkidle');
	await expect(intro).not.toBeVisible();
	await page.getByRole('button', { name: 'Replay intro' }).click();
	await expect(intro).toBeVisible();
	await page.getByRole('button', { name: 'Enter documentation' }).click();
	await page.keyboard.press('Escape');
	await expect(intro).not.toBeVisible();
});

test('forced entrance and reduced motion complete without a flight delay', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addInitScript(() => localStorage.setItem('miosa:docs-entered', '1'));
	await ready(page, '/docs?entrance=1');
	await expect(page.getByRole('dialog', { name: 'Build on MIOSA' })).toBeVisible();
	await page.getByRole('button', { name: 'Enter documentation' }).click();
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(page).toHaveURL(/\/docs$/);
});

test('installation modes, keyboard tabs and denied clipboard have usable states', async ({
	page
}) => {
	await page.addInitScript(() =>
		Object.defineProperty(navigator.clipboard, 'writeText', {
			value: () => Promise.reject(new DOMException('Denied', 'NotAllowedError'))
		})
	);
	await entered(page);
	await page.getByRole('tab', { name: 'SDK', exact: true }).click();
	await page.getByRole('tab', { name: 'TypeScript', exact: true }).press('ArrowRight');
	await expect(page.getByRole('tabpanel', { name: 'SDK Python installation' })).toContainText(
		'pip install miosa'
	);
	await page.getByRole('button', { name: 'Copy install command' }).click();
	await expect(page.getByRole('status')).toContainText('Clipboard unavailable');
	await page.getByRole('tab', { name: 'CLI', exact: true }).click();
	await page.getByRole('tab', { name: 'Script', exact: true }).click();
	await expect(page.getByRole('tabpanel')).toContainText('https://miosa.ai/install.sh');
});

test('card deck supports arrows, wraparound and swiping without accidental navigation', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await entered(page);
	const card = page.locator('.deck-front');
	await card.focus();
	await card.press('End');
	await expect(page.getByRole('button', { name: 'Show card 7: LEARN' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await card.press('ArrowRight');
	await expect(page.getByRole('button', { name: 'Show card 1: BUILD' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	const box = (await card.boundingBox())!;
	await page.mouse.move(box.x + 180, box.y + 100);
	await page.mouse.down();
	await page.mouse.move(box.x + 70, box.y + 100, { steps: 8 });
	await page.mouse.up();
	await expect(page).toHaveURL(/\/docs$/);
	await expect(page.getByRole('button', { name: 'Show card 2: SDKs' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
});

test('product field supports selection, toss, zap and an actual local guide', async ({ page }) => {
	await entered(page);
	const product = page.locator('[data-product="5"]');
	await product.scrollIntoViewIfNeeded();
	const box = (await product.boundingBox())!;
	await page.mouse.move(box.x + 25, box.y + 25);
	await page.mouse.down();
	await page.mouse.move(box.x + 80, box.y + 55, { steps: 8 });
	await page.mouse.up();
	await expect(page).toHaveURL(/\/docs$/);
	await expect(page.locator('#product-heading')).toContainText('Lovable');
	await page.getByRole('button', { name: 'Zap a random logo' }).click();
	await expect(page.locator('.product-showcase .sr-only')).toContainText('Activate again');
	const guide = page.locator('.product-description a');
	const href = await guide.getAttribute('href');
	await guide.click();
	await expect(page).toHaveURL(new RegExp(href! + '$'));
	await expect(page.locator('#article-body')).toContainText('Run, observe, and publish');
});

test('pricing follows the captured result, minimums, saturation, capacity and product branches', async ({
	page
}) => {
	await ready(page, '/pricing');
	await expect(page.locator('.calculated-total b')).toHaveText('$45.39');
	await page.getByLabel('Sessions / month', { exact: true }).focus();
	await page.keyboard.press('Home');
	await expect(page.locator('.calculated-total b')).toHaveText('$20.00');
	await page.keyboard.press('End');
	await expect(page.locator('.calculated-total b')).toHaveText('$3,313.45');
	await expect(page.locator('.calculated-total')).toContainText('50 machines × 730 h');
	await page
		.getByRole('radiogroup', { name: 'Resources per machine' })
		.getByRole('radio')
		.last()
		.click();
	await expect(page.locator('.capacity-note')).toBeVisible();
	await expect(page.locator('.hourly-results')).toContainText('Not listed');
	await page
		.getByRole('radiogroup', { name: 'Product', exact: true })
		.getByRole('radio', { name: 'Apps', exact: true })
		.click();
	await expect(page.getByRole('radiogroup', { name: 'Compare', exact: true })).not.toBeVisible();
	const high = await page.locator('.calculated-total b').innerText();
	await page
		.getByRole('radiogroup', { name: 'CPU busy' })
		.getByRole('radio', { name: '10%', exact: true })
		.click();
	expect(await page.locator('.calculated-total b').innerText()).not.toBe(high);
	await expect(page.locator('.price-comparison')).not.toContainText('NaN');
});

test('budget mode, keyboard choices, full rankings, sources and independent FAQs work', async ({
	page
}) => {
	await ready(page, '/pricing');
	await page
		.getByRole('radiogroup', { name: 'Compare', exact: true })
		.getByRole('radio', { name: 'Workloads for a budget' })
		.click();
	await expect(page.getByLabel('Budget / month')).toBeVisible();
	const before = await page.locator('.calculated-total b').innerText();
	await page.getByLabel('Budget / month').focus();
	await page.keyboard.press('End');
	expect(await page.locator('.calculated-total b').innerText()).not.toBe(before);
	await page
		.getByRole('radiogroup', { name: 'Workload', exact: true })
		.getByRole('radio', { name: 'Always-on agents' })
		.click();
	await expect(page.locator('.calculated-total')).toContainText('always-on agents');
	await page.getByRole('button', { name: /Show all/ }).click();
	expect(await page.locator('.monthly-results>li').count()).toBeGreaterThan(10);
	await page.locator('.comparison-method summary').click();
	await expect(page.locator('.comparison-method a').first()).toBeVisible();
	const faq = page.locator('.faq-list details');
	await faq.nth(1).locator('summary').click();
	await expect(faq.nth(0)).toHaveAttribute('open', '');
	await expect(faq.nth(1)).toHaveAttribute('open', '');
});

test('search fails once, retries explicitly and clears a query before closing', async ({
	page
}) => {
	let calls = 0;
	await page.route('**/docs-search.json', (route) => {
		calls++;
		return route.fulfill({ status: 503, body: 'Unavailable' });
	});
	await ready(page, '/docs/quickstart');
	await page.keyboard.press('Meta+k');
	await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
	await page.waitForTimeout(450);
	expect(calls).toBe(1);
	await page.unroute('**/docs-search.json');
	await page.getByRole('button', { name: 'Try again' }).click();
	const query = page.getByRole('textbox', { name: 'Search documentation' });
	await query.fill('snapshots');
	await expect(page.locator('.search-result').first()).toContainText('Snapshots');
	await page.keyboard.press('Escape');
	await expect(query).toHaveValue('');
	await expect(query).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('marketing status retry and official plan links preserve their intent', async ({ page }) => {
	await page.route('**/api/status', (route) => route.abort());
	await ready(page, '/');
	await expect(page.getByRole('button', { name: 'Status unavailable · retry' })).toBeVisible();
	await page.unroute('**/api/status');
	await page.getByRole('button', { name: 'Status unavailable · retry' }).click();
	await expect(page.getByRole('button', { name: 'Local preview operational' })).toBeVisible();
	await ready(page, '/pricing');
	await expect(page.locator('.plan-button').nth(0)).toHaveAttribute(
		'href',
		'https://miosa.ai/register'
	);
	await expect(page.locator('.plan-button').nth(1)).toHaveAttribute(
		'href',
		'https://miosa.ai/register?plan=developer'
	);
});

test('priority pages remain usable on mobile and after a dark-theme revisit', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.setViewportSize({ width: 390, height: 844 });
	await page.addInitScript(() => {
		localStorage.setItem('miosa:docs-entered', '1');
		localStorage.setItem('miosa-theme', 'dark');
	});
	for (const path of ['/', '/docs', '/pricing']) {
		await ready(page, path);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			path
		).toBe(true);
		await expect(page.locator('h1').first()).toBeVisible();
		if (path === '/docs')
			await expect(page.locator('#docs-landing-title')).toHaveCSS('font-size', '41.6px');
		await page.screenshot({
			path: `test-results/mobile-${path === '/' ? 'home' : path.slice(1)}.png`,
			fullPage: true
		});
	}
	await page.locator('.plan-table').scrollIntoViewIfNeeded();
	await expect(page.locator('.plan-table')).toBeVisible();
	expect(errors).toEqual([]);
});

test('key typography, surfaces, shadows and scrollbar modes equal captured CSS', async ({
	page
}) => {
	await page.addInitScript(() => localStorage.setItem('miosa:docs-entered', '1'));
	for (const target of reference) {
		await ready(page, target.path);
		for (const [source, local] of target.pairs) {
			const expected = (target.reference as Record<string, Record<string, string>>)[source];
			if (!expected) continue;
			const fields =
				source.includes('h1') || source.includes('landing-title')
					? ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'color']
					: source.includes('fabric')
						? ['backgroundColor', 'backgroundImage', 'opacity']
						: source.includes('sidebar') || source.includes('tabs') || source.includes('scroll')
							? ['scrollbarWidth', 'scrollbarColor']
							: ['fontFamily', 'backgroundColor', 'borderRadius', 'boxShadow'];
			const actual = await page
				.locator(local)
				.first()
				.evaluate(
					(el, fields) =>
						Object.fromEntries(
							fields.map((key) => [
								key,
								(getComputedStyle(el) as unknown as Record<string, string>)[key]
							])
						),
					fields
				);
			for (const key of fields)
				expect(actual[key], `${target.path} ${local} ${key}`).toBe(expected[key]);
		}
	}
	await ready(page, '/docs');
	await page.evaluate(() => {
		document.documentElement.dataset.theme = 'dark';
	});
	await expect(page.locator('#docs-landing-title')).toHaveCSS('color', 'rgb(250, 250, 250)');
	await expect(page.locator('.reading-stage')).toHaveCSS('background-color', 'rgb(17, 17, 19)');
	await expect(page.locator('.fact-card h3').first()).toHaveCSS('color', 'rgb(34, 16, 10)');
	await expect(page.locator('.sidebar-nav')).toHaveCSS(
		'scrollbar-color',
		'rgb(38, 38, 42) rgba(0, 0, 0, 0)'
	);
});

test('reduced-motion product field is static and opens the first selected guide directly', async ({
	page,
	request
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await entered(page);
	await expect(page.getByRole('button', { name: 'Zap a random logo' })).not.toBeVisible();
	await page.locator('[data-product="5"]').click();
	await expect(page).toHaveURL(/\/docs\/build\/lovable$/);
	const markdown = await request.get('/docs/build/lovable.md');
	expect(await markdown.text()).toContain('Run, observe, and publish');
});
