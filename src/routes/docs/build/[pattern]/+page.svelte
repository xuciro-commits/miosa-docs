<script lang="ts">
	import RequestBuilder from '#lib/components/RequestBuilder.svelte';
	import Callout from '#lib/components/Callout.svelte';
	import { i18n, t } from '#lib/i18n.svelte.js';
	let { data } = $props();
	const product = $derived(data.product);
	const html = $derived(i18n.locale === 'zh' ? data.htmlZh : data.html);
	const computer = $derived(
		!!product && /computer|desktop|browser|persistent/.test(product.blurb)
	);
	function productBlurb(item: { id: string; blurb: string }): string {
		const key = `docs.productShowcase.product.${item.id}.blurb`;
		const translated = t(key);
		return translated === key ? item.blurb : translated;
	}
	function productName(item: { id: string; name: string }): string {
		const key = `docs.productShowcase.product.${item.id}.name`;
		const translated = t(key);
		return translated === key ? item.name : translated;
	}
</script>

{#if html}
	<div class="article-content">{@html html}</div>
{:else if product}
	<Callout title={t('docs.buildPattern.calloutTitle')}>
		{t('docs.buildPattern.calloutBody', { name: productName(product) })}
	</Callout>
	<h2>{t('docs.buildPattern.chooseEnvironment')}</h2>
	<p>{productBlurb(product)}</p>
	<p>{computer ? t('docs.buildPattern.computerBody') : t('docs.buildPattern.sandboxBody')}</p>
	<h2>{t('docs.buildPattern.createWorkspace')}</h2>
	<p>{t('docs.buildPattern.workspaceBody')}</p>
	<RequestBuilder />
	<h2>{t('docs.buildPattern.runPublish')}</h2>
	<ol>
		<li>{t('docs.buildPattern.stepAuthenticate')}</li>
		<li>{t('docs.buildPattern.stepStart')}</li>
		<li>{t('docs.buildPattern.stepPreview')}</li>
		<li>{t('docs.buildPattern.stepSnapshot')}</li>
	</ol>
	<h2>{t('docs.buildPattern.continueBuilding')}</h2>
	<p>
		<a href={computer ? '/docs/computers' : '/docs/sandboxes'}
			>{t('docs.buildPattern.environmentGuide')}</a
		>
		· <a href="/docs/agents">{t('docs.buildPattern.agentRuns')}</a> ·
		<a href="/docs/deployments">{t('docs.buildPattern.publishVersion')}</a>
	</p>
	<p>
		<a href={`https://miosa.ai${product.href}`} target="_blank" rel="noreferrer"
			>{t('docs.buildPattern.originalRecipe', { name: productName(product) })} ↗</a
		>
	</p>
{/if}
