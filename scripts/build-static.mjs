import { execFileSync } from 'node:child_process';
import { rmSync, readFileSync, writeFileSync } from 'node:fs';

rmSync('build-static', { recursive: true, force: true });
execFileSync(
	process.execPath,
	['node_modules/vite/bin/vite.js', 'build', '--config', 'vite.static.config.ts'],
	{
		stdio: 'inherit',
		env: { ...process.env, STATIC_BUILD: '1' }
	}
);
const entries = JSON.parse(readFileSync('build-static/docs-search.json', 'utf8'));
writeFileSync(
	'build-static/llms.txt',
	`# MIOSA documentation reconstruction\n\n${entries.map((entry) => `- [${entry.title}](/docs/${entry.slug || 'index'}.md): ${entry.description}`).join('\n')}\n`
);
writeFileSync(
	'build-static/llms-full.txt',
	entries
		.map((entry) => readFileSync(`build-static/docs/${entry.slug || 'index'}.md`, 'utf8'))
		.join('\n\n---\n\n')
);

const commit =
	process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
writeFileSync(
	'build-static/release.json',
	JSON.stringify({ commit, builtAt: new Date().toISOString() })
);
