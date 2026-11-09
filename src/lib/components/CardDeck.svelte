<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { factCards } from '#lib/content/landing.js';
	import FactCard from './FactCard.svelte';
	let index = $state(0),
		drag = $state(0),
		held = $state(false),
		focused = $state(false),
		dragging = $state(false);
	let start = 0,
		changedAt = 0;
	const current = $derived(factCards[index]);
	function choose(next: number) {
		index = (next + factCards.length) % factCards.length;
		changedAt = Date.now();
		drag = 0;
	}
	function release(event: PointerEvent, cancel = false) {
		if (!dragging) return;
		const distance = drag;
		dragging = false;
		event.currentTarget instanceof HTMLElement &&
			event.currentTarget.releasePointerCapture(event.pointerId);
		drag = 0;
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
	aria-label="Featured documentation cards"
	onmouseenter={() => (held = true)}
	onmouseleave={() => (held = false)}
	onfocusin={() => (focused = true)}
	onfocusout={(event) => {
		focused = event.currentTarget.contains(event.relatedTarget as Node);
	}}
>
	<div class="deck-stack">
		<span class="back-card one"></span><span class="back-card two"></span><button
			class="deck-front"
			class:dragging
			style={`transform:translateX(${drag}px) rotate(${-1 + drag * 0.035}deg)`}
			aria-label={`${current.title.replace('\n', ' ')}. Open ${current.link}`}
			onpointerdown={(event) => {
				if (event.button !== 0) return;
				start = event.clientX;
				dragging = true;
				event.currentTarget.setPointerCapture(event.pointerId);
			}}
			onpointermove={(event) => {
				if (dragging) drag = event.clientX - start;
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
	<div class="deck-dots" aria-label="Documentation cards">
		{#each factCards as card, i}<button
				aria-label={`Show card ${i + 1}: ${card.tag}`}
				aria-pressed={index === i}
				onclick={() => choose(i)}
			></button>{/each}
	</div>
	<p class="deck-hint">Drag or use ← → · click to open</p>
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
	}
	.two {
		background: linear-gradient(145deg, #f4f0e7, #dedbd5);
		transform: translate(2px, -13px) rotate(-3deg);
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
