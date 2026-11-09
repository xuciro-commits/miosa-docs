<script lang="ts">
	import {
		CircleDollarSign,
		Circle,
		Check,
		ArrowRight,
		PlayCircle,
		BookOpen,
		Gamepad2,
		ShieldCheck
	} from '@lucide/svelte';
	import { categories, units, videos } from '#lib/content/learning.js';
	import {
		learning,
		progress,
		categoryName,
		unitTitle,
		videoTitle
	} from '#lib/learning.svelte.js';
	import { t } from '#lib/i18n.svelte.js';
</script>

<p class="intro-note">
	{t('learning.earn.intro')}
</p>
<section class="earn-summary panel" aria-labelledby="earn-overview">
	<div class="summary-top">
		<span class="summary-icon"><CircleDollarSign size={23} strokeWidth={1.5} /></span>
		<div>
			<h2 id="earn-overview">
				{t('learning.earn.summaryTitle1')}<br />{t('learning.earn.summaryTitle2')}
			</h2>
			<p>{t('learning.earn.summaryText')}</p>
		</div>
		<a
			class="button primary"
			href={progress.words + progress.games > 0 ? '/docs/learn' : '/docs/glossary'}
			>{progress.words + progress.games > 0
				? t('learning.common.keepLearning')
				: t('learning.common.startLearning')}<ArrowRight size={13} /></a
		>
	</div>
	<div class="summary-progress">
		<div class="progress-track"><span style={`width:${progress.credits}%`}></span></div>
		<b>${progress.credits} / $100</b>
	</div>
	<div class="track-amounts">
		<span><b>$20</b> {t('learning.earn.wordsLabel')}</span><span><b>$50</b> {t(
				'learning.earn.gamesLabel'
			)}</span><span><b>$30</b> {t('learning.earn.videosLabel')}</span>
	</div>
</section>

<section class="earn-track panel">
	<header>
		<span class="step">1</span>
		<div>
			<h2 id="learn-the-words">{t('learning.earn.wordsTitle')}</h2>
			<p>{t('learning.earn.wordsText')}</p>
		</div>
		<div class="track-value"><b>$20</b><small>{t('learning.earn.categoriesCount')}</small></div>
	</header>
	<div class="track-progress progress-track">
		<span style={`width:${(progress.words / 8) * 100}%`}></span>
	</div>
	<div class="earn-rows">
		{#each categories as category}{@const done = learning.passed.includes(category.id)}<a
				class="earn-row"
				href={`/docs/learn/final/category/${category.id}`}
				><span class="completion" class:done
					>{#if done}<Check size={12} />{:else}<Circle size={15} />{/if}</span
				><span class="row-label">{categoryName(category.id)}</span><span class="pill reward"
					><CircleDollarSign size={10} />+$2.50</span
				><span class="row-status"
					>{done ? t('learning.common.completed') : t('learning.common.startCheck')}</span
				></a
			>{/each}
	</div>
	<a href="/docs/glossary" class="track-link"
		>{t('learning.earn.wordsLink')}<ArrowRight size={12} /></a
	>
</section>

<section class="earn-track panel">
	<header>
		<span class="step">2</span>
		<div>
			<h2 id="learn-with-games">{t('learning.earn.gamesTitle')}</h2>
			<p>{t('learning.earn.gamesText')}</p>
		</div>
		<div class="track-value"><b>$50</b><small>{t('learning.earn.unitsCount')}</small></div>
	</header>
	<div class="track-progress progress-track">
		<span style={`width:${(progress.games / 7) * 100}%`}></span>
	</div>
	<div class="earn-rows">
		{#each units as unit}{@const done = learning.labs.includes(unit.id)}<a
				class="earn-row"
				href={`/docs/learn/labs/${unit.id}`}
				><span class="completion" class:done
					>{#if done}<Check size={12} />{:else}<Circle size={15} />{/if}</span
				><span class="row-label">{unitTitle(unit.id)}</span><span class="pill reward"
					><CircleDollarSign size={10} />+${unit.reward}</span
				><span class="row-status"
					>{done ? t('learning.common.completed') : t('learning.common.openLab')}</span
				></a
			>{/each}
	</div>
	<a href="/docs/learn/games" class="track-link"
		>{t('learning.earn.gamesLink')}<ArrowRight size={12} /></a
	>
</section>

<section class="earn-track panel">
	<header>
		<span class="step">3</span>
		<div>
			<h2 id="learn-with-videos">
				{t('learning.earn.videosTitle')} <span class="pill">{t('learning.common.notOpenYet')}</span>
			</h2>
			<p>{t('learning.earn.videosText')}</p>
		</div>
		<div class="track-value"><b>$30</b><small>{t('learning.earn.videosCount')}</small></div>
	</header>
	<div class="track-progress progress-track"><span></span></div>
	<div class="earn-rows">
		{#each videos as video}<div class="earn-row unavailable">
				<PlayCircle size={14} /><span class="row-label">{videoTitle(video)}</span><span
					class="pill reward"><CircleDollarSign size={10} />+$2.50</span
				><span class="row-status">{t('learning.common.notOpenYet')}</span>
			</div>{/each}
	</div>
	<a href="/docs/learn/videos" class="track-link"
		>{t('learning.earn.videosLink')}<ArrowRight size={12} /></a
	>
</section>

<h2 id="how-it-works">{t('learning.earn.howTitle')}</h2>
<section class="how-grid">
	{#each [{ key: 'how1' }, { key: 'how2' }, { key: 'how3' }] as item, i}<div>
			<span class="step">{i + 1}</span>
			<div>
				<h3>{t(`learning.earn.${item.key}Title`)}</h3>
				<p>{t(`learning.earn.${item.key}Text`)}</p>
			</div>
		</div>{/each}
</section>
<h2 id="your-learning-workspace">{t('learning.earn.workspaceTitle')}</h2>
<div class="learning-note">
	<ShieldCheck size={18} />
	<div>
		<strong>{t('learning.earn.workspaceLead')}</strong>
		<p>{t('learning.earn.workspaceP1')}</p>
		<p>{t('learning.earn.workspaceP2')}</p>
	</div>
</div>
<h2 id="keep-learning">{t('learning.earn.keepTitle')}</h2>
<ul class="keep-learning">
	<li><a href="/docs/learn">{t('learning.earn.keep1')}</a></li>
	<li><a href="/docs/glossary">{t('learning.earn.keep2')}</a></li>
	<li><a href="/docs/quickstart">{t('learning.earn.keep3')}</a></li>
</ul>

<style>
	.intro-note {
		font-size: 14px;
		color: var(--muted);
		line-height: 1.8;
		margin: 0 0 20px;
	}
	.earn-summary {
		padding: 22px;
		margin: 0 0 24px;
		box-shadow: 0 3px 8px #00000004;
	}
	.summary-top {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.summary-icon {
		display: grid;
		place-items: center;
		width: 45px;
		height: 45px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface-2);
		flex: none;
	}
	.summary-top > div {
		flex: 1;
	}
	.summary-top h2 {
		margin: 0 0 8px;
		font-size: 22px;
		line-height: 1.15;
		letter-spacing: -0.025em;
	}
	.summary-top p {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.65;
		margin: 0;
		max-width: 270px;
	}
	.summary-top > .button {
		font-size: 11px;
	}
	.summary-progress {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 20px;
	}
	.summary-progress .progress-track {
		flex: 1;
	}
	.summary-progress b {
		font-size: 10px;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.track-amounts {
		display: grid;
		grid-template-columns: 20fr 50fr 30fr;
		gap: 8px;
		margin-top: 7px;
		font-size: 10px;
		color: var(--muted);
	}
	.track-amounts b {
		font-weight: 550;
		color: var(--text);
		margin-right: 3px;
	}
	.earn-track {
		margin: 14px 0;
		padding: 20px 20px 16px;
	}
	.earn-track > header {
		display: flex;
		align-items: flex-start;
		gap: 13px;
	}
	.step {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: 23px;
		height: 23px;
		border: 1px solid var(--border);
		border-radius: 50%;
		background: var(--surface-2);
		font-size: 11px;
		font-weight: 550;
	}
	.earn-track > header > div:first-of-type {
		flex: 1;
		min-width: 0;
	}
	.earn-track h2 {
		font-size: 16px;
		letter-spacing: -0.015em;
		margin: 0 0 5px;
		line-height: 1.4;
	}
	.earn-track h2 .pill {
		vertical-align: 2px;
		margin-left: 5px;
		font-size: 9px;
	}
	.earn-track header p {
		font-size: 11.5px;
		color: var(--muted);
		margin: 0;
		line-height: 1.6;
	}
	.track-value {
		text-align: right;
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: none;
	}
	.track-value b {
		font-size: 20px;
		font-weight: 650;
		line-height: 1.2;
	}
	.track-value small {
		font-size: 10px;
		color: var(--muted);
	}
	.track-progress {
		margin-top: 20px;
		height: 3px;
	}
	.earn-rows {
		margin-top: 10px;
	}
	.earn-row {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 41px;
		border-bottom: 1px solid var(--border);
		font-size: 12px;
	}
	.earn-row:last-child {
		border-bottom: 0;
	}
	.earn-row:hover:not(.unavailable) {
		background: var(--surface-2);
	}
	.row-label {
		flex: 1;
		min-width: 0;
	}
	.row-status {
		font-size: 10px;
		color: var(--muted);
		width: 73px;
		text-align: right;
		white-space: nowrap;
	}
	.completion {
		display: flex;
		color: var(--faint);
	}
	.completion.done {
		background: var(--green-bg);
		color: var(--green);
		width: 15px;
		height: 15px;
		border-radius: 50%;
		align-items: center;
		justify-content: center;
	}
	.earn-row.unavailable > :global(svg) {
		color: var(--faint);
	}
	.track-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 550;
		margin-top: 15px;
	}
	.track-link:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	h2 {
		font-size: 21px;
		margin-top: 30px;
	}
	.how-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.how-grid > div {
		display: flex;
		gap: 9px;
		padding: 14px 12px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 10px;
	}
	.how-grid .step {
		width: 20px;
		height: 20px;
		font-size: 10px;
	}
	.how-grid h3 {
		font-size: 11px;
		margin: 1px 0 6px;
		letter-spacing: 0;
	}
	.how-grid p {
		font-size: 11px;
		color: var(--muted);
		line-height: 1.65;
		margin: 0;
	}
	.learning-note {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 18px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface-2);
	}
	.learning-note > :global(svg) {
		margin-top: 2px;
		color: var(--muted);
	}
	.learning-note strong {
		font-size: 12px;
		font-weight: 550;
	}
	.learning-note p {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.8;
		margin: 8px 0 0;
	}
	.keep-learning {
		padding-left: 18px;
		font-size: 13px;
		line-height: 2;
	}
	.keep-learning a {
		text-decoration: underline;
		text-underline-offset: 4px;
		text-decoration-color: var(--border);
	}
	@media (max-width: 650px) {
		.summary-top {
			flex-wrap: wrap;
		}
		.summary-top > .button {
			margin-left: 59px;
		}
		.summary-top > div {
			min-width: 180px;
		}
		.summary-top h2 {
			font-size: 21px;
		}
		.earn-summary {
			padding: 19px;
		}
		.earn-track {
			padding: 17px 14px;
		}
		.earn-row {
			font-size: 11px;
			gap: 8px;
		}
		.row-status {
			font-size: 9px;
			width: 61px;
		}
		.how-grid {
			grid-template-columns: 1fr;
		}
		.track-value b {
			font-size: 18px;
		}
		.earn-track h2 {
			font-size: 14px;
		}
		.earn-track header p {
			font-size: 11px;
		}
	}
	@media (max-width: 400px) {
		.earn-row .pill {
			font-size: 9px;
			padding: 2px 5px;
		}
		.row-status {
			width: 52px;
			font-size: 8.5px;
		}
		.earn-row {
			gap: 6px;
		}
		.summary-top > div {
			min-width: 155px;
		}
		.track-amounts {
			font-size: 9px;
		}
	}
</style>
