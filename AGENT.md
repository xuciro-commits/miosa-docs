# AGENT.md — how changes reach production

This repository publishes the MIOSA documentation site to
<https://docs.norsky.cn>. Everything below is the operating contract for
agents and humans working in it.

## Two lanes

| Lane | Trigger | Duration | What runs |
|---|---|---|---|
| **Fast lane** (`CI`) | any push to `main`, any PR | ~2 min | content check → build → route check → upload → HTTP acceptance → promote → production HTTP check |
| **Release lane** (`Release`) | push a `v*` tag | ~4 min | fast lane plus Chromium acceptance on the local build, on the preview, on production, screenshots, GitHub Release |

A tag is a statement: "this exact commit is verified in a real browser and
frozen as a release". A plain push only promises: "the artifact serves the
right routes and the right commit".

### Why the split

Chromium acceptance is the only check that can fail for reasons outside this repository (edge routing, cache, platform drift). Measured on 2026-11-10 (UTC): the pipeline itself takes about 100 s in `qa` plus about 15 s of deploy setup. The variable part is MIOSA: the artifact seal measured 33-36 s in one window and 328-335 s in another, and promote measured 10-15 s against 306 s in the same slow window. Budget 2.5-3 min normally, and expect up to 10 min when the platform is congested. It is required before a
release, but it must not block a one-page documentation edit. Both lanes run
the deterministic checks, so a broken page never reaches production.

## The four checks

| Script | Runs | Cost | Catches |
|---|---|---|---|
| `scripts/content-qa.mjs` | commit hook, fast lane, release lane | < 1 s | frontmatter gaps, slug/path drift, a page present in one language only, heading/fence/table drift between `en` and `zh`, translation placeholders, unbalanced fences, glued fences, committed secrets, oversized files; warns on English prose left in Chinese pages, machine-translated product names, duplicated table values |
| `scripts/route-qa.mjs` | fast lane, release lane | ~1 s | manifest vs disk, missing route stubs in `build-static`, assets referenced by pages, internal `/docs/...` links that resolve to nothing |
| `scripts/verify-http.mjs` | fast lane, release lane, nightly | ~3 s | routes not returning 200, HTML that does not reference the bundle, missing brand/font/docs assets, `release.json` commit mismatch, non-relative OpenAPI server |
| `scripts/verify-deployment.mjs` | release lane, nightly | ~10 s + browser install | hydration errors, rendered headings, code blocks, search dialog, Ask OSA local mode, Markdown endpoints |

`npm run check` (svelte-check) belongs to the fast lane and runs only when
TypeScript or Svelte sources changed.

## Local gates

```sh
npm run hooks:install   # git config core.hooksPath .githooks
```

- `.githooks/pre-commit` → `content-qa --staged`, under a second, only staged
  documentation files.
- `.githooks/pre-push` → `svelte-check` when `src/**/*.ts|svelte` changed, then
  the full content check.

Nothing else belongs in a hook: builds, browsers, network calls and deploys all
stay in CI.

## Build artifacts

`npm run build:spa` runs `scripts/export-docs.mjs` first, then the Vite build.
Egress is billed at $0.054/GB with no free tier and the host does not compress,
so the artifact is laid out to keep cold loads small:

| Artifact | Size | When a browser downloads it |
|---|---|---|
| `index.html` + `_app/immutable/bundle.*.js` | ~7.9 MB | every cold visit |
| `docs-content/<lang>.json` | 2.7 MB | first documentation page, that language only, cached afterwards |

Chinese content is rendered on demand: an English reader never downloads
`docs-content/zh.json`. Search builds its index from the content that is already
loaded instead of shipping a separate index file.

A fully code-split build (entry ~0.56 MB, chunks on demand) was tried and is
measurably smaller, but the publish validator rejects it with
`PUBLISH_VALIDATION_FAILED` and no per-file reason. What we established while
bisecting:

- file count is not the limit: an 836-file artifact passes;
- the validator scans *small* files for secret-looking text. A 60-byte chunk
  containing `AUTH_JWT_SECRET=...` is rejected, while the same string inside a
  2.2 MB or 3 MB file is accepted;
- example assignments of the form `NAME_SECRET=value` in the docs were the
  first trigger found, so `src/content/docs` keeps such examples as bare names
  with a comment instead;
- the remaining cause for the split build is still unknown, which is why the
  shipped artifact is a single bundle with the content served as an asset.

To go further, move `mermaid`, `shiki` and `three` into separately built
`static/runtime/*.js` files and import them by URL: that keeps Vite's inlining
out of the entry bundle without adding many small chunks.

## Adding a page

1. Write `src/content/docs/en/<slug>.md` **and** `src/content/docs/zh/<slug>.md`.
   The slug must equal the path inside the language folder. Keep frontmatter
   `slug`, `title`, `description`, `section`, `order`.
2. Keep both languages structurally identical: same heading levels in the same
   order, same number of code fences, same table shape. Counts are compared,
   not wording.
3. `git commit` runs the guard. `git push` publishes in about two minutes.
4. Tag only when the change is worth a release note.

Regenerate the manifest and navigation after adding pages:

```sh
npm run build:spa        # rebuilds the manifest-driven routes
```

The manifest (`src/lib/content/docs-manifest.json`) is generated when the site
content is refreshed; `route-qa` fails if a page exists on disk but not in the
manifest, so a forgotten step is caught before deploy.

## Allowed exceptions

`.content-qa-allow.json` lists table rows whose numbers differ between English
and Chinese for a legitimate reason (an ISO date written as `2026 年 10 月 11 日`,
for example). Every entry needs a reason. Do not add entries to silence a real
defect: fix the page instead.

Table rows that keep provider names, versions, HTTP status codes and benchmark
numbers in English are correct as they are. Code fences, inline code, URLs, API
paths and product names are never translated.

## Deploy identity

- MIOSA deployment: `c2325fd0-7617-485a-98e0-817374e9b131` (`msru` / `default`)
- Public URL: <https://docs.norsky.cn> (custom domain) and
  `https://miosa-docs.msru.miosa.app` (platform subdomain)
- Upload uses the `MIOSA_API_KEY` repository secret; the key never enters the
  artifact.
- `release.json` in the artifact records the commit; both HTTP checks compare it
  with `GITHUB_SHA`, so a stale cache cannot pass.

## Rollback

```sh
miosa deploy versions c2325fd0-7617-485a-98e0-817374e9b131 --json
miosa deploy promote <previous-version-id> --deployment c2325fd0-7617-485a-98e0-817374e9b131 --json
```

Promotion never rebuilds; versions are immutable, so a rollback is a pointer
change and takes seconds. Preview versions from failed runs stay available at
`https://v-<version-id>--miosa-docs--msru.miosa.app`.

## When a check fails

| Failure | Meaning | Action |
|---|---|---|
| `content-qa` structural drift | the two languages diverged | fix the Chinese page; never delete the structure to make it pass |
| `content-qa` placeholder | a translation placeholder survived | restore the original code or link |
| `route-qa` missing stub | a page is in the manifest but the build skipped it | rebuild; check the manifest |
| `verify-http` non-200 on the preview | the platform has not routed the version yet | it retries 5 times; if it still fails, inspect the deployment |
| `verify-http` commit mismatch | edge cache served an older artifact | re-run; do not promote by hand without the commit match |
| `verify-deployment` (release only) | hydration or interaction broke | fix and tag again; production keeps the previous version |

## Nightly

`Nightly production check` runs the HTTP and browser checks against production
every day at 11:00 UTC. It does not deploy; it reports drift such as certificate
or routing problems that appear without a code change.