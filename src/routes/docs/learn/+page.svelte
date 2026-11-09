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
	import { progress } from '#lib/learning.svelte.js';
	const paths = [
		{
			title: 'Learn the words',
			text: 'A vocabulary you can use. Explore plain-language definitions, practice the ideas, and check each category.',
			href: '/docs/glossary',
			icon: BookOpen,
			amount: 20
		},
		{
			title: 'Play the games',
			text: 'Learn by changing things. Seven hands-on labs make resource lifecycles, publishing and customer boundaries visible.',
			href: '/docs/learn/games',
			icon: Gamepad2,
			amount: 50
		},
		{
			title: 'Watch the videos',
			text: 'Short, focused lessons for the ideas behind the platform. This track will open when real lessons are available.',
			href: '/docs/learn/videos',
			icon: Play,
			amount: 30
		},
		{
			title: 'Build something',
			text: 'Put the ideas to work. Follow a guide from a first sandbox to a tested application and a published version.',
			href: '/docs/quickstart',
			icon: Rocket,
			amount: 0
		}
	];
</script>

<p class="intro">
	You do not have to understand everything at once. Start with a word, try a small experiment, and
	connect the pieces as you go.
</p>
<section class="how panel">
	<h2 id="how-earning-works">How learning works</h2>
	<ol>
		<li>
			<span>1</span>
			<p><b>Read or play.</b> Every learning path is open from the start.</p>
		</li>
		<li>
			<span>2</span>
			<p><b>Practice freely.</b> Repeat an exercise until the idea feels familiar.</p>
		</li>
		<li>
			<span>3</span>
			<p>
				<b>Check your understanding.</b> Your completed checks and labs stay saved in this browser.
			</p>
		</li>
	</ol>
	<a href="/docs/learn/earn" class="button">See your progress<ArrowRight size={12} /></a>
</section>
<section class="progress-card panel">
	<div>
		<CircleDollarSign size={23} />
		<h2 id="your-progress">One workspace for<br />everything you learn</h2>
		<a href="/docs/learn/earn" class="button primary">Keep learning<ArrowRight size={13} /></a>
	</div>
	<p>
		Words +$20, games +$50, videos +$30 when available. Practice credits have no monetary value.
	</p>
	<div class="progress-track"><span style={`width:${progress.credits}%`}></span></div>
	<small>${progress.credits} / $100 practice credits</small>
</section>
<div class="learning-paths">
	{#each paths as path, i}<a class="path panel" href={path.href}
			><span class="path-number">{i + 1}</span>
			<div>
				<h2>
					{path.title}{#if path.amount}<span class="pill">Up to · ${path.amount}</span>{/if}
				</h2>
				<p>{path.text}</p>
				{#if i === 0 || i === 1}<div class="path-progress">
						<div class="progress-track">
							<span
								style={`width:${i === 0 ? (progress.words / 8) * 100 : (progress.games / 7) * 100}%`}
							></span>
						</div>
						<small
							>{i === 0 ? `${progress.words} of 8 categories` : `${progress.games} of 7 units`} completed</small
						>
					</div>{/if}
			</div>
			<ArrowRight size={15} /></a
		>{/each}
</div>
<h2 id="prefer-to-read">Prefer to read? Five steps from idea to production</h2>
<div class="reading-path panel">
	{#each [['The product model', 'product-model'], ['Choose your sandbox', 'sandboxes'], ['Build your first app', 'quickstart'], ['Publish a version', 'deployments'], ['Connect your data', 'data']] as [title, slug], i}<a
			href={`/docs/${slug}`}><span>{i + 1}</span><b>{title}</b><ArrowRight size={13} /></a
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
