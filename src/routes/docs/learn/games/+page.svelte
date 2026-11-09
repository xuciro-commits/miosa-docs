<script lang="ts">
	import {
		ArrowRight,
		Check,
		CircleDollarSign,
		Box,
		Globe,
		Rocket,
		ArrowDown,
		Gamepad2
	} from '@lucide/svelte';
	import { units } from '#lib/content/learning.js';
	import { learning, progress } from '#lib/learning.svelte.js';
	import Icon from '#lib/components/Icon.svelte';
</script>

<section class="games-overview panel">
	<div class="lab-illustration" aria-label="A sandbox becomes a deployment">
		<span><Box size={25} /><small>Sandbox</small></span><ArrowRight size={17} /><span
			><Rocket size={25} /><small>Deployment</small></span
		><ArrowRight size={17} /><span><Globe size={25} /><small>Your product</small></span>
	</div>
	<div class="overview-bottom">
		<p>Real ideas. Small experiments.<br /><b>Every unit is open from the start.</b></p>
		<span class="pill reward">{progress.games} / 7 completed</span>
	</div>
	<div class="progress-track"><span style={`width:${(progress.games / 7) * 100}%`}></span></div>
</section>
<h2 id="your-learning-path">Your learning path</h2>
<div class="unit-list">
	{#each units as unit, i}{@const done = learning.labs.includes(unit.id)}<a
			class="unit panel"
			href={`/docs/learn/labs/${unit.id}`}
			><div class="unit-icon" class:complete={done}>
				{#if done}<Check size={22} />{:else}<Icon name={unit.icon} size={23} />{/if}
			</div>
			<div class="unit-copy">
				<small>Unit {i + 1}</small>
				<h3>{unit.title}</h3>
				<p>{unit.subtitle}</p>
				<span class="pill reward"><CircleDollarSign size={10} />+${unit.reward}</span
				>{#if done}<span class="completed-label">Completed</span>{/if}
			</div>
			<ArrowRight size={16} /></a
		>{/each}
</div>
<h2 id="learn-at-your-own-pace">Learn at your own pace</h2>
<p class="games-note">
	There is no timer and nothing to install. Try an action, observe the result, and repeat an
	experiment. Completing a lab saves its progress in this browser. Practice credits are
	illustrative.
</p>

<style>
	.games-overview {
		padding: 25px;
		margin: 25px 0 33px;
		background: var(--surface-2);
	}
	.lab-illustration {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 25px;
		padding: 17px 0 30px;
	}
	.lab-illustration > span {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-direction: column;
		color: var(--text);
	}
	.lab-illustration small {
		font-size: 10px;
		color: var(--muted);
	}
	.lab-illustration > :global(svg) {
		color: var(--faint);
	}
	.overview-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		border-top: 1px solid var(--border);
		padding-top: 18px;
		margin-bottom: 15px;
	}
	.overview-bottom p {
		font-size: 12px;
		color: var(--muted);
		margin: 0;
		line-height: 1.8;
	}
	.overview-bottom b {
		font-weight: 500;
		color: var(--text);
	}
	.unit-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.unit {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 20px;
	}
	.unit:hover {
		border-color: var(--faint);
		background: var(--surface-2);
	}
	.unit-icon {
		display: grid;
		place-items: center;
		width: 49px;
		height: 49px;
		border: 1px solid var(--border);
		border-radius: 13px;
		background: var(--surface-2);
		color: var(--muted);
		flex: none;
	}
	.unit-icon.complete {
		background: var(--green-bg);
		color: var(--green);
		border-color: transparent;
	}
	.unit-copy {
		flex: 1;
	}
	.unit-copy > small {
		font-size: 9px;
		color: var(--muted);
	}
	.unit h3 {
		font-size: 17px;
		margin: 3px 0 5px;
	}
	.unit p {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.7;
		margin: 0 0 10px;
	}
	.completed-label {
		margin-left: 8px;
		font-size: 10px;
		color: var(--green);
	}
	.games-note {
		font-size: 14px;
		color: var(--muted);
		line-height: 1.9;
	}
	@media (max-width: 500px) {
		.lab-illustration {
			gap: 15px;
		}
		.unit {
			padding: 17px 14px;
			gap: 13px;
		}
		.unit-icon {
			width: 40px;
			height: 40px;
		}
		.unit h3 {
			font-size: 15px;
		}
		.overview-bottom {
			align-items: flex-start;
		}
		.games-overview {
			padding: 22px 17px;
		}
	}
</style>
