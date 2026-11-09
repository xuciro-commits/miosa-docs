<script lang="ts">
	import { ArrowUpRight, CodeXml as Github } from '@lucide/svelte';
	const columns = [
		{
			title: 'Get started',
			links: [
				['Introduction', ''],
				['Quickstart', 'quickstart'],
				['Install the CLI or SDK', 'installation'],
				['The product model', 'product-model']
			]
		},
		{
			title: 'Learn',
			links: [
				['Start learning', 'learn'],
				['Learn and earn', 'learn/earn'],
				['The words', 'glossary'],
				['Interactive labs', 'learn/games']
			]
		},
		{
			title: 'Build',
			links: [
				['Sandboxes', 'sandboxes'],
				['Computers', 'computers'],
				['Deployments', 'deployments'],
				['Data and bindings', 'data']
			]
		},
		{
			title: 'Developers',
			links: [
				['SDKs', 'sdks'],
				['CLI & MCP', 'cli'],
				['API reference', 'api'],
				['Customize this site', 'customization']
			]
		}
	];
</script>

<footer class="doc-footer">
	<div class="footer-top">
		<div>
			<a class="footer-brand" href="/docs"><img src="/brand/osa-orb.png" alt="" /><b>MIOSA</b></a>
			<p>Documentation for building,<br />understanding and shipping.</p>
		</div>
		<a class="button" href="/docs/customization">Make it your own<ArrowUpRight size={13} /></a>
	</div>
	<nav class="footer-columns" aria-label="Footer">
		{#each columns as column}<div>
				<h3>{column.title}</h3>
				{#each column.links as [title, slug]}<a href={`/docs${slug ? '/' + slug : ''}`}>{title}</a
					>{/each}
			</div>{/each}
	</nav>
	<div class="footer-bottom">
		<span>© 2026 · Independent learning reconstruction</span><a
			href="https://github.com/Miosa-osa/foundation"
			target="_blank"
			rel="noreferrer"
			aria-label="Foundation source"><Github size={14} /></a
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
