<script lang="ts">
	import { Play, ArrowRight, BookOpen, Gamepad2 } from '@lucide/svelte';
	import { videos } from '#lib/content/learning.js';
</script>

<section class="video-notice panel">
	<div class="play-symbol"><Play size={27} strokeWidth={1.3} /></div>
	<span class="pill">Not open yet</span>
	<h2 id="lessons-in-the-making">A clearer picture, one lesson at a time.</h2>
	<p>
		This track is reserved for real video lessons. There are no placeholder videos or pretend watch
		completions.
	</p>
	<div>
		<a href="/docs/glossary" class="button"><BookOpen size={13} />Learn the words</a><a
			href="/docs/learn/games"
			class="button primary"><Gamepad2 size={13} />Try a lab</a
		>
	</div>
</section>
<h2 id="the-lesson-plan">The lesson plan</h2>
<div class="lesson-list panel">
	{#each videos as video, i}<div>
			<span>{String(i + 1).padStart(2, '0')}</span><Play size={13} /><b>{video}</b><small
				>Coming later</small
			>
		</div>{/each}
</div>

<style>
	.video-notice {
		text-align: center;
		background: var(--surface-2);
		padding: 36px 25px;
		margin: 25px 0 30px;
	}
	.play-symbol {
		display: grid;
		place-items: center;
		width: 65px;
		height: 65px;
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 20px;
		margin: 0 auto 18px;
		color: var(--muted);
	}
	.video-notice h2 {
		font-size: 25px;
		margin: 18px 0 14px;
	}
	.video-notice p {
		font-size: 13px;
		color: var(--muted);
		max-width: 400px;
		margin: 0 auto 23px;
		line-height: 1.8;
	}
	.video-notice > div:last-child {
		display: flex;
		justify-content: center;
		gap: 10px;
	}
	.lesson-list > div {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 15px 19px;
		border-bottom: 1px solid var(--border);
		font-size: 12px;
	}
	.lesson-list > div:last-child {
		border: 0;
	}
	.lesson-list > div > span {
		font-size: 10px;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	.lesson-list b {
		font-weight: 500;
		flex: 1;
	}
	.lesson-list small {
		font-size: 10px;
		color: var(--muted);
	}
</style>
