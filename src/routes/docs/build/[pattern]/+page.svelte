<script lang="ts">
	import RequestBuilder from '#lib/components/RequestBuilder.svelte';
	import Callout from '#lib/components/Callout.svelte';
	import { t } from '#lib/i18n.svelte.js';
	let { data } = $props();
	const computer = $derived(/computer|desktop|browser|persistent/.test(data.product.blurb));
	function productBlurb(product: { id: string; blurb: string }): string {
		const key = `docs.productShowcase.product.${product.id}.blurb`;
		const translated = t(key);
		return translated === key ? product.blurb : translated;
	}
	function productName(product: { id: string; name: string }): string {
		const key = `docs.productShowcase.product.${product.id}.name`;
		const translated = t(key);
		return translated === key ? product.name : translated;
	}
</script>

<Callout title={t('docs.buildPattern.calloutTitle')}>
	{t('docs.buildPattern.calloutBody', { name: productName(data.product) })}
</Callout>
<h2>{t('docs.buildPattern.chooseEnvironment')}</h2>
<p>{productBlurb(data.product)}</p>
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
	<a href={`https://miosa.ai${data.product.href}`} target="_blank" rel="noreferrer"
		>{t('docs.buildPattern.originalRecipe', { name: productName(data.product) })} ↗</a
	>
</p>
