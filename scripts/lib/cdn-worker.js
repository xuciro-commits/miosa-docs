// Generated with the hashes of this build's small, public static assets.
const assets = __CDN_ASSETS__;
const host = self.location.hostname.match(/^([a-z0-9-]+)\.(norsky\.cn|msru\.cn)$/);
const cdn = host ? `https://${host[1]}.cdn.${host[2]}:14444` : null;
let retryAfter = 0;

self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
	const request = event.request;
	const url = new URL(request.url);
	const hash = assets[url.pathname];
	if (!cdn || Date.now() < retryAfter || request.method !== 'GET' || url.origin !== self.location.origin ||
		!hash || request.headers.has('authorization') || request.headers.has('range')) return;

	const cachedUrl = new URL(url.pathname + url.search, cdn);
	cachedUrl.searchParams.set('__cdn_v', hash);
	const candidate = fetch(cachedUrl, { mode: 'cors', credentials: 'omit' })
		.then(async (response) => {
			if (!response.ok) return null;
			const body = await response.arrayBuffer();
			const digest = await crypto.subtle.digest('SHA-256', body);
			const actual = Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, '0')).join('');
			// A deployment may change while an unversioned asset is cached. Never
			// substitute bytes from another build for the page's expected asset.
			if (actual !== hash) return null;
			const headers = new Headers(response.headers);
			headers.delete('content-encoding');
			headers.delete('content-length');
			return new Response(body, { status: 200, headers });
		}, () => { retryAfter = Date.now() + 60_000; return null; })
		.catch(() => null);

	// Allow a slow miss to populate the CDN while the page falls back to origin.
	event.waitUntil(candidate.then(() => {}));
	event.respondWith((async () => {
		let timer;
		const timeout = new Promise((resolve) => { timer = setTimeout(() => {
			retryAfter = Date.now() + 60_000;
			resolve(null);
		}, 1200); });
		const response = await Promise.race([candidate, timeout]);
		clearTimeout(timer);
		return response || fetch(request);
	})());
});
