<script lang="ts">
	import { onMount } from 'svelte';
	import { Dialog } from 'bits-ui';
	import { goto, replaceState } from '$app/navigation';
	import { ArrowRight, Pause, Play, Sparkles } from '@lucide/svelte';
	import SpaceScene from './SpaceScene.svelte';
	import FactCard from './FactCard.svelte';
	import { factCards } from '#lib/content/landing.js';
	let open = $state(false),
		paused = $state(false),
		flying = $state(false),
		hovered = $state(false),
		cardIndex = $state(0);
	let timer: ReturnType<typeof setTimeout>;
	let destination = '';
	function finish() {
		clearTimeout(timer);
		open = false;
		flying = false;
		try {
			localStorage.setItem('miosa:docs-entered', '1');
		} catch {
			try {
				sessionStorage.setItem('miosa:docs-entered', '1');
			} catch {
				/* Browsing can continue without persistence. */
			}
		}
		const url = new URL(location.href);
		if (url.searchParams.has('entrance')) {
			url.searchParams.delete('entrance');
			replaceState(url, {});
		}
		if (destination) {
			const href = destination;
			destination = '';
			goto(href);
		}
	}
	function enter(href = '') {
		if (flying) return;
		destination = href;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			finish();
			return;
		}
		flying = true;
		timer = setTimeout(finish, 950);
	}
	onMount(() => {
		let visited = false;
		try {
			visited = !!(
				localStorage.getItem('miosa:docs-entered') || sessionStorage.getItem('miosa:docs-entered')
			);
		} catch {
			/* Storage may be unavailable. */
		}
		open = !visited || new URLSearchParams(location.search).get('entrance') === '1';
		const replay = () => {
			destination = '';
			paused = false;
			flying = false;
			open = true;
		};
		window.addEventListener('miosa:docs-entrance-replay', replay);
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const cycle = setInterval(() => {
			if (open && !paused && !flying && !hovered && !document.hidden && !motion.matches)
				cardIndex = (cardIndex + 1) % factCards.length;
		}, 3000);
		return () => {
			clearTimeout(timer);
			clearInterval(cycle);
			window.removeEventListener('miosa:docs-entrance-replay', replay);
		};
	});
</script>

<Dialog.Root
	bind:open
	onOpenChange={(value) => {
		if (!value && open) finish();
	}}
	><Dialog.Portal
		><Dialog.Overlay class="entrance-overlay" /><Dialog.Content
			class={`docs-entrance${flying ? ' flight' : ''}`}
			onOpenAutoFocus={(event) => {
				event.preventDefault();
				requestAnimationFrame(() =>
					document.querySelector<HTMLButtonElement>('.enter-docs')?.focus()
				);
			}}
			onEscapeKeydown={(event) => {
				event.preventDefault();
				destination = '';
				finish();
			}}
			onInteractOutside={(event) => event.preventDefault()}
			onCloseAutoFocus={(event) => {
				event.preventDefault();
				document.getElementById('docs-landing-title')?.focus({ preventScroll: true });
			}}
			><div class="entrance-sky"><SpaceScene {paused} warp={flying} /></div>
			<div class="sky-toolbar">
				<span><img src="/brand/osa-orb.png" alt="" />MIOSA</span><button
					aria-label={paused ? 'Resume sky' : 'Pause sky'}
					aria-pressed={paused}
					onclick={() => (paused = !paused)}
					>{#if paused}<Play size={12} />{:else}<Pause size={12} />{/if}{paused
						? 'Resume sky'
						: 'Pause sky'}</button
				>
			</div>
			<div class="entrance-welcome">
				<p><Sparkles size={12} /> MIOSA DOCUMENTATION</p>
				<Dialog.Title class="entrance-title">Build on MIOSA</Dialog.Title><Dialog.Description
					class="entrance-description"
					>The infrastructure behind agent products.<br />Sandboxes, computers, and deployments.
					Yours to build on.</Dialog.Description
				><button class="enter-docs" onclick={() => enter()} aria-disabled={flying}
					>Enter documentation<ArrowRight size={15} /></button
				>
			</div>
			<div
				class="floating-cards"
				role="group"
				aria-label="Featured documentation"
				onmouseenter={() => (hovered = true)}
				onmouseleave={() => (hovered = false)}
				onfocusin={() => (hovered = true)}
				onfocusout={(event) =>
					(hovered = event.currentTarget.contains(event.relatedTarget as Node))}
			>
				{#each [0, 1, 3] as offset, i}<button
						class={`floating-card slot-${i}`}
						aria-label={factCards[(cardIndex + offset) % factCards.length].link}
						onclick={() => enter(factCards[(cardIndex + offset) % factCards.length].href)}
						><FactCard card={factCards[(cardIndex + offset) % factCards.length]} /></button
					>{/each}
			</div>
			<button
				class="skip-entrance"
				onclick={() => {
					destination = '';
					finish();
				}}
				aria-label="Skip the introduction (Escape)">Skip <kbd>Esc</kbd></button
			></Dialog.Content
		></Dialog.Portal
	></Dialog.Root
>

<style>
	:global(.entrance-overlay) {
		position: fixed;
		inset: 0;
		background: #080c15;
		z-index: 100;
	}
	:global(.docs-entrance) {
		position: fixed;
		inset: 0;
		background: #070b14;
		color: #f5f6fb;
		z-index: 101;
		overflow: hidden;
		outline: 0;
		isolation: isolate;
	}
	.entrance-sky {
		position: absolute;
		inset: 0;
		z-index: -1;
	}
	.sky-toolbar {
		position: absolute;
		top: 30px;
		left: 40px;
		right: 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		color: #a3a9b9;
	}
	.sky-toolbar > span {
		display: flex;
		align-items: center;
		gap: 10px;
		letter-spacing: 0.2em;
	}
	.sky-toolbar img {
		width: 23px;
		height: 23px;
	}
	.sky-toolbar button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border: 1px solid #ffffff22;
		border-radius: 99px;
		background: #ffffff08;
	}
	.entrance-welcome {
		position: absolute;
		left: 50%;
		top: 47%;
		transform: translate(-50%, -50%);
		text-align: center;
		z-index: 2;
		width: min(600px, 90vw);
		transition:
			transform 0.9s,
			opacity 0.65s;
	}
	.entrance-welcome > p {
		display: flex;
		justify-content: center;
		gap: 8px;
		align-items: center;
		font-family: 'Geist Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.15em;
		color: #aeb8d3;
	}
	.entrance-welcome :global(.entrance-title) {
		font-size: 64px;
		line-height: 1.1;
		font-weight: 550;
		letter-spacing: -0.055em;
		margin: 24px 0;
	}
	.entrance-welcome :global(.entrance-description) {
		color: #a3adc3;
		font-size: 15px;
		line-height: 1.8;
	}
	.enter-docs {
		display: inline-flex;
		gap: 15px;
		align-items: center;
		background: #edf0f6;
		color: #111621;
		border: 1px solid #fff;
		border-radius: 99px;
		padding: 13px 22px;
		margin-top: 22px;
		font-size: 12px;
		box-shadow: 0 0 35px #ffffff0b;
	}
	.enter-docs:hover {
		background: #fff;
		box-shadow: 0 0 40px #ffffff22;
	}
	.skip-entrance {
		position: absolute;
		bottom: 27px;
		right: 35px;
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 11px;
		color: #b4baca;
	}
	.skip-entrance kbd {
		border: 1px solid #ffffff30;
		padding: 2px 6px;
		border-radius: 4px;
		font-family: inherit;
		font-size: 10px;
	}
	.floating-card {
		position: absolute;
		width: 245px;
		text-align: left;
		transition:
			opacity 0.6s,
			transform 0.9s;
		transform: rotate(-8deg);
		z-index: 1;
		padding: 0;
		animation: float-in 0.7s both;
	}
	.floating-card :global(.fact-card) {
		height: 300px;
		padding: 20px;
	}
	.floating-card :global(.fact-card h3) {
		margin: 22px 0 10px;
	}
	.floating-card :global(.fact-card p) {
		margin: 10px 0 16px;
	}
	.slot-0 {
		left: 5%;
		top: 14%;
		transform: rotate(-8deg);
	}
	.slot-1 {
		right: 6%;
		top: 12%;
		transform: rotate(9deg);
	}
	.slot-2 {
		right: 13%;
		bottom: -45px;
		transform: rotate(-6deg);
	}
	:global(.docs-entrance.flight) .entrance-welcome {
		transform: translate(-50%, -50%) scale(1.2);
		opacity: 0;
	}
	:global(.docs-entrance.flight) .floating-card {
		transform: scale(1.8) translateY(100px);
		opacity: 0;
	}
	@keyframes float-in {
		from {
			opacity: 0;
			translate: 0 18px;
		}
		to {
			opacity: 1;
			translate: 0 0;
		}
	}
	@media (max-width: 1180px) {
		.floating-card {
			width: 200px;
			opacity: 0.85;
		}
		.slot-0 {
			left: -70px;
			top: 10%;
		}
		.slot-1 {
			right: -65px;
			top: 6%;
		}
		.slot-2 {
			right: 7%;
			bottom: -110px;
		}
		.entrance-welcome :global(.entrance-title) {
			font-size: 58px;
		}
	}
	@media (max-width: 600px) {
		.sky-toolbar {
			top: 22px;
			left: 22px;
			right: 22px;
		}
		.entrance-welcome {
			top: 46%;
		}
		.entrance-welcome :global(.entrance-title) {
			font-size: 43px;
			margin: 20px 0;
		}
		.entrance-welcome :global(.entrance-description) {
			font-size: 12px;
			line-height: 1.8;
		}
		.entrance-welcome > p {
			font-size: 8px;
		}
		.floating-card {
			width: 170px;
		}
		.floating-card :global(.fact-card) {
			height: 240px;
			padding: 16px;
		}
		.floating-card :global(.fact-card h3) {
			font-size: 13px;
			margin: 18px 0 6px;
		}
		.floating-card :global(.fact-card p) {
			font-size: 10px;
		}
		.floating-card :global(.fact-card pre) {
			font-size: 7px;
			padding: 8px;
		}
		.slot-0 {
			left: -40px;
			top: 70px;
			transform: rotate(-16deg);
			opacity: 0.75;
		}
		.slot-1 {
			display: none;
		}
		.slot-2 {
			right: -20px;
			bottom: -70px;
			transform: rotate(12deg);
		}
		.skip-entrance {
			bottom: 22px;
			right: 22px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.floating-card,
		.entrance-welcome {
			animation: none;
			transition: none;
		}
	}
</style>
