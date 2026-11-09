<script lang="ts">
	import { page } from '$app/state';
	import { Search, ArrowRight, ChevronRight, RotateCcw, Check, BookOpen, X } from '@lucide/svelte';
	import { categories, terms } from '#lib/content/learning.js';
	import {
		learning,
		saveProgress,
		categoryName,
		categoryDescription,
		termWord,
		termDefinition,
		termExample
	} from '#lib/learning.svelte.js';
	import { t } from '#lib/i18n.svelte.js';
	let category = $state('core');
	let query = $state('');
	let practicing = $state(false);
	let card = $state(0);
	let revealed = $state(false);
	let finished = $state(false);
	$effect(() => {
		const requested = page.url.searchParams.get('category');
		if (requested && categories.some((c) => c.id === requested)) category = requested;
	});
	const current = $derived(categories.find((c) => c.id === category)!);
	const localizedTerms = $derived(
		terms.map((term) => ({
			...term,
			word: termWord(term),
			definition: termDefinition(term),
			example: termExample(term),
			searchText: `${term.word} ${term.definition} ${termWord(term)} ${termDefinition(term)}`.toLowerCase()
		}))
	);
	const categoryTerms = $derived(localizedTerms.filter((term) => term.category === category));
	const filtered = $derived(
		categoryTerms.filter((term) => term.searchText.includes(query.toLowerCase()))
	);
	function begin() {
		practicing = true;
		card = 0;
		revealed = false;
		finished = false;
	}
	function next() {
		if (card === categoryTerms.length - 1) {
			finished = true;
			saveProgress('practiced', category);
		} else {
			card++;
			revealed = false;
		}
	}
</script>

<div class="glossary-toolbar">
	<div class="term-search">
		<Search size={15} /><input
			bind:value={query}
			placeholder={t('learning.glossary.searchPlaceholder')}
			aria-label={t('learning.glossary.searchAria')}
		/>{#if query}<button onclick={() => (query = '')} aria-label={t('learning.glossary.clearSearchAria')}
				><X size={13} /></button
			>{/if}
	</div>
	<span>{t('learning.glossary.count', { words: terms.length, categories: categories.length })}</span>
</div>
<div class="category-tabs" aria-label={t('learning.glossary.categoriesAria')}>
	{#each categories as item}<button
			class:active={item.id === category}
			aria-pressed={item.id === category}
			onclick={() => {
				category = item.id;
				practicing = false;
				query = '';
			}}
			>{categoryName(item.id)}{#if learning.passed.includes(item.id)}<Check size={11} />{/if}</button
		>{/each}
</div>
<section class="category-heading">
	<div>
		<h2 id="the-words">{categoryName(current.id)}</h2>
		<p>{categoryDescription(current.id)}</p>
	</div>
	<button class="button primary" onclick={begin}
		><BookOpen size={13} />{t('learning.glossary.practiceButton')}</button
	>
</section>
{#if practicing}<section class="practice panel" aria-label={t('learning.glossary.practiceAria')}>
		<header>
			<span
				>{finished
					? t('learning.glossary.practiceComplete')
					: t('learning.glossary.cardProgress', {
							current: card + 1,
							total: categoryTerms.length
						})}</span
			><button
				class="icon-button"
				aria-label={t('learning.glossary.closeFlashcards')}
				onclick={() => (practicing = false)}><X size={15} /></button
			>
		</header>
		{#if finished}<div class="practice-finished">
				<Check size={30} />
				<h3>{t('learning.glossary.finishedTitle')}</h3>
				<p>{t('learning.glossary.finishedText')}</p>
				<a class="button primary" href={`/docs/learn/final/category/${category}`}
					>{t('learning.glossary.startCategoryCheck')}<ArrowRight size={13} /></a
				><button class="text-link" onclick={begin}
					><RotateCcw size={12} />{t('learning.common.practiceAgain')}</button
				>
			</div>{:else}<button
				class="flashcard"
				aria-label={revealed
					? t('learning.glossary.definitionShown')
					: t('learning.glossary.revealDefinition')}
				onclick={() => (revealed = !revealed)}
				><small
					>{revealed
						? t('learning.glossary.sideDefinition')
						: t('learning.glossary.sideQuestion')}</small
				>
				<h3>{categoryTerms[card].word}</h3>
				{#if revealed}<p>{categoryTerms[card].definition}</p>
					<em>{categoryTerms[card].example}</em>{:else}<span
						>{t('learning.glossary.clickToTurn')}</span
					>{/if}</button
			>
			<div class="practice-controls">
				<div class="practice-dots">
					{#each categoryTerms as _, i}<span class:done={i <= card}></span>{/each}
				</div>
				<button class="button" onclick={next} disabled={!revealed}
					>{card === categoryTerms.length - 1
						? t('learning.glossary.finishPractice')
						: t('learning.glossary.nextWord')}<ArrowRight size={13} /></button
				>
			</div>{/if}
	</section>{/if}
<div class="terms">
	{#each filtered as term}<details class="term panel">
			<summary><strong>{term.word}</strong><ChevronRight size={15} /></summary>
			<p>{term.definition}</p>
			<div class="term-example"><small>{t('learning.glossary.inPractice')}</small>{term.example}</div>
		</details>{/each}{#if !filtered.length}<div class="empty-state">
			<Search size={25} />
			<p>{t('learning.glossary.empty', { query })}</p>
			<button class="button" onclick={() => (query = '')}
				>{t('learning.glossary.clearSearch')}</button
			>
		</div>{/if}
</div>
<section class="category-check panel">
	<div>
		<span class="pill reward">{t('learning.glossary.reward')}</span>
		<h2 id="check-your-understanding">{t('learning.glossary.knowTitle')}</h2>
		<p>{t('learning.glossary.knowText')}</p>
	</div>
	<a class="button" href={`/docs/learn/final/category/${category}`}
		>{learning.passed.includes(category)
			? t('learning.common.practiceAgain')
			: t('learning.common.startCheck')}<ArrowRight size={13} /></a
	>
</section>

<style>
	.glossary-toolbar {
		display: flex;
		align-items: center;
		gap: 16px;
		margin: 27px 0 17px;
	}
	.term-search {
		display: flex;
		align-items: center;
		gap: 8px;
		border: 1px solid var(--border);
		border-radius: 9px;
		padding: 0 11px;
		height: 37px;
		flex: 1;
		color: var(--muted);
	}
	.term-search input {
		background: none;
		border: 0;
		outline: 0;
		min-width: 0;
		flex: 1;
		font-size: 12px;
	}
	.term-search button {
		padding: 0;
		display: flex;
	}
	.glossary-toolbar > span {
		color: var(--muted);
		font-size: 10px;
		white-space: nowrap;
	}
	.category-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 28px;
	}
	.category-tabs button {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 10px;
		border: 1px solid var(--border);
		border-radius: 99px;
		padding: 5px 10px;
		color: var(--muted);
	}
	.category-tabs button.active {
		background: var(--button);
		border-color: var(--button);
		color: var(--button-text);
	}
	.category-heading {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 21px;
	}
	.category-heading > div {
		flex: 1;
	}
	.category-heading h2 {
		font-size: 23px;
		margin: 0 0 7px;
	}
	.category-heading p {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.7;
		margin: 0;
	}
	.category-heading > .button {
		font-size: 10px;
		padding: 9px 12px;
	}
	.terms {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 13px;
	}
	.term {
		padding: 18px;
		background: var(--surface);
		align-self: start;
	}
	.term summary {
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		cursor: pointer;
		font-size: 15px;
	}
	.term summary::-webkit-details-marker {
		display: none;
	}
	.term summary strong {
		font-weight: 550;
	}
	.term summary > :global(svg) {
		color: var(--muted);
		transition: transform 0.15s;
	}
	.term[open] summary > :global(svg) {
		transform: rotate(90deg);
	}
	.term p {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
		margin: 12px 0 0;
	}
	.term:not([open]) p {
		display: block;
	}
	.term-example {
		border-top: 1px solid var(--border);
		margin-top: 16px;
		padding-top: 13px;
		color: var(--muted);
		font-size: 12px;
		line-height: 1.75;
	}
	.term-example small {
		display: block;
		font-size: 9px;
		font-weight: 550;
		color: var(--text);
		margin-bottom: 5px;
	}
	.category-check {
		margin-top: 30px;
		padding: 22px;
		display: flex;
		align-items: center;
		gap: 20px;
		background: var(--surface-2);
	}
	.category-check > div {
		flex: 1;
	}
	.category-check h2 {
		font-size: 18px;
		margin: 10px 0 6px;
	}
	.category-check p {
		font-size: 12px;
		color: var(--muted);
		margin: 0;
	}
	.practice {
		margin: 20px 0 28px;
		overflow: hidden;
		background: var(--surface-2);
	}
	.practice > header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 15px;
		border-bottom: 1px solid var(--border);
		font-size: 10px;
		color: var(--muted);
	}
	.flashcard {
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		min-height: 245px;
		width: 100%;
		padding: 25px;
		text-align: center;
	}
	.flashcard small {
		font-size: 10px;
		color: var(--muted);
	}
	.flashcard h3 {
		font-size: 27px;
		margin: 15px 0 18px;
	}
	.flashcard span {
		font-size: 10px;
		color: var(--muted);
	}
	.flashcard p {
		font-size: 14px;
		max-width: 400px;
		line-height: 1.8;
	}
	.flashcard em {
		font-size: 11px;
		color: var(--muted);
		font-style: normal;
	}
	.practice-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 15px;
	}
	.practice-dots {
		display: flex;
		gap: 5px;
	}
	.practice-dots span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--border);
	}
	.practice-dots span.done {
		background: var(--text);
	}
	.practice-finished {
		text-align: center;
		padding: 30px 20px;
	}
	.practice-finished > :global(svg) {
		color: var(--green);
	}
	.practice-finished h3 {
		font-size: 20px;
	}
	.practice-finished p {
		font-size: 13px;
		color: var(--muted);
	}
	.practice-finished > .text-link {
		display: flex;
		margin: 16px auto 0;
	}
	@media (max-width: 600px) {
		.terms {
			grid-template-columns: 1fr;
		}
		.glossary-toolbar > span {
			display: none;
		}
		.category-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: 14px;
		}
		.category-check {
			flex-direction: column;
			align-items: flex-start;
		}
		.category-tabs {
			gap: 5px;
		}
		.category-tabs button {
			padding: 5px 8px;
			font-size: 9px;
		}
	}
</style>
