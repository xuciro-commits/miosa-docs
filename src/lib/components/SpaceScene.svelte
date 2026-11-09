<script lang="ts">
	import { onMount } from 'svelte';
	let { paused = false, warp = false }: { paused?: boolean; warp?: boolean } = $props();
	let canvas: HTMLCanvasElement;
	let restart: (() => void) | undefined;
	$effect(() => {
		paused;
		warp;
		restart?.();
	});
	onMount(() => {
		const context = canvas.getContext('2d');
		if (!context) return;
		const ctx = context;
		let width = 0,
			height = 0,
			frame = 0,
			last = 0,
			time = 0,
			mouseX = 0,
			mouseY = 0,
			viewX = 0,
			viewY = 0;
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		let seed = 8173;
		const random = () => {
			seed = (seed * 16807) % 2147483647;
			return (seed - 1) / 2147483646;
		};
		const stars = Array.from({ length: 650 }, () => ({
			x: random(),
			y: random(),
			radius: 0.25 + random() * 1.25,
			depth: 0.2 + random() * 0.8,
			phase: random() * 6.28,
			color: random()
		}));
		const resize = () => {
			const bounds = canvas.getBoundingClientRect();
			width = bounds.width;
			height = bounds.height;
			const ratio = Math.min(devicePixelRatio, 1.75);
			canvas.width = Math.round(width * ratio);
			canvas.height = Math.round(height * ratio);
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			draw(0);
		};
		function draw(now: number) {
			frame = 0;
			const moving = !paused && !motion.matches && !document.hidden;
			if (now - last < 32 && moving) {
				frame = requestAnimationFrame(draw);
				return;
			}
			const delta = Math.min(50, now - last || 16);
			last = now;
			if (moving) time += delta * 0.001;
			viewX += (mouseX - viewX) * 0.04;
			viewY += (mouseY - viewY) * 0.04;
			ctx.clearRect(0, 0, width, height);
			const nebula = ctx.createRadialGradient(
				width * 0.72,
				height * 0.28,
				0,
				width * 0.72,
				height * 0.28,
				width * 0.3
			);
			nebula.addColorStop(0, 'rgba(108,113,174,.17)');
			nebula.addColorStop(0.3, 'rgba(63,76,131,.11)');
			nebula.addColorStop(1, 'rgba(10,15,29,0)');
			ctx.fillStyle = nebula;
			ctx.fillRect(0, 0, width, height);
			for (const star of stars) {
				const drift = motion.matches ? 0 : time * star.depth * 0.0018;
				const x = ((star.x + drift) % 1) * width + viewX * star.depth * 14;
				const y = star.y * height + viewY * star.depth * 10;
				const alpha = 0.25 + (Math.sin(time * 0.7 + star.phase) + 1) * 0.2;
				const shade =
					star.color > 0.85 ? '121,200,228' : star.color < 0.08 ? '220,180,122' : '206,217,236';
				ctx.fillStyle = `rgba(${shade},${alpha})`;
				if (star.radius > 1.35) {
					ctx.shadowBlur = 10;
					ctx.shadowColor = `rgba(${shade},.6)`;
				} else ctx.shadowBlur = 0;
				ctx.beginPath();
				ctx.arc(x, y, star.radius, 0, Math.PI * 2);
				ctx.fill();
				if (warp) {
					const dx = x - width * 0.5,
						dy = y - height * 0.48;
					ctx.strokeStyle = `rgba(${shade},.5)`;
					ctx.lineWidth = star.radius * 0.6;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x + dx * 0.14, y + dy * 0.14);
					ctx.stroke();
				}
			}
			ctx.shadowBlur = 0;
			if (moving) frame = requestAnimationFrame(draw);
		}
		const resume = () => {
			if (frame) cancelAnimationFrame(frame);
			last = performance.now();
			frame = requestAnimationFrame(draw);
		};
		restart = resume;
		const pointer = (event: PointerEvent) => {
			mouseX = (event.clientX / innerWidth - 0.5) * 2;
			mouseY = (event.clientY / innerHeight - 0.5) * 2;
		};
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);
		window.addEventListener('pointermove', pointer, { passive: true });
		document.addEventListener('visibilitychange', resume);
		motion.addEventListener('change', resume);
		resize();
		restart();
		return () => {
			restart = undefined;
			cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener('pointermove', pointer);
			document.removeEventListener('visibilitychange', resume);
			motion.removeEventListener('change', resume);
		};
	});
</script>

<canvas bind:this={canvas} class:warping={warp} aria-hidden="true"></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
		transition:
			filter 0.8s,
			transform 1.1s cubic-bezier(0.2, 0.7, 0.3, 1);
	}
	canvas.warping {
		transform: scale(2.7);
		filter: brightness(2.5) blur(1px);
	}
	@media (prefers-reduced-motion: reduce) {
		canvas.warping {
			transform: none;
			filter: none;
		}
	}
</style>
