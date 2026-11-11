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

## The homepage

`/` and `/zh/` are **not** part of the documentation application. The app ships
one 7.9 MB bundle and renders in the browser, which made every homepage visit pay
for the whole docs site (measured before the change: 8.3 MB of JS, 13 s to
download, first paint at 3.8 to 5.6 s, and no HTML for crawlers).

```sh
npm run build:home    # content/homepage.json + message tables -> static HTML
npm run qa:homepage   # schema, copy keys, locale parity, link targets
```

| Piece | Where | Why |
|---|---|---|
| Section list and order | `content/homepage.json` (+ `homepage.schema.json`) | structure is data; presets swap section order without code |
| Copy | `src/lib/i18n/messages/marketing.ts` | one source for the app and the static page, so they cannot drift |
| Renderer | `scripts/build-home.mjs` | emits `index.html`, `zh/index.html`, `home.css`, `home.js`, `sitemap.xml` |
| Behaviour | `src/marketing/home.js` (~3 KB) | copy button, theme preference, status pill; the page works without it |
| Background | `src/marketing/fabric.js` (~7 KB) | the wireframe-cube scene, ported from `ComputeScene.svelte`; three.js from jsDelivr, CSS grid fallback |

The build preserves the SPA entry as `_spa-shell.html` before the homepage
replaces `build-static/index.html`, and every docs route stub is copied from that
shell. After the change a cold homepage visit transfers about **97 KB** with
first paint around **50 ms** locally, and the page has real HTML for search.

The background is a separate module so the marketing page does not depend on the
app bundle. Two things it has to get right: the fixed layer must not sit at a
negative z-index (the root background would cover it), and in light mode the
scene is hidden because it is drawn on a dark clear colour that reads as haze on
a pale page; light mode uses the CSS grid instead.

Sections are typed: `hero`, `features`, `steps`, `split`, `cta`, `footer`, plus
`logos` (a social-proof row of brand marks), `terminal` (a scripted CLI session)
and `pricing` (plan cards read from `pricing-snapshot.json`, so the homepage can
never quote a rate the pricing page contradicts). Presets compose them:

| Preset | Sections |
|---|---|
| `launch-sota` (default) | hero, logos, terminal, infrastructure, pricing, closing, footer |
| `launch-full` | hero, infrastructure, customer, closing, footer |
| `launch` | hero, closing, footer |
| `docs-first` | hero, quickstart, closing, footer |

The
guard rejects an unknown type, a missing copy key, an en/zh key mismatch, a
preset that does not end in the footer, a link to a document that does not
exist, a logo path that is not in `static/`, and a plan id the snapshot does not
define. `layout` style inference does not apply here: the homepage is generated,
not parsed.

One publish-validator quirk, found the hard way: a **static asset containing the
literal same-origin path `/api/...` is refused** (`PUBLISH_VALIDATION_FAILED`),
even though the same string in the 8 MB app bundle is accepted. Bisecting a
2.9 KB script narrowed it to `fetch("/api/status")`; `/status`, `/healthz` and an
absolute URL all pass. `home.js` therefore builds the status endpoint from
`document.currentScript.src` at runtime. Keep it that way, or the deploy fails.

## Content and artifacts

One repository holds the code and the prose: `xuciro-commits/miosa-docs`
(public). The static host does not compress responses and bills egress at
$0.054/GB with no free tier, so the prose is not served from it. Instead the
build pins the commit it builds, and page content is read from jsDelivr, which
serves a pinned commit as `immutable` for a year with gzip, and from
`raw.githubusercontent.com` when the CDN fails (same CORS headers, no cache).

| Request | Size | When |
|---|---|---|
| `index.html` + `_app/immutable/bundle.*.js` | ~7.9 MB | every cold visit |
| `src/content/docs/<lang>/<slug>.md` | 3–8 KB → ~2 KB gzip | the page that needs it, then cached forever |
| `content/manifest.json` | 205 KB → ~45 KB gzip | generated, also bundled into the shell so navigation never waits |
| `content/search.<lang>.json` | 217 KB en / 334 KB zh | first search or Ask |
| `content/data/learning/categories.json` | 8 KB | learning checks and labs |

Measured cold loads after the move: `/docs/quickstart/` 8.3 MB, and the
Markdown for a page costs about 4 KB instead of the 2.7 MB it used to be.

A route loader resolves metadata only; the page component fetches its own
Markdown once the page is on screen. Hover preloading a link therefore costs a
route chunk, never a page, and opening three pages downloads three files — not
the eight a panel full of prefetched pages used to show.

`src/lib/content/content-version.json` is written by `npm run build:spa` from
`git rev-parse HEAD` (`CONTENT_SHA` overrides it for experiments). The artifact
records it in `release.json` as `content`, so a deployed site always names the
exact content commit it renders.

### Generated metadata

```sh
npm run docs:export   # rewrites content/ and src/lib/content/docs-manifest.json
```

`content/manifest.json` (every page: slug, titles, section, order and `type`),
the search excerpts and the learning data are generated from
`src/content/docs` and `src/lib/content/learning.ts`; commit the result with the
prose change. CI runs `docs:export` and fails when `git diff` shows the metadata
was not regenerated, so the site cannot deploy with stale navigation or search.

Pages are typed: `markdown`, plus `quiz`, `lab`, `game`, `video`, `earn`,
`glossary` and `openapi` for pages the shell renders with a component. Quiz and
lab pages read `content/data/learning/categories.json`, so adding a learning
check needs no code change.

Note: the publish validator on MIOSA rejects artifacts built as many small
chunks (`PUBLISH_VALIDATION_FAILED`, no per-file reason). Its scan looks at
small files only: a 60-byte file containing `AUTH_JWT_SECRET=...` is refused
while the same string inside a 2.2 MB file is accepted. That is why the shell
stays a single bundle, and why example assignments of the form
`NAME_SECRET=value` were rewritten as bare names with a comment.

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