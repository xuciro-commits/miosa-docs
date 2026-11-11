import version from '#lib/content/content-version.json';

/**
 * Content lives in this repository, published to jsDelivr pinned at the commit
 * being built. A pinned commit is immutable for a year and gzip encoded there,
 * which the static host does not do. Mirrors in order: CDN at the pinned
 * commit, raw GitHub at the pinned commit, then both at the branch (so a local
 * build before the commit lands still works).
 */
const { repo, sha, branch = 'main' } = version;
const mirrors = [
	`https://cdn.jsdelivr.net/gh/${repo}@${sha}/`,
	`https://raw.githubusercontent.com/${repo}/${sha}/`,
	`https://cdn.jsdelivr.net/gh/${repo}@${branch}/`,
	`https://raw.githubusercontent.com/${repo}/${branch}/`
];

export const contentVersion = version;

export async function fetchContent(
	path: string,
	fetcher: typeof fetch = fetch
): Promise<string | undefined> {
	for (const base of mirrors) {
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
