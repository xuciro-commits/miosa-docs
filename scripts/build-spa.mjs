import { spawn, execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const out = join(root, 'build-static');
const port = 3211;
const base = `http://127.0.0.1:${port}`;

function run(command, args) {
	execFileSync(command, args, { cwd: root, stdio: 'inherit', env: { ...process.env } });
}

async function waitFor(url) {
	for (let i = 0; i < 100; i += 1) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(`server did not answer at ${url}`);
}

async function save(url, file) {
	const response = await fetch(`${base}${url}`);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	const target = join(root, file);
	mkdirSync(join(target, '..'), { recursive: true });
	writeFileSync(target, await response.text());
}

rmSync(out, { recursive: true, force: true });
run(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--config', 'vite.spa.config.ts']);
run(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build']);

const server = spawn(process.execPath, ['build'], {
	cwd: root,
	env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
	stdio: ['ignore', 'pipe', 'pipe']
});
try {
	await waitFor(`${base}/api/status`);
	await save('/openapi.json', 'build-static/openapi.json');
	await save('/api/status', 'build-static/api/status');
	rmSync('build-static/llms-full.txt', { force: true });
	copyFileSync('build-static/index.html', 'build-static/404.html');
	rmSync('build-static/robots.txt', { force: true });
	rmSync('build-static/docs-search.json', { force: true });


	// Give every published docs route a small static HTML entry so a static host
	// returns 200 without duplicating the rendered article body. The SPA reads
	// the route from the URL and renders the canonical Markdown from its bundle.
	const generated = JSON.parse(readFileSync('src/lib/content/generated-docs.json', 'utf8'));
	const routeEntries = [
		'docs',
		...generated.pages.map((page) => `docs/${page.slug}`),
		...['words', 'model', 'sandbox', 'shipping', 'fleet', 'connections', 'product'].map(
			(unit) => `docs/learn/labs/${unit}`
		),
		'pricing',
		'status'
	];
	for (const route of routeEntries) {
		const dir = join(root, 'build-static', route);
		mkdirSync(dir, { recursive: true });
		copyFileSync(join(root, 'build-static', 'index.html'), join(dir, 'index.html'));
	}

	rmSync('build-static/llms.txt', { force: true });
	const commit = process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
	writeFileSync('build-static/release.json', JSON.stringify({ commit, spa: true, builtAt: new Date().toISOString() }));
	console.log(`SPA site ready: ${out}`);
} finally {
	server.kill('SIGTERM');
}
