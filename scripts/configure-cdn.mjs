#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Reusable post-build step: node scripts/configure-cdn.mjs <output-directory>.
// It derives x.cdn.<zone>:14444 from x.<zone> at runtime; previews stay local.
export function configureCdn(directory) {
	const root = resolve(directory);
	const files = readdirSync(root, { recursive: true }).filter((name) => statSync(join(root, name)).isFile());
	const assets = {};
	for (const name of files) {
		if (name === 'cdn-worker.js' || !/\.(?:css|js|mjs|wasm|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i.test(name)) continue;
		const path = join(root, name);
		// This node has only 3Mbps outbound bandwidth. Large bundles and video
		// stay on the origin rather than making the CDN a transfer bottleneck.
		if (statSync(path).size > 128 * 1024) continue;
		assets['/' + relative(root, path).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(path)).digest('hex');
	}
	const worker = readFileSync(new URL('./lib/cdn-worker.js', import.meta.url), 'utf8')
		.replace('__CDN_ASSETS__', JSON.stringify(assets));
	const version = createHash('sha256').update(worker).digest('hex').slice(0, 16);
	writeFileSync(join(root, 'cdn-worker.js'), worker);
	const registration = `<script data-cdn-register>if('serviceWorker' in navigator&&/^[a-z0-9-]+\\.(norsky\\.cn|msru\\.cn)$/.test(location.hostname)){navigator.serviceWorker.register('/cdn-worker.js?v=${version}',{updateViaCache:'none'}).catch(function(){});}</script>`;
	for (const name of files.filter((name) => name.endsWith('.html'))) {
		const path = join(root, name);
		const html = readFileSync(path, 'utf8').replace(/<script data-cdn-register>[\s\S]*?<\/script>/g, '');
		writeFileSync(path, html.replace('</head>', registration + '</head>'));
	}
	console.log(`CDN: ${Object.keys(assets).length} small assets, version ${version}; origin fallback after 1200ms`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	configureCdn(process.argv[2] || 'build-static');
}
