<script lang="ts">
	import { ArrowRight, Check, X, RotateCcw, Trophy, BookOpen } from '@lucide/svelte';
	import { saveProgress } from '#lib/learning.svelte.js';
	let { data } = $props();
	let position = $state(0);
	let selected = $state(-1);
	let checked = $state(false);
	let correct = $state(0);
	let finished = $state(false);
	const question = $derived(data.questions[position]);
	const passMark = $derived(Math.ceil(data.questions.length * 0.75));
	function check() {
		checked = true;
		if (selected === question.correct) correct++;
	}
	function next() {
		if (position === data.questions.length - 1) {
			finished = true;
			if (correct >= passMark) saveProgress('passed', data.category.id);
		} else {
			position++;
			selected = -1;
			checked = false;
		}
	}
	function restart() {
		position = 0;
		selected = -1;
		checked = false;
		correct = 0;
		finished = false;
	}
	$effect(() => {
		data.category.id;
		restart();
	});
</script>

<section class="check-shell panel">
	<header>
		<span class="pill">{data.category.name}</span><small
			>{finished
				? 'Practice complete'
				: `Question ${position + 1} of ${data.questions.length}`}</small
		>
	</header>
	<div class="progress-track">
		<span style={`width:${finished ? 100 : (position / data.questions.length) * 100}%`}></span>
	</div>
	{#if finished}<div class="check-result">
			{#if correct >= passMark}<Trophy size={40} strokeWidth={1.4} />
				<h2 id="your-result">You have got the idea.</h2>
				<p>{correct} of {data.questions.length} correct. This category is now marked complete.</p>
				<span class="pill reward">+$2.50 practice credits</span>{:else}<BookOpen
					size={40}
					strokeWidth={1.4}
				/>
				<h2 id="your-result">A little more practice.</h2>
				<p>
					{correct} of {data.questions.length} correct. Review the words and try again whenever you are
					ready.
				</p>{/if}
			<div class="result-actions">
				<a href="/docs/learn/earn" class="button primary"
					>See your progress<ArrowRight size={13} /></a
				><button class="button" onclick={restart}><RotateCcw size={13} />Try again</button><a
					href={`/docs/glossary?category=${data.category.id}`}
					class="text-link">Review these words</a
				>
			</div>
		</div>{:else}<div class="question">
			<h2 id="the-question">What is a {question.word.toLowerCase()}?</h2>
			<p>Choose the description that fits best.</p>
			<div class="choices">
				{#each question.choices as choice, i}<button
						disabled={checked}
						class:selected={selected === i}
						class:correct={checked && i === question.correct}
						class:incorrect={checked && selected === i && i !== question.correct}
						aria-pressed={selected === i}
						onclick={() => (selected = i)}
						><span>{String.fromCharCode(65 + i)}</span>
						<div>{choice}</div>
						{#if checked && i === question.correct}<Check
								size={17}
							/>{:else if checked && selected === i}<X size={17} />{/if}</button
					>{/each}
			</div>
			{#if checked}<div class="explanation" role="status">
					<b>{selected === question.correct ? 'That is right.' : 'Here is the distinction.'}</b>
					<p>{question.definition}</p>
					<small>{question.example}</small>
				</div>{/if}
			<div class="question-footer">
				<small>No timer. No pressure. This is practice.</small>{#if checked}<button
						class="button primary"
						onclick={next}
						>{position === data.questions.length - 1
							? 'See the result'
							: 'Next question'}<ArrowRight size={13} /></button
					>{:else}<button class="button primary" disabled={selected < 0} onclick={check}
						>Check answer<ArrowRight size={13} /></button
					>{/if}
			</div>
		</div>{/if}
</section>
<p class="practice-disclaimer">
	Progress is stored in this browser. These checks do not award real MIOSA credits.
</p>

<style>
	.check-shell {
		margin: 28px 0 15px;
		overflow: hidden;
	}
	.check-shell > header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 17px 21px;
	}
	.check-shell > header small {
		font-size: 10px;
		color: var(--muted);
	}
	.check-shell > .progress-track {
		border-radius: 0;
		height: 3px;
	}
	.question {
		padding: 25px;
	}
	.question h2 {
		margin: 0 0 10px;
		font-size: 25px;
	}
	.question > p {
		color: var(--muted);
		font-size: 13px;
	}
	.choices {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 24px 0;
	}
	.choices button {
		display: flex;
		align-items: center;
		gap: 13px;
		text-align: left;
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 15px;
		font-size: 13px;
		line-height: 1.7;
	}
	.choices button > span {
		display: grid;
		place-items: center;
		flex: none;
		width: 25px;
		height: 25px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 10px;
		color: var(--muted);
	}
	.choices button > div {
		flex: 1;
	}
	.choices button:hover:not(:disabled),
	.choices button.selected {
		border-color: var(--faint);
		background: var(--surface-2);
	}
	.choices button:disabled {
		opacity: 1;
		cursor: default;
	}
	.choices button.correct {
		border-color: var(--green);
		background: var(--green-bg);
	}
	.choices button.incorrect {
		border-color: #bd6666;
	}
	.explanation {
		padding: 16px;
		background: var(--surface-2);
		border-radius: 9px;
		font-size: 12px;
		line-height: 1.8;
	}
	.explanation b {
		font-weight: 550;
	}
	.explanation p {
		margin: 5px 0 8px;
	}
	.explanation small {
		color: var(--muted);
		font-size: 11px;
	}
	.question-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		margin-top: 25px;
	}
	.question-footer > small {
		font-size: 10px;
		color: var(--muted);
	}
	.check-result {
		text-align: center;
		padding: 40px 25px;
	}
	.check-result > :global(svg) {
		color: var(--green);
	}
	.check-result h2 {
		margin: 20px 0 12px;
		font-size: 28px;
	}
	.check-result p {
		font-size: 13px;
		color: var(--muted);
		line-height: 1.8;
	}
	.result-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 27px;
	}
	.practice-disclaimer {
		font-size: 11px;
		color: var(--muted);
		line-height: 1.8;
	}
	@media (max-width: 500px) {
		.question {
			padding: 20px 16px;
		}
		.question-footer {
			flex-direction: column;
			align-items: flex-start;
		}
		.question h2 {
			font-size: 22px;
		}
	}
</style>
