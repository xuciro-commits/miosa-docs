import version from '#lib/content/content-version.json';

/**
 * Content is served from the public content repository over jsDelivr, pinned to
 * the commit recorded in `content-version.json`. A pinned commit is served as
 * `immutable` for a year and is gzip/brotli encoded there, which the static
 * host does not do. `raw.githubusercontent.com` is the fallback if the CDN
 * fails; it sends the same CORS headers.
 */
const bases = [version.cdn, version.raw];

export const contentVersion = version;

export async function fetchContent(
	path: string,
	fetcher: typeof fetch = fetch
): Promise<string | undefined> {
	for (const base of bases) {
		try {
			const response = await fetcher(base + path);
			if (response.ok) return await response.text();
		} catch {
			// try the next mirror
		}
	}
	return undefined;
}

export async function fetchContentJson<T>(
	path: string,
	fetcher: typeof fetch = fetch
): Promise<T | undefined> {
	const body = await fetchContent(path, fetcher);
	if (!body) return undefined;
	try {
		return JSON.parse(body) as T;
	} catch {
		return undefined;
	}
}

/** Frontmatter is metadata for authors; the shell reads the manifest instead. */
export function stripFrontmatter(source: string) {
	return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}