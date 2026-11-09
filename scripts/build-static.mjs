import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const out = join(root, 'build-static');
const port = 3210;
const base = `http://127.0.0.1:${port}`;

function run(command, args, env = {}) {
	execFileSync(command, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
}

async function waitFor(url) {
	for (let i = 0; i < 80; i += 1) {
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
	const body = await response.text();
	const target = join(root, file);
	mkdirSync(join(target, '..'), { recursive: true });
	writeFileSync(target, body);
}

function walk(dir, result = []) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		const stat = statSync(path);
		if (stat.isDirectory()) walk(path, result);
		else if (name === 'index.html') result.push(path);
	}
	return result;
}

rmSync(out, { recursive: true, force: true });
run(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--config', 'vite.static.config.ts'], { STATIC_BUILD: '1' });
run(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build'], { NODE_ENV: 'production' });

const server = spawn(process.execPath, ['build'], {
	cwd: root,
	env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
	stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

try {
	await waitFor(`${base}/api/status`);
	await save('/docs-search.json', 'build-static/docs-search.json');
	await save('/openapi.json', 'build-static/openapi.json');
	await save('/api/status', 'build-static/api/status');

	const pages = walk(join(out, 'docs'));
	for (const file of pages) {
		const route = relative(join(out, 'docs'), file).replace(/\/index\.html$|^index\.html$/, '');
		const url = route ? `/docs/${route}.md` : '/docs/index.md';
		try {
			await save(url, `build-static/docs/${route ? `${route}.md` : 'index.md'}`);
		} catch (error) {
			if (!String(error?.message).includes('404')) throw error;
		}
	}
	console.log(`Static site ready: ${out} (${pages.length} docs pages)`);
} finally {
	server.kill('SIGTERM');
}
