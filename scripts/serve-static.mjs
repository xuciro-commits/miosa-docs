import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('build-static');
const types = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.md': 'text/markdown',
	'.txt': 'text/plain',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.woff2': 'font/woff2'
};
http
	.createServer(async (req, res) => {
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			res.writeHead(405);
			res.end();
			return;
		}
		const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
		let file = resolve(root, '.' + pathname);
		if (file !== root && !file.startsWith(root + sep)) {
			res.writeHead(403);
			res.end();
			return;
		}
		try {
			if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
			const data = await readFile(file);
			res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
			res.end(req.method === 'HEAD' ? undefined : data);
		} catch {
			// SPA fallback: unknown routes hydrate from the single index bundle.
			try {
				const data = await readFile(resolve(root, 'index.html'));
				res.writeHead(200, { 'content-type': 'text/html' });
				res.end(req.method === 'HEAD' ? undefined : data);
			} catch {
				res.writeHead(404, { 'content-type': 'text/plain' });
				res.end('Not found');
			}
		}
	})
	.listen(Number(process.env.PORT ?? 4173), '127.0.0.1', () =>
		console.log('Static preview: http://127.0.0.1:' + (process.env.PORT ?? 4173))
	);
