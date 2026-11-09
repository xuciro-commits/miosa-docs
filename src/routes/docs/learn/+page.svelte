<script lang="ts">
	import {
		ArrowRight,
		CircleDollarSign,
		Check,
		BookOpen,
		Gamepad2,
		Play,
		Rocket
	} from '@lucide/svelte';
	import { t } from '#lib/i18n.svelte.js';
	import { progress } from '#lib/learning.svelte.js';
	const paths = [
		{
			key: 'words',
			href: '/docs/glossary',
			icon: BookOpen,
			amount: 20
		},
		{
			key: 'games',
			href: '/docs/learn/games',
			icon: Gamepad2,
			amount: 50
		},
		{
			key: 'videos',
			href: '/docs/learn/videos',
			icon: Play,
			amount: 30
		},
		{
			key: 'build',
			href: '/docs/quickstart',
			icon: Rocket,
			amount: 0
		}
	];
</script>

<p class="intro">
	{t('learning.home.intro')}
</p>
<section class="how panel">
	<h2 id="how-earning-works">{t('learning.home.howTitle')}</h2>
	<ol>
		<li>
			<span>1</span>
			<p><b>{t('learning.home.step1Title')}</b> {t('learning.home.step1Text')}</p>
		</li>
		<li>
			<span>2</span>
			<p><b>{t('learning.home.step2Title')}</b> {t('learning.home.step2Text')}</p>
		</li>
		<li>
			<span>3</span>
			<p>
				<b>{t('learning.home.step3Title')}</b> {t('learning.home.step3Text')}
			</p>
		</li>
	</ol>
	<a href="/docs/learn/earn" class="button"
		>{t('learning.common.seeYourProgress')}<ArrowRight size={12} /></a
	>
</section>
<section class="progress-card panel">
	<div>
		<CircleDollarSign size={23} />
		<h2 id="your-progress">
			{t('learning.home.progressTitle1')}<br />{t('learning.home.progressTitle2')}
		</h2>
		<a href="/docs/learn/earn" class="button primary"
			>{t('learning.common.keepLearning')}<ArrowRight size={13} /></a
		>
	</div>
	<p>{t('learning.home.creditsNote')}</p>
	<div class="progress-track"><span style={`width:${progress.credits}%`}></span></div>
	<small>{t('learning.common.creditsProgress', { value: progress.credits })}</small>
</section>
<div class="learning-paths">
	{#each paths as path, i}<a class="path panel" href={path.href}
			><span class="path-number">{i + 1}</span>
			<div>
				<h2>
					{t(`learning.home.path.${path.key}.title`)}{#if path.amount}<span class="pill"
							>{t('learning.common.upTo', { amount: path.amount })}</span
						>{/if}
				</h2>
				<p>{t(`learning.home.path.${path.key}.text`)}</p>
				{#if i === 0 || i === 1}<div class="path-progress">
						<div class="progress-track">
							<span
								style={`width:${i === 0 ? (progress.words / 8) * 100 : (progress.games / 7) * 100}%`}
							></span>
						</div>
						<small
							>{i === 0
								? t('learning.home.categoriesProgress', {
										done: progress.words,
										total: 8
									})
								: t('learning.home.unitsProgress', {
										done: progress.games,
										total: 7
									})}</small
						>
					</div>{/if}
			</div>
			<ArrowRight size={15} /></a
		>{/each}
</div>
<h2 id="prefer-to-read">{t('learning.home.readingTitle')}</h2>
<div class="reading-path panel">
	{#each [['productModel', 'product-model'], ['sandboxes', 'sandboxes'], ['quickstart', 'quickstart'], ['deployments', 'deployments'], ['data', 'data']] as [key, slug], i}<a
			href={`/docs/${slug}`}><span>{i + 1}</span><b>{t(`learning.home.reading.${key}`)}</b
			><ArrowRight size={13} /></a
		>{/each}
</div>

<style>
	.intro {
		font-size: 15px;
		color: var(--muted);
		line-height: 1.8;
	}
	.how {
		background: var(--surface-2);
		padding: 20px;
		margin: 30px 0;
	}
	.how h2 {
		font-size: 16px;
		margin: 0 0 17px;
	}
	.how ol {
		list-style: none;
		padding: 0;
		margin: 0 0 15px;
	}
	.how li {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		margin: 11px 0;
		font-size: 13px;
	}
	.how li > span,
	.path-number,
	.reading-path a > span {
		display: inline-grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 50%;
		font-size: 11px;
		flex: none;
	}
	.how p {
		margin: 0;
		color: var(--muted);
	}
	.how b {
		color: var(--text);
		font-weight: 550;
	}
	.progress-card {
		padding: 22px;
		margin: 35px 0;
	}
	.progress-card > div:first-child {
		display: flex;
		align-items: center;
		gap: 13px;
	}
	.progress-card h2 {
		font-size: 20px;
		line-height: 1.25;
		margin: 0;
		flex: 1;
	}
	.progress-card p {
		font-size: 12px;
		color: var(--muted);
		margin: 16px 0;
	}
	.progress-card small {
		font-size: 11px;
		display: block;
		text-align: right;
		margin-top: 8px;
	}
	.learning-paths {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.path {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 22px;
	}
	.path:hover {
		border-color: var(--faint);
	}
	.path > div {
		flex: 1;
	}
	.path > :global(svg) {
		align-self: center;
	}
	.path h2 {
		font-size: 17px;
		margin: 0 0 9px;
	}
	.path h2 .pill {
		font-size: 9px;
		vertical-align: 2px;
		margin-left: 8px;
	}
	.path p {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
		margin: 0;
	}
	.path-progress {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 17px;
	}
	.path-progress .progress-track {
		flex: 1;
	}
	.path-progress small {
		font-size: 10px;
		color: var(--muted);
	}
	.reading-path a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 18px;
		border-bottom: 1px solid var(--border);
		font-size: 13px;
	}
	.reading-path a:last-child {
		border: 0;
	}
	.reading-path a:hover {
		background: var(--surface-2);
	}
	.reading-path b {
		font-weight: 500;
		flex: 1;
	}
	@media (max-width: 600px) {
		.path {
			padding: 18px 15px;
			gap: 10px;
		}
		.progress-card > div:first-child {
			flex-wrap: wrap;
		}
		.progress-card .button {
			margin-left: 35px;
		}
		.path-progress {
			display: block;
		}
		.path-progress small {
			display: block;
			margin-top: 7px;
		}
		.path h2 .pill {
			display: inline-block;
			margin: 6px 0 0 6px;
		}
	}
</style>
