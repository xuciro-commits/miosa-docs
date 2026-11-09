<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, ArrowRight, ChevronRight, House } from '@lucide/svelte';
	import { getDocument } from '#lib/content/catalog.js';
	import { navItems } from '#lib/content/navigation.js';
	import products from '#lib/content/products.json';
	import { preferences } from '#lib/preferences.svelte.js';
	import { i18n, t } from '#lib/i18n.svelte.js';
	import { navSlugZh } from '#lib/i18n/nav-slug-zh.js';
	import { sectionZh } from '#lib/i18n/nav-labels-zh.js';
	import Header from '#lib/components/Header.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import TableOfContents from '#lib/components/TableOfContents.svelte';
	import PageActions from '#lib/components/PageActions.svelte';
	import DocFooter from '#lib/components/DocFooter.svelte';
	let { children } = $props();
	const slug = $derived(page.url.pathname.replace(/^\/docs\/?/, '').replace(/\/$/, ''));
	const doc = $derived(getDocument(slug));
	const index = $derived(navItems.findIndex((item) => item.slug === slug));
	const previous = $derived(index > 0 ? navItems[index - 1] : undefined);
	const next = $derived(
		index >= 0 && index < navItems.length - 1 ? navItems[index + 1] : undefined
	);
	const landing = $derived(slug === '');
	const wide = $derived(landing || slug === 'api');
	const sectionKeys: Record<string, string> = {
		'Get started': 'docs.nav.group.getStarted',
		Learn: 'docs.nav.group.learn',
		'Services & projects': 'docs.nav.group.servicesProjects',
		Sandboxes: 'docs.nav.group.sandboxes',
		Computers: 'docs.nav.group.computers',
		'Databases & storage': 'docs.nav.group.databasesStorage',
		'Networking & domains': 'docs.nav.group.networkingDomains',
		Agents: 'docs.nav.group.agents',
		'CLI, SDKs & MCP': 'docs.nav.group.cliSdksMcp',
		'API reference': 'docs.nav.group.apiReference',
		'Organization & security': 'docs.nav.group.organizationSecurity',
		Optimal: 'docs.nav.group.optimal',
		'Optimal Engine': 'docs.nav.group.optimalEngine',
		'Platform builders': 'docs.nav.group.platformBuilders',
		Build: 'docs.nav.group.build',
		'Organization & billing': 'docs.nav.group.organizationBilling',
		'Security & compliance': 'docs.nav.group.securityCompliance',
		'Self-hosting': 'docs.nav.group.selfHosting',
		Compare: 'docs.nav.group.compare',
		Reference: 'docs.nav.group.reference',
		Help: 'docs.nav.group.help'
	};
	function sectionLabel(section: string): string {
		if (i18n.locale === 'zh') return sectionZh[section] ?? section;
		const key = sectionKeys[section];
		return key ? t(key) : section;
	}
	function pageKey(slugValue: string, part: 'title' | 'description'): string {
		if (slugValue.startsWith('learn/final/')) return `docs.page.checkUnderstanding.${part}`;
		if (slugValue.startsWith('learn/labs/')) return `docs.page.learningLab.${part}`;
		return `docs.page.${slugValue ? slugValue.replaceAll('/', '.') : 'introduction'}.${part}`;
	}
	function translatedPageText(
		slugValue: string,
		part: 'title' | 'description',
		fallback: string
	): string {
		// Generated pages already carry the target page title and description.
		// Do not let the older hand-written key catalogue overwrite them in English.
		if (i18n.locale === 'en') return fallback;
		const key = pageKey(slugValue, part);
		const value = t(key);
		return value === key ? fallback : value;
	}
	function productFor(slugValue: string) {
		return products.find((product) => product.href === `/docs/${slugValue}`);
	}
	function productName(product: (typeof products)[number]): string {
		const key = `docs.productShowcase.product.${product.id}.name`;
		const translated = t(key);
		return translated === key ? product.name : translated;
	}
	function pageTitle(slugValue: string, fallback: string, fallbackZh?: string): string {
		if (i18n.locale === 'en') return fallback;
		if (fallbackZh) return fallbackZh;
		if (slugValue.startsWith('build/')) {
			const prefix = fallback.startsWith('Run ')
				? t('docs.page.build.runPrefix')
				: t('docs.page.build.ownPrefix');
			const product = productFor(slugValue);
			return `${prefix}${product ? productName(product) : fallback.replace(/^(Run |Build your own )/, '')}`;
		}
		return translatedPageText(slugValue, 'title', fallback);
	}
	function pageDescription(slugValue: string, fallback: string, fallbackZh?: string): string {
		if (i18n.locale === 'en') return fallback;
		if (fallbackZh) return fallbackZh;
		if (slugValue.startsWith('build/')) {
			const product = productFor(slugValue);
			if (product) {
				const key = `docs.productShowcase.product.${product.id}.blurb`;
				const translated = t(key);
				if (translated !== key) return translated;
			}
		}
		return translatedPageText(slugValue, 'description', fallback);
	}
	function navTitle(slugValue: string, fallback: string, fallbackZh?: string): string {
		if (i18n.locale === 'en') return fallback;
		if (slugValue && navSlugZh[slugValue]) return navSlugZh[slugValue];
		if (fallbackZh) return fallbackZh;
		const key = `docs.nav.${slugValue ? slugValue.replaceAll('/', '.') : 'introduction'}`;
		const value = t(key);
		return value === key ? fallback : value;
	}
	const currentTitle = $derived(pageTitle(slug, doc?.title ?? t('docs.layout.pageNotFound'), doc?.titleZh));
	const currentDescription = $derived(
		pageDescription(slug, doc?.description ?? t('docs.layout.pageNotFoundDescription'), doc?.descriptionZh)
	);
</script>

<svelte:head
	><title>{t('docs.layout.titleSuffix', { title: currentTitle })}</title><meta
		name="description"
		content={currentDescription}
	/><link rel="alternate" type="text/markdown" href={`/docs/${slug || 'index'}.md`} /></svelte:head
>
<a href="#main-content" class="skip-link">{t('docs.layout.skipToContent')}</a>
<div class="docs-app" style={`--sidebar-width:${preferences.sidebarWidth}px`}>
	<Header /><Sidebar />{#if preferences.sidebarOpen}<button
			class="nav-backdrop"
			aria-label={t('docs.layout.closeNavigation')}
			onclick={() => (preferences.sidebarOpen = false)}
		></button>{/if}
	<div class="reading-stage">
		<div class="docs-grid" class:wide>
			<main id="main-content" class="article-column" tabindex="-1">
				{#if !landing}<div class="article-toolbar">
						<nav class="breadcrumbs" aria-label={t('docs.layout.breadcrumbAria')}>
							<a href="/docs">{t('docs.layout.docs')}</a><span>/</span
							>{#if doc?.section && doc.section !== 'Get started'}<a
									href={doc.section === 'Learn' ? '/docs/learn' : '/docs'}
									>{sectionLabel(doc.section)}</a
								><span>/</span>{/if}<span aria-current="page">{currentTitle}</span>
						</nav>
						<PageActions />
					</div>{/if}
				<article id="article-body">
					{#if !landing}<h1>{currentTitle}</h1>
						{#if doc?.description}<p class="lead">
								{currentDescription}
							</p>{/if}{/if}{@render children()}
				</article>
				{#if !landing && (previous || next)}<nav
						class="page-neighbors"
						aria-label={t('docs.layout.previousNextAria')}
					>
						{#if previous}<a href={previous.href}
								><small>{t('docs.layout.previous')}</small><span
									><ArrowLeft size={13} />{navTitle(previous.slug ?? '', previous.title, previous.titleZh)}</span
								></a
							>{:else}<span></span>{/if}{#if next}<a href={next.href} class="next"
								><small>{t('docs.layout.next')}</small><span
									>{navTitle(next.slug ?? '', next.title, next.titleZh)}<ArrowRight size={13} /></span
								></a
							>{/if}
					</nav>{/if}
			</main>
			{#if !wide}<TableOfContents />{/if}
		</div>
		<DocFooter />
	</div>
</div>

<style>
	.docs-app {
		padding-top: 72px;
	}
	.reading-stage {
		margin: 0 8px 8px var(--sidebar-width);
		background: var(--surface);
		border: 1px solid var(--docs-panel-border);
		border-radius: var(--docs-radius-panel);
		min-height: calc(100vh - 82px);
		box-shadow: var(--docs-shadow-panel);
		overflow: clip;
	}
	.docs-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 224px;
		min-height: calc(100vh - 85px);
	}
	.article-column {
		width: 100%;
		max-width: 736px;
		padding: 32px 48px 55px;
		margin: 0 auto;
		min-width: 0;
	}
	.article-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		margin-bottom: 28px;
		min-height: 31px;
	}
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		font-size: 10.5px;
		line-height: 1.5;
		color: var(--muted);
	}
	.breadcrumbs > span:last-child {
		max-width: 230px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.breadcrumbs a:hover {
		color: var(--text);
	}
	article > h1 {
		font-size: 40px;
		font-weight: 600;
		letter-spacing: -0.03em;
		line-height: 1.1;
		margin-bottom: 15px;
	}
	.page-neighbors {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-top: 45px;
	}
	.page-neighbors a {
		display: flex;
		flex-direction: column;
		gap: 9px;
		border: 1px solid var(--border);
		border-radius: 9px;
		padding: 14px 16px;
		min-width: 0;
	}
	.page-neighbors a:hover {
		background: var(--surface-2);
	}
	.page-neighbors small {
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
	}
	.page-neighbors span {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		line-height: 1.5;
	}
	.page-neighbors .next {
		text-align: right;
		align-items: flex-end;
	}
	.wide {
		display: block;
	}
	.wide .article-column {
		max-width: none;
		padding: 32px 48px 64px;
	}
	.nav-backdrop {
		display: none;
	}
	@media (max-width: 1279px) {
		.docs-grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.article-column {
			max-width: 784px;
			padding: 32px 48px 48px;
		}
	}
	@media (max-width: 1100px) {
		.reading-stage {
			margin-left: 10px;
		}
		.article-column {
			max-width: 784px;
		}
		.nav-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			background: #0005;
			backdrop-filter: blur(2px);
			z-index: 55;
		}
	}
	@media (max-width: 600px) {
		.reading-stage {
			margin: 0 7px 7px;
			border-radius: 13px;
		}
		.article-column,
		.wide .article-column {
			padding: 24px 21px 35px;
		}
		article > h1 {
			font-size: 30px;
		}
		.article-toolbar {
			margin-bottom: 25px;
			gap: 10px;
		}
		.breadcrumbs {
			font-size: 10px;
		}
		.breadcrumbs > span:last-child {
			max-width: 145px;
		}
		.page-neighbors {
			gap: 10px;
		}
		.page-neighbors a {
			padding: 12px;
		}
		.page-neighbors span {
			font-size: 10px;
		}
		.docs-app {
			padding-top: 67px;
		}
	}
</style>
