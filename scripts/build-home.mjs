#!/usr/bin/env node
/*
 * Build the marketing homepage as a standalone static page.
 *
 * The docs application ships one large bundle and renders in the browser, so
 * every homepage visit paid for the whole docs site (measured: 8.3 MB of JS,
 * first paint at 3.8 to 5.6 s, and no HTML for search engines). The homepage is
 * generated here instead: semantic HTML with inlined critical CSS, one small
 * stylesheet, and a few kilobytes of script for the copy button, the theme
 * preference and the status pill.
 *
 * Copy comes from `src/lib/i18n/messages/marketing.ts`, so the page shows the
 * same words as the app; structure comes from `content/homepage.json`, so the
 * sections and their order are data rather than markup.
 */
import { execFileSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sectionOrder, sectionKeys, validateDefinition } from './lib/homepage-rules.mjs';

const ROOT = process.cwd();
const OUT = join(ROOT, 'build-static');
const SRC = join(ROOT, 'src/content');

// ----------------------------------------------------------------- messages
const messages = JSON.parse(
	execFileSync(
		process.execPath,
		[
			'-e',
			"import('./src/lib/i18n/messages/marketing.ts').then((m) => console.log(JSON.stringify({ en: m.en, zh: m.zh })))"
		],
		{ cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 16 }
	)
);

const definition = JSON.parse(readFileSync(join(ROOT, 'content/homepage.json'), 'utf8'));
const pricing = JSON.parse(readFileSync(join(ROOT, 'src/lib/content/pricing-snapshot.json'), 'utf8'));
const problems = validateDefinition(definition);
if (problems.length) {
	for (const problem of problems) console.error(`homepage: ${problem}`);
	process.exit(1);
}

const esc = (value) =>
	String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function translator(locale) {
	return (key, values) => {
		const template = messages[locale]?.[`marketing.${key}`];
		if (template === undefined) throw new Error(`missing message marketing.${key} for ${locale}`);
		if (!values) return template;
		return template.replace(/\{(\w+)\}/g, (match, name) =>
			values[name] === undefined ? match : String(values[name])
		);
	};
}

// ---------------------------------------------------------------- rendering
const sections = sectionOrder(definition);

function renderLink(locale, link, className) {
	const tr = translator(locale);
	const external = /^https?:/.test(link.href);
	return `<a class="${className}" href="${esc(link.href)}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${esc(tr(link.label))}</a>`;
}

function headingOf(locale, heading, tag = 'h2') {
	const tr = translator(locale);
	const lines = Object.values(heading).map((key) => esc(tr(key)));
	if (lines.length === 2) return `<${tag}>${lines[0]}<br />${lines[1]}</${tag}>`;
	return `<${tag}>${lines.join(' ')}</${tag}>`;
}

function renderSection(locale, section) {
	const tr = translator(locale);
	const eyebrow = section.eyebrow ? `<p class="eyebrow">${esc(tr(section.eyebrow))}</p>` : '';

	if (section.type === 'hero') {
		const title = section.title;
		return `<section class="hero">
	<div class="hero-copy">
		<a class="announcement" href="${esc(section.announcement.href)}"><span><i></i>${esc(tr(section.announcement.label))}</span><b>${esc(tr(section.announcement.text))}</b><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
		${eyebrow}
		<h1>${esc(tr(title.line))}<br /><span>${esc(tr(title.accent))}</span>${esc(tr(title.tail))}</h1>
		<p class="hero-lead">${esc(tr(section.lead))}</p>
		<div class="hero-actions">${renderLink(locale, section.primary, 'button primary')}${renderLink(locale, section.secondary, 'button secondary')}</div>
		<a class="benchmark" href="${esc(section.benchmark.href)}" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg><b>${esc(section.benchmark.value)}</b><span>${esc(tr(section.benchmark.label))}</span></a>
	</div>
</section>`;
	}

	if (section.type === 'features' || section.type === 'steps') {
		const items = section.items
			.map(
				(item, index) => `<a class="card" href="${esc(item.href)}">${section.numbered ? `<small>0${index + 1}</small>` : ''}<h3>${esc(tr(item.title))}</h3><p>${esc(tr(item.text))}</p><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a>`
			)
			.join('');
		return `<section class="section features${section.numbered ? ' numbered' : ''}">
	<div class="section-head"><div>${eyebrow}${headingOf(locale, section.title)}</div><p>${esc(tr(section.lead))}</p></div>
	<div class="cards">${items}</div>
</section>`;
	}

	if (section.type === 'split') {
		return `<section class="section split">
	<div>${eyebrow}${headingOf(locale, section.title)}</div>
	<div><p>${esc(tr(section.lead))}</p>${renderLink(locale, section.cta, 'button primary')}</div>
</section>`;
	}

	if (section.type === 'cta') {
		const labels = section.commandLabels;
		return `<section class="section cta">
	${eyebrow}${headingOf(locale, section.title)}
	<p>${esc(tr(section.lead.line1))}<br />${esc(tr(section.lead.line2))}</p>
	<div class="cta-actions">${renderLink(locale, section.primary, 'button primary')}
		<button class="install" type="button" data-command="${esc(section.command)}" data-idle="${esc(tr(labels.idle))}" data-done="${esc(tr(labels.done))}" data-manual="${esc(tr(labels.manual))}" aria-label="${esc(tr(labels.aria))}"><span>CLI</span><code>${esc(section.command)}</code><b data-label>${esc(tr(labels.idle))}</b></button>
	</div>
	<code class="install-fallback" hidden>${esc(section.command)}</code>
	${renderLink(locale, section.link, 'setup-guide')}
</section>`;
	}

	if (section.type === 'logos') {
		const logos = section.logos
			.map(
				(logo) =>
					`<li><img src="${esc(logo.src)}" alt="${esc(logo.name)}" loading="lazy" width="96" height="26" /></li>`
			)
			.join('');
		return `<section class="section logos">
	${eyebrow}${section.note ? `<p class="logos-note">${esc(tr(section.note))}</p>` : ''}
	<ul class="logo-row">${logos}</ul>
</section>`;
	}

	if (section.type === 'terminal') {
		const lines = section.lines
			.map((line) => `<span class="line ${esc(line.kind)}">${esc(line.text)}</span>`)
			.join('');
		return `<section class="section terminal">
	<div class="section-head"><div>${eyebrow}${headingOf(locale, section.title)}</div><p>${esc(tr(section.lead))}</p></div>
	<figure class="terminal-window" role="img" aria-label="${esc(tr(section.caption))}"><div class="terminal-bar"><i></i><i></i><i></i></div><pre>${lines}</pre><figcaption>${esc(tr(section.caption))}</figcaption></figure>
</section>`;
	}

	if (section.type === 'pricing') {
		// Prices come from the same snapshot the pricing page renders, so the
		// homepage can never quote a rate that the product page contradicts.
		const cards = section.plans
			.map((entry) => {
				const plan = pricing.plans.find((candidate) => candidate.id === entry.id);
				if (!plan) return '';
				const name = tr(`pricing.planNames.${plan.id}`);
				const description = tr(`pricing.plans.description.${plan.id}`);
				const use = plan.price_cents ? plan.monthly_commitment_cents : plan.monthly_grant_credits;
				const price = plan.price_cents
					? `$${Math.round(plan.price_cents / 100)}<small>${esc(tr('pricing.plans.perMonth'))}</small>`
					: `<small>${esc(tr('pricing.plans.noMonthlyCharge'))}</small>`;
				const usage = plan.price_cents
					? tr('pricing.plans.commitment', { amount: `$${Math.round(use / 100)}` })
					: tr('pricing.plans.grant', { amount: `$${(use / 100).toFixed(0)}` });
				return `<article class="plan${entry.highlight ? ' is-highlight' : ''}">
	<h3>${esc(name)}${entry.highlight ? `<span class="plan-tag">${esc(tr('pricing.plans.popular'))}</span>` : ''}</h3>
	<p class="plan-price">${price}</p>
	<p class="plan-use">${esc(usage)}</p>
	<p class="plan-desc">${esc(description)}</p>
</article>`;
			})
			.join('');
		return `<section class="section pricing">
	<div class="section-head"><div>${eyebrow}${headingOf(locale, section.title)}</div><p>${esc(tr(section.lead))}</p></div>
	<div class="plan-grid">${cards}</div>
	${section.more ? renderLink(locale, section.more, 'button secondary pricing-more') : ''}
</section>`;
	}

	if (section.type === 'footer') {
		const columns = section.columns
			.map(
				(column) => `<div><h3>${esc(tr(column.title))}</h3>${column.links
					.map((link) => {
						const external = /^https?:/.test(link.href);
						return `<a href="${esc(link.href)}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${esc(tr(link.label))}</a>`;
					})
					.join('')}</div>`
			)
			.join('');
		return `<footer class="footer">
	<div class="footer-statement"><h2>${esc(tr(section.statement.line1))}<br />${esc(tr(section.statement.line2))}</h2><p>${esc(tr(section.statement.bodyLine1))}<br />${esc(tr(section.statement.bodyLine2))}</p></div>
	<nav class="footer-grid" aria-label="${esc(tr(section.navLabel))}">${columns}</nav>
	<div class="footer-base"><span>${esc(tr(section.copyright))}</span><a href="${esc(section.about.href)}">${esc(tr(section.about.label))}</a><button class="status" type="button" data-checking="${esc(tr('status.checking'))}" data-ready="${esc(tr('status.docsAvailable'))}" data-error="${esc(tr('status.unavailableRetry'))}"><i></i><span data-status>${esc(tr('status.checking'))}</span></button><a href="${esc(section.github)}" target="_blank" rel="noreferrer" aria-label="GitHub">${ARROW}</a></div>
</footer>`;
	}

	throw new Error(`unhandled section type ${section.type}`);
}

const ARROW =
	'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

// ------------------------------------------------------------------- pages
const DEFAULT_LOCALE = definition.defaultLocale;
function pageFor(locale) {
	const tr = translator(locale);
	const body = sections.map((section) => renderSection(locale, section)).join('\n');
	return { title: tr('home.meta.title'), description: tr('home.meta.description'), body };
}

/**
 * The theme is a saved preference in the app; the static page reads the same
 * key so a reader who chose dark does not get a white flash on the homepage.
 */
const HEAD_SCRIPT = `(function(){try{var m=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)')).matches;var s=localStorage.getItem('miosa-theme')||'system';var d=s==='dark'||(s==='system'&&m);var l=localStorage.getItem('miosa-locale');var loc=l==='zh'||l==='en'?l:((navigator.language||'').toLowerCase().indexOf('zh')===0?'zh':'en');document.documentElement.dataset.theme=d?'dark':'light';window.__homeLocale=document.documentElement.dataset.homeLocale||loc;}catch(e){}})();`;

function htmlFor(locale, otherLocale) {
	const page = pageFor(locale);
	const config = definition.locales[locale];
	const other = definition.locales[otherLocale];
	const canonical = locale === DEFAULT_LOCALE ? '/' : `${config.prefix}/`;
	return `<!doctype html>
<html lang="${esc(config.htmlLang)}" dir="${esc(config.dir)}" data-theme="dark" data-home-locale="${esc(locale)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}" />
<link rel="canonical" href="${esc(canonical)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(page.title)}" />
<meta property="og:description" content="${esc(page.description)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#07080b" />
<script>${HEAD_SCRIPT}</script>
<link rel="stylesheet" href="/home.css" />
<link rel="preload" as="image" href="/brand/miosa-white.png" />
<style>${CRITICAL_CSS}</style>
</head>
<body>
<div class="fabric"><canvas class="fabric-canvas" aria-hidden="true" data-three="https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"></canvas><div class="static-fabric" aria-hidden="true"></div></div>
<header class="header">
	<a class="brand" href="${locale === DEFAULT_LOCALE ? '/' : config.prefix + '/'}" aria-label="MIOSA home"><img src="/brand/osa-orb.png" alt="" width="34" height="34" /><img class="wordmark" src="/brand/miosa-white.png" alt="MIOSA" width="65" height="16" /></a>
	<nav aria-label="Primary"><a class="nav-docs" href="/docs">${esc(translator(locale)('nav.docs'))}<span class="new-tag">${esc(translator(locale)('nav.new'))}</span></a><a href="/pricing">${esc(translator(locale)('nav.pricing'))}</a><a class="lang" href="${esc(other.prefix || '/')}" hreflang="${esc(other.htmlLang)}">${otherLocale.toUpperCase()}</a><a class="sign-in" href="https://miosa.ai/login">${esc(translator(locale)('nav.signIn'))}</a><a class="cta" href="https://miosa.ai/register">${esc(translator(locale)('nav.startBuilding'))}</a></nav>
</header>
<main>
${page.body}
</main>
<script src="/home.js" defer></script>
<script type="module" src="/fabric.js"></script>
</body>
</html>`;
}

// Critical CSS: the header, hero and the page background, so the first paint
// needs no stylesheet round trip. The rest arrives with /home.css.
const CRITICAL_CSS = `
html{background:#07080b}
html[data-theme="light"]{background:#fafafa}
body{margin:0;background:inherit;color:#f2f4f7;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased}
html[data-theme="light"] body{color:#0b0c0e}
.fabric{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.fabric::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,#07080bd6,#07080b61 53%,#07080bb8)}
html[data-theme="light"] .fabric::before{background:linear-gradient(90deg,#fafafa,#f4f5f7 53%,#fafafa)}
.fabric-canvas{position:absolute;inset:0;z-index:0;width:100%;height:100%;opacity:.72}
.static-fabric{position:absolute;inset:-10%;z-index:0;background-image:linear-gradient(#8294b41a 1px,transparent 1px),linear-gradient(90deg,#8294b41a 1px,transparent 1px);background-size:90px 90px;transform:perspective(600px) rotateY(-15deg);opacity:.4}
main,.header,.footer{position:relative;z-index:2}
.header{position:fixed;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;justify-content:space-between;height:80px;padding:20px clamp(20px,4vw,64px)}
.brand{display:flex;align-items:center;gap:13px}
.brand img:first-child{width:34px;height:34px;filter:drop-shadow(0 0 10px #bcc4dc44)}
.brand .wordmark{width:65px;height:auto}
.header nav{display:flex;align-items:center;gap:1.45rem;font-size:.74rem;font-weight:620}
.header nav a{color:#f4f6faad;text-decoration:none;white-space:nowrap}
.header nav a:hover{color:#fff}
html[data-theme="light"] .header nav a{color:#3b424e}
html[data-theme="light"] .header nav a:hover{color:#0b0c0e}
.hero{display:grid;align-items:center;min-height:100svh;padding:8rem clamp(1.25rem,7vw,7.5rem) 5rem}
.hero-copy{width:min(51rem,70vw)}
.eyebrow{margin:0 0 1.1rem;color:#c9d4e6a8;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.68rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
html[data-theme="light"] .eyebrow{color:#5b6472}
.hero h1{margin:0;max-width:51rem;color:#f4f5f7;font-size:clamp(3.2rem,6vw,6.3rem);font-weight:620;letter-spacing:-.058em;line-height:.92;text-wrap:pretty}
html[data-theme="light"] .hero h1{color:#0b0c0e}
.hero h1 span{color:#8ea2c9}
.hero-lead{max-width:42rem;margin:2rem 0 0;color:#e0e5eeb8;font-size:clamp(1rem,1.35vw,1.24rem);line-height:1.65}
html[data-theme="light"] .hero-lead{color:#49515e}
.announcement{display:inline-flex;align-items:center;gap:.6rem;max-width:100%;margin:0 0 1.5rem;padding:.28rem .8rem .28rem .28rem;border:1px solid #ffffff1f;border-radius:999px;color:#e7ebf2d1;background:#0a0c1094;font-size:.78rem;text-decoration:none}
.announcement span{display:inline-flex;flex:none;align-items:center;gap:.4rem;padding:.28rem .65rem;border-radius:999px;color:#f4f5f7;background:#ffffff1a;font-weight:650}
.announcement i{width:.4rem;height:.4rem;border-radius:50%;background:#6ee7a0}
.announcement b{font-weight:400}
.announcement svg{flex:none}
.hero-actions,.cta-actions{display:flex;align-items:center;gap:.8rem;margin-top:2rem}
.button{display:inline-flex;align-items:center;padding:.9rem 1.25rem;border-radius:999px;font-size:.84rem;font-weight:650;text-decoration:none}
.button.primary{background:#f7f9fcd6;color:#15171b;border:1px solid #ffffff7a}
.button.secondary{border:1px solid #ffffff29;color:#f4f5f7;background:#0a0c109e}
html[data-theme="light"] .button.secondary{color:#0b0c0e;border-color:#00000024;background:#ffffffc2}
.benchmark{display:flex;align-items:center;gap:7px;margin:2.25rem 0 0;color:#c9d4e694;font-size:.74rem;text-decoration:none}
.benchmark b{color:#c4cbd7;font-weight:550}
`;
void CRITICAL_CSS;

// ------------------------------------------------------------------- write
rmSync(join(OUT, 'home.css'), { force: true });
rmSync(join(OUT, 'home.js'), { force: true });
mkdirSync(OUT, { recursive: true });

copyFileSync(join(ROOT, 'src/marketing/home.css'), join(OUT, 'home.css'));
copyFileSync(join(ROOT, 'src/marketing/home.js'), join(OUT, 'home.js'));
copyFileSync(join(ROOT, 'src/marketing/fabric.js'), join(OUT, 'fabric.js'));

const locales = Object.keys(definition.locales);
writeFileSync(join(OUT, 'index.html'), htmlFor(DEFAULT_LOCALE, locales.find((l) => l !== DEFAULT_LOCALE)));

for (const locale of locales) {
	const config = definition.locales[locale];
	if (locale === DEFAULT_LOCALE) continue;
	const dir = join(OUT, config.prefix.replace(/^\//, ''));
	mkdirSync(dir, { recursive: true });
	const other = DEFAULT_LOCALE;
	writeFileSync(join(dir, 'index.html'), htmlFor(locale, other));
}

// sitemap for the two marketing entry points
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locales
	.map((locale) => {
		const config = definition.locales[locale];
		const href = locale === DEFAULT_LOCALE ? 'https://docs.norsky.cn/' : `https://docs.norsky.cn${config.prefix}/`;
		return `\t<url><loc>${href}</loc><changefreq>weekly</changefreq></url>`;
	})
	.join('\n')}
</urlset>
`;
writeFileSync(join(OUT, 'sitemap.xml'), sitemap);

const html = writeSize(join(OUT, 'index.html'));
const css = writeSize(join(OUT, 'home.css'));
const js = writeSize(join(OUT, 'home.js'));
const fabric = writeSize(join(OUT, 'fabric.js'));
console.log(
	`homepage: ${sections.length} sections · index.html ${html} KB · home.css ${css} KB · home.js ${js} KB · fabric.js ${fabric} KB · locales ${locales.join(', ')}`
);

function writeSize(file) {
	return (readFileSync(file).length / 1024).toFixed(1);
}
