<script lang="ts">
	import { onMount } from 'svelte';
	import { Zap, ArrowRight } from '@lucide/svelte';
	import products from '#lib/content/products.json';
	import { t } from '#lib/i18n.svelte.js';
	let selected = $state(0),
		held = $state(false),
		reduced = $state(false),
		announcement = $state(''),
		beam = $state({ x: 0, y: 0, length: 0, angle: 0, visible: false });
	let field: HTMLDivElement, list: HTMLUListElement;
	let kick: ((index: number) => void) | undefined;
	let manualUntil = 0,
		beamTimer: ReturnType<typeof setTimeout>;
	const current = $derived(products[selected]);
	function productBlurb(product: (typeof products)[number]): string {
		const key = `docs.productShowcase.product.${product.id}.blurb`;
		const translated = t(key);
		return translated === key ? product.blurb : translated;
	}
	function productName(product: (typeof products)[number]): string {
		const key = `docs.productShowcase.product.${product.id}.name`;
		const translated = t(key);
		return translated === key ? product.name : translated;
	}
	function choose(index: number) {
		selected = index;
		manualUntil = Date.now() + 9000;
		announcement = t('docs.productShowcase.announcement', { name: productName(products[index]) });
	}
	function zap(index = Math.floor(Math.random() * products.length)) {
		choose(index);
		kick?.(index);
		const body = list.children[index] as HTMLElement;
		if (!body || !body.offsetWidth) return;
		const a = field.getBoundingClientRect(),
			b = body.getBoundingClientRect(),
			x = a.width / 2,
			y = a.height - 28,
			dx = b.left + b.width / 2 - a.left - x,
			dy = b.top + b.height / 2 - a.top - y;
		beam = {
			x,
			y,
			length: Math.hypot(dx, dy),
			angle: (Math.atan2(dy, dx) * 180) / Math.PI,
			visible: true
		};
		clearTimeout(beamTimer);
		beamTimer = setTimeout(() => (beam.visible = false), reduced ? 0 : 250);
	}
	onMount(() => {
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		reduced = motion.matches;
		let frame = 0,
			last = 0,
			visible = false,
			dragIndex = -1,
			startX = 0,
			startY = 0,
			lastX = 0,
			lastY = 0,
			moved = false;
		let width = 0,
			height = 0;
		const bodies = Array.from(list.children).map((el) => ({
			el: el as HTMLElement,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			homeX: 0,
			homeY: 0,
			w: 0,
			h: 0
		}));
		function layout() {
			width = field.clientWidth;
			height = field.clientHeight;
			const columns = width < 500 ? 4 : 8,
				rows = Math.ceil(bodies.length / columns),
				cellWidth = (width - 32) / columns,
				cellHeight = (height - 82) / rows;
			for (const [i, b] of bodies.entries()) {
				b.w = b.el.offsetWidth;
				b.h = b.el.offsetHeight;
				b.homeX = 16 + cellWidth * (i % columns) + (cellWidth - b.w) / 2;
				b.homeY = 10 + cellHeight * Math.floor(i / columns) + (cellHeight - b.h) / 2;
				b.x = b.homeX;
				b.y = b.homeY;
				b.vx = b.vy = 0;
				b.el.style.transform = `translate(${b.x}px,${b.y}px)`;
			}
		}
		function draw(now: number) {
			frame = 0;
			if (!visible || document.hidden || reduced) return;
			if (now - last < 30) {
				frame = requestAnimationFrame(draw);
				return;
			}
			last = now;
			for (const [i, b] of bodies.entries()) {
				if (i !== dragIndex) {
					b.vx = (b.vx + (b.homeX - b.x) * 0.002) * 0.96;
					b.vy = (b.vy + (b.homeY - b.y) * 0.002) * 0.96;
					b.x += b.vx;
					b.y += b.vy;
					if (b.x < 4 || b.x > width - b.w - 4) {
						b.x = Math.max(4, Math.min(width - b.w - 4, b.x));
						b.vx *= -0.6;
					}
					if (b.y < 4 || b.y > height - b.h - 48) {
						b.y = Math.max(4, Math.min(height - b.h - 48, b.y));
						b.vy *= -0.6;
					}
				}
				for (let j = i + 1; j < bodies.length; j++) {
					const other = bodies[j],
						dx = other.x - b.x,
						dy = other.y - b.y,
						distance = Math.hypot(dx, dy),
						limit = Math.min(b.w, other.w) * 0.85;
					if (distance > 0 && distance < limit) {
						const overlap = (limit - distance) * 0.15;
						if (i !== dragIndex) {
							b.vx -= (dx / distance) * overlap;
							b.vy -= (dy / distance) * overlap;
						}
						if (j !== dragIndex) {
							other.vx += (dx / distance) * overlap;
							other.vy += (dy / distance) * overlap;
						}
					}
				}
				b.el.style.transform = `translate(${b.x}px,${b.y}px) rotate(${Math.max(-20, Math.min(20, b.vx * 1.5))}deg)`;
			}
			frame = requestAnimationFrame(draw);
		}
		const resume = () => {
			cancelAnimationFrame(frame);
			if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(draw);
		};
		kick = (index) => {
			if (reduced) return;
			const b = bodies[index];
			b.vx = (Math.random() - 0.5) * 22;
			b.vy = -9;
			resume();
		};
		function down(event: PointerEvent) {
			const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-product]');
			if (!anchor || event.button !== 0 || reduced) return;
			dragIndex = Number(anchor.dataset.product);
			startX = lastX = event.clientX;
			startY = lastY = event.clientY;
			moved = false;
			anchor.setPointerCapture(event.pointerId);
			manualUntil = Date.now() + 9000;
		}
		function move(event: PointerEvent) {
			if (dragIndex < 0) return;
			const b = bodies[dragIndex],
				dx = event.clientX - lastX,
				dy = event.clientY - lastY;
			if (Math.hypot(event.clientX - startX, event.clientY - startY) > 5) moved = true;
			if (moved) {
				b.x = Math.max(4, Math.min(width - b.w - 4, b.x + dx));
				b.y = Math.max(4, Math.min(height - b.h - 48, b.y + dy));
				b.vx = Math.max(-20, Math.min(20, dx));
				b.vy = Math.max(-20, Math.min(20, dy));
			}
			lastX = event.clientX;
			lastY = event.clientY;
		}
		function up(event: PointerEvent) {
			if (dragIndex < 0) return;
			const b = bodies[dragIndex];
			if (event.type === 'pointercancel') b.vx = b.vy = 0;
			else if (moved) {
				choose(dragIndex);
				b.el.querySelector('a')?.setAttribute('data-dragged', 'true');
			}
			dragIndex = -1;
			resume();
		}
		function click(event: MouseEvent) {
			const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-product]');
			if (anchor?.hasAttribute('data-dragged')) {
				event.preventDefault();
				anchor.removeAttribute('data-dragged');
			}
		}
		const observer = new ResizeObserver(layout);
		observer.observe(field);
		const intersection = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			resume();
		});
		intersection.observe(field);
		const change = () => {
			reduced = motion.matches;
			layout();
			resume();
		};
		motion.addEventListener('change', change);
		document.addEventListener('visibilitychange', resume);
		list.addEventListener('pointerdown', down);
		list.addEventListener('pointermove', move);
		list.addEventListener('pointerup', up);
		list.addEventListener('pointercancel', up);
		list.addEventListener('click', click, true);
		layout();
		const cycle = setInterval(() => {
			if (
				visible &&
				!held &&
				!reduced &&
				!document.hidden &&
				Date.now() > manualUntil &&
				dragIndex < 0
			)
				selected = (selected + 1) % products.length;
		}, 2400);
		return () => {
			kick = undefined;
			clearInterval(cycle);
			clearTimeout(beamTimer);
			cancelAnimationFrame(frame);
			observer.disconnect();
			intersection.disconnect();
			motion.removeEventListener('change', change);
			document.removeEventListener('visibilitychange', resume);
			list.removeEventListener('pointerdown', down);
			list.removeEventListener('pointermove', move);
			list.removeEventListener('pointerup', up);
			list.removeEventListener('pointercancel', up);
			list.removeEventListener('click', click, true);
		};
	});
</script>

<section
	class="product-showcase"
	aria-labelledby="product-heading"
	onmouseenter={() => (held = true)}
	onmouseleave={() => (held = false)}
	onfocusin={() => (held = true)}
	onfocusout={(event) => (held = event.currentTarget.contains(event.relatedTarget as Node))}
>
	<p class="eyebrow">{t('docs.productShowcase.eyebrow')}</p>
	<h2 id="product-heading">
		<span>{current.run ? t('docs.productShowcase.run') : t('docs.productShowcase.buildOwn')}</span>
		<img src={`/brand/products/${current.src.split('/').pop()}`} alt="" />
		{productName(current)}
	</h2>
	<p class="product-description">
		{productBlurb(current)}
		<a href={`/docs/build/${current.href.split('/').pop()}`}
			>{current.run ? t('docs.productShowcase.run') : t('docs.productShowcase.build')}
			{productName(current)}<ArrowRight size={12} /></a
		>
	</p>
	<div bind:this={field} class="product-field" class:static-field={reduced}>
		<ul bind:this={list} aria-label={t('docs.productShowcase.listAria')}>
			{#each products as product, i}<li>
					<a
						data-product={i}
						href={`/docs/build/${product.href.split('/').pop()}`}
						aria-label={t('docs.productShowcase.tileAria', {
							action: product.run
								? t('docs.productShowcase.run')
								: t('docs.productShowcase.buildOwn'),
							name: productName(product)
						})}
						aria-current={selected === i ? 'true' : undefined}
						draggable="false"
						onclick={(event) => {
							if (event.defaultPrevented || reduced) return;
							if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
							if (selected !== i || Date.now() > manualUntil) {
								event.preventDefault();
								choose(i);
							}
						}}
						><span class="product-logo"
							><img
								class="logo-light"
								src={`/brand/products/${product.src.split('/').pop()}`}
								alt=""
								draggable="false"
							/>{#if product.srcDark}<img
									class="logo-dark"
									src={`/brand/products/${product.srcDark.split('/').pop()}`}
									alt=""
									draggable="false"
								/>{/if}</span
						><span class="product-name">{product.label}</span></a
					>
				</li>{/each}
		</ul>
		<div
			class="laser"
			class:visible={beam.visible}
			style={`left:${beam.x}px;top:${beam.y}px;width:${beam.length}px;transform:rotate(${beam.angle}deg)`}
		></div>
		<img class="turret" src="/brand/osa-orb.png" alt="" />
		<div class="field-tools">
			<span>{reduced ? t('docs.productShowcase.choose') : t('docs.productShowcase.drag')}</span
			><button aria-label={t('docs.productShowcase.zapAria')} onclick={() => zap()}
				><Zap size={12} />{t('docs.productShowcase.zap')}</button
			>
		</div>
	</div>
	<p class="sr-only" aria-live="polite">{announcement}</p>
	<small class="trademark">{t('docs.productShowcase.trademark')}</small>
</section>

<style>
	.product-showcase {
		margin: 65px 0 50px;
	}
	.eyebrow {
		font-size: 10px;
		letter-spacing: 0.09em;
		color: var(--muted);
		font-weight: 600;
	}
	.product-showcase h2 {
		font-size: clamp(1.75rem, 3.3vw, 2.5rem);
		line-height: 1.2;
		letter-spacing: -0.045em;
		margin: 18px 0 15px;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
		font-weight: 590;
	}
	.product-showcase h2 > span {
		color: var(--muted);
	}
	.product-showcase h2 img {
		width: 32px;
		height: 32px;
		object-fit: contain;
		border: 1px solid var(--border);
		border-radius: 9px;
		padding: 5px;
		background: #fff;
	}
	.product-description {
		max-width: 680px;
		color: var(--dt2);
		font-size: 15px;
		line-height: 1.6;
		min-height: 56px;
		margin: 0 0 20px;
	}
	.product-description a {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: var(--text);
		white-space: normal;
	}
	.product-field {
		position: relative;
		height: 345px;
		background:
			radial-gradient(
				circle at 1px 1px,
				color-mix(in srgb, var(--dt) 8%, transparent) 1px,
				transparent 1.2px
			),
			var(--dbg2);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
		background-size: 16px 16px;
		border: 1px solid var(--border);
		border-radius: 18px;
		overflow: hidden;
		contain: layout;
	}
	.product-field ul {
		list-style: none;
		margin: 0;
		padding: 0;
		position: absolute;
		inset: 0;
	}
	.product-field li {
		position: absolute;
		width: 90px;
		height: 81px;
		will-change: transform;
	}
	.product-field li > a {
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 5px;
		padding: 7px 0;
		touch-action: none;
		cursor: grab;
		user-select: none;
		border-radius: 12px;
	}
	.product-field li > a:active {
		cursor: grabbing;
	}
	.product-logo {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		background: #fff;
		border: 1px solid var(--border);
		box-shadow: 0 3px 8px #00000005;
		border-radius: 16px;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}
	.product-field [aria-current='true'] .product-logo {
		border-color: var(--text);
		box-shadow: 0 0 0 3px var(--hover);
	}
	.product-logo img {
		width: 31px;
		height: 31px;
		object-fit: contain;
	}
	.product-name {
		font-size: 8px;
		color: var(--muted);
		white-space: nowrap;
		max-width: 90px;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.logo-dark {
		display: none;
	}
	:global([data-theme='dark']) .product-logo:has(.logo-dark) .logo-light,
	:global([data-theme='glass-dark']) .product-logo:has(.logo-dark) .logo-light {
		display: none;
	}
	:global([data-theme='dark']) .logo-dark,
	:global([data-theme='glass-dark']) .logo-dark {
		display: block;
	}
	.field-tools {
		position: absolute;
		bottom: 10px;
		right: 13px;
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--faint);
		font-size: 10px;
		pointer-events: none;
	}
	.field-tools button {
		display: flex;
		align-items: center;
		gap: 4px;
		border: 1px solid var(--border);
		border-radius: 99px;
		padding: 4px 10px;
		background: var(--surface);
		color: var(--muted);
		pointer-events: auto;
	}
	.turret {
		position: absolute;
		width: 26px;
		height: 26px;
		bottom: 15px;
		left: calc(50% - 13px);
	}
	.laser {
		position: absolute;
		height: 2px;
		background: #719bff;
		box-shadow: 0 0 8px #719bff;
		transform-origin: left;
		pointer-events: none;
		opacity: 0;
	}
	.laser.visible {
		opacity: 1;
	}
	.trademark {
		display: block;
		font-size: 8px;
		color: var(--faint);
		margin-top: 12px;
	}
	.static-field .field-tools,
	.static-field .turret {
		display: none;
	}
	.static-field li > a {
		touch-action: pan-y;
		cursor: pointer;
	}
	.static-field li {
		will-change: auto;
	}
	@media (max-width: 700px) {
		.product-showcase h2 {
			font-size: 29px;
			gap: 8px;
		}
		.product-showcase {
			margin-top: 45px;
		}
		.product-description {
			font-size: 12px;
		}
		.product-field {
			height: 590px;
		}
		.product-field li {
			width: 75px;
			height: 76px;
		}
		.product-logo {
			width: 45px;
			height: 45px;
		}
		.product-logo img {
			width: 28px;
			height: 28px;
		}
		.field-tools > span {
			display: none;
		}
		.product-name {
			font-size: 7px;
			max-width: 75px;
		}
	}
</style>
