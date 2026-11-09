<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, ArrowRight, ChevronRight, House } from '@lucide/svelte';
	import { getDocument } from '#lib/content/catalog.js';
	import { navItems } from '#lib/content/navigation.js';
	import { preferences } from '#lib/preferences.svelte.js';
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
</script>

<svelte:head
	><title>{doc?.title ?? 'Page not found'} · MIOSA Docs</title><meta
		name="description"
		content={doc?.description ?? 'Documentation and learning workspace'}
	/><link rel="alternate" type="text/markdown" href={`/docs/${slug || 'index'}.md`} /></svelte:head
>
<a href="#main-content" class="skip-link">Skip to content</a>
<div class="docs-app" style={`--sidebar-width:${preferences.sidebarWidth}px`}>
	<Header /><Sidebar />{#if preferences.sidebarOpen}<button
			class="nav-backdrop"
			aria-label="Close navigation"
			onclick={() => (preferences.sidebarOpen = false)}
		></button>{/if}
	<div class="reading-stage">
		<div class="docs-grid" class:wide>
			<main id="main-content" class="article-column" tabindex="-1">
				{#if !landing}<div class="article-toolbar">
						<nav class="breadcrumbs" aria-label="Breadcrumb">
							<a href="/docs">Docs</a><span>/</span
							>{#if doc?.section && doc.section !== 'Get started'}<a
									href={doc.section === 'Learn' ? '/docs/learn' : '/docs'}>{doc.section}</a
								><span>/</span>{/if}<span aria-current="page"
								>{doc?.title === 'MIOSA Documentation' ? 'Introduction' : doc?.title}</span
							>
						</nav>
						<PageActions />
					</div>{/if}
				<article id="article-body">
					{#if !landing}<h1>{doc?.title ?? 'Page not found'}</h1>
						{#if doc?.description}<p class="lead">
								{doc.description}
							</p>{/if}{/if}{@render children()}
				</article>
				{#if !landing && (previous || next)}<nav
						class="page-neighbors"
						aria-label="Previous and next pages"
					>
						{#if previous}<a href={previous.href}
								><small>Previous</small><span><ArrowLeft size={13} />{previous.title}</span></a
							>{:else}<span></span>{/if}{#if next}<a href={next.href} class="next"
								><small>Next</small><span>{next.title}<ArrowRight size={13} /></span></a
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
