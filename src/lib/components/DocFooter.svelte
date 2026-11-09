<script lang="ts">
	import { ArrowUpRight, CodeXml as Github } from '@lucide/svelte';
	import { t } from '#lib/i18n.svelte.js';
	const columns = [
		{
			titleKey: 'docs.footer.column.getStarted',
			links: [
				{ key: 'docs.footer.link.introduction', slug: '' },
				{ key: 'docs.footer.link.quickstart', slug: 'quickstart' },
				{ key: 'docs.footer.link.installation', slug: 'installation' },
				{ key: 'docs.footer.link.productModel', slug: 'product-model' }
			]
		},
		{
			titleKey: 'docs.footer.column.learn',
			links: [
				{ key: 'docs.footer.link.learn', slug: 'learn' },
				{ key: 'docs.footer.link.learnEarn', slug: 'learn/earn' },
				{ key: 'docs.footer.link.glossary', slug: 'glossary' },
				{ key: 'docs.footer.link.labs', slug: 'learn/games' }
			]
		},
		{
			titleKey: 'docs.footer.column.build',
			links: [
				{ key: 'docs.footer.link.sandboxes', slug: 'sandboxes' },
				{ key: 'docs.footer.link.computers', slug: 'computers' },
				{ key: 'docs.footer.link.deployments', slug: 'deployments' },
				{ key: 'docs.footer.link.data', slug: 'data' }
			]
		},
		{
			titleKey: 'docs.footer.column.developers',
			links: [
				{ key: 'docs.footer.link.sdks', slug: 'sdks' },
				{ key: 'docs.footer.link.cli', slug: 'cli' },
				{ key: 'docs.footer.link.api', slug: 'api' },
				{ key: 'docs.footer.link.customization', slug: 'customization' }
			]
		}
	];
</script>

<footer class="doc-footer">
	<div class="footer-top">
		<div>
			<a class="footer-brand" href="/docs"><img src="/brand/osa-orb.png" alt="" /><b>MIOSA</b></a>
			<p>{t('docs.footer.taglineLine1')}<br />{t('docs.footer.taglineLine2')}</p>
		</div>
		<a class="button" href="/docs/customization"
			>{t('docs.footer.makeOwn')}<ArrowUpRight size={13} /></a
		>
	</div>
	<nav class="footer-columns" aria-label={t('docs.footer.aria')}>
		{#each columns as column}<div>
				<h3>{t(column.titleKey)}</h3>
				{#each column.links as link}<a href={`/docs${link.slug ? '/' + link.slug : ''}`}
						>{t(link.key)}</a
					>{/each}
			</div>{/each}
	</nav>
	<div class="footer-bottom">
		<span>{t('docs.footer.copyright')}</span><a
			href="https://github.com/Miosa-osa/foundation"
			target="_blank"
			rel="noreferrer"
			aria-label={t('docs.footer.github')}><Github size={14} /></a
		>
	</div>
</footer>

<style>
	.doc-footer {
		border-top: 1px solid var(--border);
		padding: 44px 48px 20px;
		margin-top: 10px;
	}
	.footer-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 34px;
	}
	.footer-brand {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 17px;
	}
	.footer-brand img {
		width: 24px;
		height: 24px;
	}
	.footer-top p {
		font-size: 11px;
		color: var(--muted);
		line-height: 1.65;
		margin: 9px 0 0;
	}
	.footer-columns {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 25px;
		padding-bottom: 38px;
	}
	.footer-columns h3 {
		font-size: 11px;
		letter-spacing: 0;
		font-weight: 550;
		margin: 0 0 12px;
	}
	.footer-columns a {
		display: block;
		font-size: 11px;
		color: var(--muted);
		padding: 4px 0;
	}
	.footer-columns a:hover {
		color: var(--text);
	}
	.footer-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-top: 1px solid var(--border);
		padding-top: 18px;
		font-size: 10px;
		color: var(--muted);
	}
	.footer-bottom a {
		display: flex;
	}
	@media (max-width: 650px) {
		.doc-footer {
			padding: 30px 22px 20px;
		}
		.footer-columns {
			grid-template-columns: 1fr 1fr;
			gap: 25px;
		}
		.footer-top .button {
			font-size: 10px;
			padding: 7px 9px;
		}
	}
</style>
