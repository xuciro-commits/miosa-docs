import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const content = 'this build';
const hash = createHash('sha256').update(content).digest('hex');
const source = readFileSync(new URL('./lib/cdn-worker.js', import.meta.url), 'utf8')
	.replace('__CDN_ASSETS__', JSON.stringify({ '/home.css': hash }));

async function request({ body = content, status = 200, reject = false, slow = false, url = '/home.css', headers = {} } = {}) {
	const listeners = {};
	const calls = [];
	const context = vm.createContext({
		URL, Request, Response, Headers, crypto: webcrypto, setTimeout, clearTimeout,
		self: { location: new URL('https://docs.norsky.cn'), addEventListener: (name, listener) => { listeners[name] = listener; } },
		fetch: async (input) => {
			const address = input instanceof Request ? input.url : String(input);
			calls.push(address);
			if (address.startsWith('https://docs.norsky.cn/')) return new Response('origin');
			if (reject) throw new Error('CDN unreachable');
			if (slow) await new Promise((resolve) => setTimeout(resolve, 1400));
			return new Response(body, { status });
		}
	});
	vm.runInContext(source, context);
	let response;
	let pending;
	listeners.fetch({
		request: new Request(new URL(url, 'https://docs.norsky.cn'), { headers }),
		respondWith: (value) => { response = value; },
		waitUntil: (value) => { pending = value; }
	});
	const result = response ? await (await response).text() : null;
	await pending;
	return { result, calls };
}

const hit = await request();
assert.equal(hit.result, content);
assert.equal(hit.calls.length, 1);
assert.match(hit.calls[0], /^https:\/\/docs\.cdn\.norsky\.cn:14444\/home\.css\?__cdn_v=/);
for (const options of [{ body: 'older deployment' }, { status: 404 }, { reject: true }, { slow: true }]) {
	const fallback = await request(options);
	assert.equal(fallback.result, 'origin');
	assert.equal(fallback.calls.length, 2);
}
for (const options of [{ url: '/api/status' }, { url: '/large-bundle.js' }, { headers: { authorization: 'Bearer example' } }, { headers: { range: 'bytes=0-9' } }]) {
	assert.deepEqual(await request(options), { result: null, calls: [] });
}
console.log('CDN verification passed: routing, content hash, failure/timeout fallback, API/large file/auth/range bypass');
