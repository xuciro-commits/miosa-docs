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
		entering = $state(0),
		stackX = $state(0),
		stackTilt = $state(0);
	let start = 0,
		startY = 0,
		changedAt = 0;
	const current = $derived(factCards[index]);
	function choose(next: number, direction = 1) {
		index = (next + factCards.length) % factCards.length;
		changedAt = Date.now();
		drag = 0;
		entering = direction >= 0 ? 1 : -1;
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
		if (Math.abs(distance) > 45) choose(index + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1);
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
				!document.hidden &&
				Date.now() - changedAt > 6000
			)
				index = (index + 1) % factCards.length;
		}, 6000);
		return () => clearInterval(timer);
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
			class:entering={entering !== 0}
			style={`transform:translateX(${drag}px) rotate(${-1 + drag * 0.035}deg); --deck-enter-x:${entering >= 0 ? 34 : -34}px`}
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
			onanimationend={(event) => {
				if (event.animationName === 'deck-enter') entering = 0;
			}}
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
	.one {
		background: linear-gradient(145deg, #dcd7f5, #bdb4ec);
		transform: translate(17px, -21px) rotate(5deg);
		animation: deck-drift-one 7.5s ease-in-out infinite;
	}
	.two {
		background: linear-gradient(145deg, #f4f0e7, #dedbd5);
		transform: translate(2px, -13px) rotate(-3deg);
		animation: deck-drift-two 6s ease-in-out infinite;
	}
	@keyframes deck-drift-one {
		0%,
		100% {
			transform: translate(17px, -21px) rotate(5deg);
		}
		50% {
			transform: translate(22px, -25px) rotate(7deg);
		}
	}
	@keyframes deck-drift-two {
		0%,
		100% {
			transform: translate(2px, -13px) rotate(-3deg);
		}
		50% {
			transform: translate(-4px, -16px) rotate(-5deg);
		}
	}
	.deck-front.entering {
		animation: deck-enter 0.34s cubic-bezier(0.22, 1, 0.36, 1);
	}
	@keyframes deck-enter {
		from {
			opacity: 0.35;
			transform: translateX(calc(var(--deck-enter-x, 34px) * -1)) rotate(-3deg);
		}
		to {
			opacity: 1;
			transform: translateX(0) rotate(-1deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.one,
		.two,
		.deck-front.entering {
			animation: none;
		}
		.deck-stack {
			transition: none;
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
		transition: transform 0.3s;
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
