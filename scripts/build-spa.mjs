import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const out = join(root, 'build-static');
const port = 3211;
const base = `http://127.0.0.1:${port}`;

function run(command, args) {
	execFileSync(command, args, { cwd: root, stdio: 'inherit', env: { ...process.env } });
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
	await save('/docs-search.json', 'build-static/docs-search.json');
	await save('/openapi.json', 'build-static/openapi.json');
	await save('/api/status', 'build-static/api/status');
	console.log(`SPA site ready: ${out}`);
} finally {
	server.kill('SIGTERM');
}
