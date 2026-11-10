<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { factCards } from '#lib/content/landing.js';
	import { i18n, t } from '#lib/i18n.svelte.js';
	import { messages } from '#lib/i18n/messages/index.js';
	import FactCard from './FactCard.svelte';
	/** Exact-source lookup for copy supplied by content data. */
	const tr = (value: string) => (i18n.locale === 'zh' ? ((messages.zh as Record<string, string>)[value] ?? value) : value);
	let index = $state(0),
		drag = $state(0),
		held = $state(false),
		focused = $state(false),
		dragging = $state(false),
		phase = $state<'idle' | 'leaving' | 'entering'>('idle'),
		stackX = $state(0),
		stackTilt = $state(0);
	let start = 0,
		startY = 0,
		changedAt = 0;
	const current = $derived(factCards[index]);
	let swapTimer: ReturnType<typeof setTimeout>;

	/** Reference behaviour: current card leaves, the next one rises from the stack. */
	function choose(next: number) {
		if (phase === 'leaving') return;
		const target = (next + factCards.length) % factCards.length;
		if (target === index) return;
		changedAt = Date.now();
		drag = 0;
		stackX = 0;
		stackTilt = 0;
		phase = 'leaving';
		swapTimer = setTimeout(() => {
			index = target;
			phase = 'entering';
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					phase = 'idle';
				})
			);
		}, 300);
	}
	function release(event: PointerEvent, cancel = false) {
		if (!dragging) return;
		const distance = drag;
		dragging = false;
		event.currentTarget instanceof HTMLElement &&
			event.currentTarget.releasePointerCapture(event.pointerId);
		drag = 0;
		stackX = 0;
		stackTilt = 0;
		if (cancel) return;
		if (Math.abs(distance) > 45) choose(index + (distance < 0 ? 1 : -1));
		else if (Math.abs(distance) < 6) goto(current.href);
	}
	onMount(() => {
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const timer = setInterval(() => {
			if (
				!motion.matches &&
				!held &&
				!focused &&
				!dragging &&
				phase === 'idle' &&
				!document.hidden &&
				Date.now() - changedAt > 6000
			)
				index = (index + 1) % factCards.length;
		}, 6000);
		return () => {
			clearInterval(timer);
			clearTimeout(swapTimer);
		};
	});
</script>

<div
	class="deck"
	role="group"
	aria-label={tr('Featured documentation cards')}
	onmouseenter={() => (held = true)}
	onmouseleave={() => (held = false)}
	onfocusin={() => (focused = true)}
	onfocusout={(event) => {
		focused = event.currentTarget.contains(event.relatedTarget as Node);
	}}
>
	<div
		class="deck-stack"
		style={`transform:translate(${stackX}px, ${Math.abs(stackX) * 0.06}px) rotate(${stackTilt}deg)`}
	>
		<span class="back-card one"></span><span class="back-card two"></span><button
			class="deck-front"
			class:dragging
			class:leaving={phase === 'leaving'}
			class:rising={phase === 'entering'}
			style={`transform:translateX(${drag}px) rotate(${-1 + drag * 0.035}deg)`}
			aria-label={`${tr(current.title).replace('\n', ' ')}. ${tr(current.link)}`}
			onpointerdown={(event) => {
				if (event.button !== 0) return;
				start = event.clientX;
				startY = event.clientY;
				dragging = true;
				event.currentTarget.setPointerCapture(event.pointerId);
			}}
			onpointermove={(event) => {
				if (!dragging) return;
				drag = event.clientX - start;
				stackX = Math.max(-26, Math.min(26, drag * 0.22));
				stackTilt = Math.max(-4, Math.min(4, (event.clientY - startY) * 0.02 + drag * 0.02));
			}}
			onpointerup={(event) => release(event)}
			onpointercancel={(event) => release(event, true)}
			onclick={(event) => {
				if (event.detail === 0) goto(current.href);
			}}
			onkeydown={(event) => {
				if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
					event.preventDefault();
					choose(index + (event.key === 'ArrowRight' ? 1 : -1));
				} else if (event.key === 'Home') {
					event.preventDefault();
					choose(0);
				} else if (event.key === 'End') {
					event.preventDefault();
					choose(factCards.length - 1);
				}
			}}><FactCard card={current} /></button
		>
	</div>
	<div class="deck-dots" aria-label={tr('Documentation cards')}>
		{#each factCards as card, i}<button
				aria-label={t('learning.cardDeck.showCard', { index: i + 1, tag: tr(card.tag) })}
				aria-pressed={index === i}
				onclick={() => choose(i)}
			></button>{/each}
	</div>
	<p class="deck-hint">{tr('Drag or use ← → · click to open')}</p>
</div>

<style>
	.deck {
		--sh-back:
			0 0 0 1px rgb(0 0 0 / 6%), 0 8px 18px -8px rgb(0 0 0 / 28%), 0 2px 4px rgb(0 0 0 / 8%);
		--sh-front:
			0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 6%), 0 12px 24px -8px rgb(0 0 0 / 18%),
			0 32px 64px -24px rgb(0 0 0 / 28%);
		width: 100%;
		max-width: 26.25rem;
		padding: 26px 1.4rem 0;
	}
	.deck-stack {
		position: relative;
		max-width: 290px;
		margin: 0;
		transition:
			transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
			filter 0.3s ease;
		will-change: transform;
	}
	.back-card {
		position: absolute;
		inset: 0;
		border-radius: 17px;
		box-shadow: var(--sh-back);
	}
	/* Stack geometry from the reference deck: the next card peeks up and to the
	   right, the one behind it sits further out and mostly hidden. */
	.one {
		background: linear-gradient(145deg, #dcd7f5, #bdb4ec);
		transform: translate(26px, -14px) rotate(-2.6deg) scale(0.96);
		opacity: 0.9;
	}
	.two {
		background: linear-gradient(145deg, #f4f0e7, #dedbd5);
		transform: translate(38px, -48px) rotate(3.6deg) scale(0.88);
		opacity: 0.45;
	}
	.deck-front.leaving {
		transform: translate(-42px, 14px) rotate(2.8deg) scale(0.88) !important;
		opacity: 0;
	}
	.deck-front.rising {
		transform: translate(26px, -14px) rotate(-2.6deg) scale(0.96) !important;
		opacity: 0.85;
		transition: none !important;
	}
	@media (prefers-reduced-motion: reduce) {
		.deck-stack,
		.deck-front {
			transition: none !important;
		}
	}
	.deck-front {
		display: block;
		position: relative;
		width: 100%;
		padding: 0;
		text-align: left;
		touch-action: pan-y;
		cursor: grab;
		transition:
			transform 0.72s cubic-bezier(0.22, 0.8, 0.24, 1),
			opacity 0.52s;
	}
	.deck-front.dragging {
		transition: none;
		cursor: grabbing;
		touch-action: none;
	}
	.deck-dots {
		display: flex;
		justify-content: center;
		gap: 15px;
		margin-top: 18px;
	}
	.deck-dots button {
		width: 6px;
		height: 6px;
		border-radius: 99px;
		background: var(--faint);
		position: relative;
	}
	.deck-dots button:after {
		content: '';
		position: absolute;
		inset: -7px;
	}
	.deck-dots button[aria-pressed='true'] {
		width: 15px;
		background: var(--text);
	}
	.deck-front :global(.fact-card) {
		border-color: #ffffff3d;
		box-shadow: var(--sh-front);
	}
	:global([data-theme='dark']) .deck,
	:global([data-theme='glass-dark']) .deck {
		--sh-back:
			0 0 0 1px rgb(255 255 255 / 8%), 0 10px 22px -8px rgb(0 0 0 / 70%), 0 2px 5px rgb(0 0 0 / 40%);
		--sh-front:
			0 0 0 1px rgb(255 255 255 / 10%), 0 2px 4px rgb(0 0 0 / 30%),
			0 14px 28px -8px rgb(0 0 0 / 55%), 0 36px 72px -24px rgb(0 0 0 / 80%);
	}
	.deck-hint {
		text-align: center !important;
		color: var(--muted);
		font-size: 11px !important;
		margin: 7px 0 !important;
	}
	@media (max-width: 700px) {
		.deck {
			margin: 25px auto 0;
			max-width: 330px;
		}
	}
</style>
