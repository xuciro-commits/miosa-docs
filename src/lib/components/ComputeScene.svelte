<script lang="ts">
	import { onMount } from 'svelte';
	let { wheelNavigation = true }: { wheelNavigation?: boolean } = $props();
	let canvas: HTMLCanvasElement;
	let unavailable = $state(false);
	onMount(() => {
		let dispose: (() => void) | undefined,
			active = true;
		async function start() {
			const T = await import('three');
			if (!active) return;
			const context = canvas.getContext('webgl2', { antialias: true });
			if (!context) {
				unavailable = true;
				return;
			}
			const renderer = new T.WebGLRenderer({
				canvas,
				context,
				antialias: true,
				powerPreference: 'high-performance'
			});
			renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
			renderer.setClearColor(0x07090d, 1);
			const scene = new T.Scene();
			scene.fog = new T.FogExp2(0x07090d, 0.018);
			const camera = new T.PerspectiveCamera(62, 1, 0.1, 160);
			camera.position.set(1.2, 0.3, 11.5);
			const group = new T.Group();
			group.position.set(-4.2, 0, -10);
			scene.add(group);
			const box = new T.BoxGeometry(3.6, 3.6, 3.6),
				edges = new T.EdgesGeometry(box),
				geometry = new T.InstancedBufferGeometry();
			geometry.setAttribute('position', edges.getAttribute('position').clone());
			const count = 15 * 9 * 19,
				offsets = new Float32Array(count * 3),
				phases = new Float32Array(count),
				actives = new Float32Array(count);
			let index = 0;
			for (let z = 0; z < 19; z++)
				for (let y = 0; y < 9; y++)
					for (let x = 0; x < 15; x++) {
						offsets.set([(x - 7) * 3.6, (y - 4) * 3.6, -z * 3.6], index * 3);
						phases[index] = x * 0.31 + y * 0.47 + z * 0.19;
						actives[index] = (x + z * 2) % 11 === 0 || (y * 3 + z) % 17 === 0 ? 1 : 0;
						index++;
					}
			geometry.instanceCount = count;
			geometry.setAttribute('aOffset', new T.InstancedBufferAttribute(offsets, 3));
			geometry.setAttribute('aPhase', new T.InstancedBufferAttribute(phases, 1));
			geometry.setAttribute('aActive', new T.InstancedBufferAttribute(actives, 1));
			const motion = matchMedia('(prefers-reduced-motion: reduce)');
			const uniforms = {
				uTime: { value: 0 },
				uPointer: { value: new T.Vector2() },
				uMotion: { value: motion.matches ? 0 : 1 },
				uTravel: { value: 0 }
			};
			// Scene dimensions, shader colors and camera values observed in MIOSA's public AuthComputeScene.
			const material = new T.ShaderMaterial({
				uniforms,
				transparent: true,
				depthWrite: false,
				blending: T.AdditiveBlending,
				vertexShader: `
    uniform float uTime; uniform float uMotion; uniform float uTravel; uniform vec2 uPointer;
    attribute vec3 aOffset; attribute float aPhase; attribute float aActive;
    varying float vActive; varying float vDepth;
    void main(){
     vec3 cell=aOffset;cell.z=mod(cell.z+uTravel+10.8,68.4)-57.6;
     float pointerDistance=distance(cell.xy*.045,uPointer);
     float pointerField=exp(-pointerDistance*pointerDistance*1.8);
     float wave=sin(uTime*.55+aPhase)*.5+.5;
     cell.z+=pointerField*(1.4+aActive*1.5)*uMotion;
     cell.y+=aActive*wave*.32*uMotion;cell.x+=aActive*sin(uTime*.32+aPhase)*.16*uMotion;
     vec3 local=position;local*=.955+pointerField*.025;
     vec4 view=modelViewMatrix*vec4(local+cell,1.0);gl_Position=projectionMatrix*view;
     vActive=aActive*(.6+wave*.4);vDepth=clamp((-view.z-7.0)/64.0,0.0,1.0);
    }`,
				fragmentShader: `
    varying float vActive;varying float vDepth;
    void main(){
     vec3 base=mix(vec3(.31,.39,.52),vec3(.70,.76,.87),vActive);
     vec3 warm=vec3(.86,.77,.64);vec3 color=mix(base,warm,vActive*.42);
     float alpha=mix(.40,.13,vDepth)+vActive*.34;gl_FragColor=vec4(color,alpha);
    }`
			});
			group.add(new T.LineSegments(geometry, material));
			let pointerX = 0,
				pointerY = 0,
				targetZoom = 0,
				zoom = 0,
				targetTravel = 0,
				travel = 0,
				frame = 0,
				last = 0;
			const started = performance.now();
			const pointer = (event: PointerEvent) => {
				pointerX = event.clientX / innerWidth - 0.5;
				pointerY = event.clientY / innerHeight - 0.5;
				uniforms.uPointer.value.set(pointerX * 2.2, -pointerY * 1.4);
			};
			const wheel = (event: WheelEvent) => {
				if (innerWidth <= 900 || motion.matches) return;
				if (event.deltaY < 0)
					targetZoom = T.MathUtils.clamp(targetZoom + event.deltaY * 0.006, -3.2, 0);
				else if (targetZoom < 7.5)
					targetZoom = T.MathUtils.clamp(targetZoom + event.deltaY * 0.008, -3.2, 7.5);
				else targetTravel += event.deltaY * 0.02;
			};
			function draw(now: number) {
				frame = 0;
				if (now - last < 32 && !motion.matches) {
					frame = requestAnimationFrame(draw);
					return;
				}
				last = now;
				uniforms.uTime.value = (now - started) / 1000;
				if (!motion.matches) {
					zoom += (targetZoom - zoom) * 0.075;
					travel += (targetTravel - travel) * 0.07;
					uniforms.uTravel.value = travel;
					const depth = T.MathUtils.clamp((zoom + 3.2) / 10.7, 0, 1);
					camera.position.x += (1.2 + pointerX * (2.2 + depth * 1.5) - camera.position.x) * 0.04;
					camera.position.y += (0.3 - pointerY * (1.6 + depth) - camera.position.y) * 0.04;
					camera.position.z += (11.5 + zoom - camera.position.z) * 0.08;
					group.rotation.y += (pointerX * 0.065 - group.rotation.y) * 0.03;
					group.rotation.x += (-pointerY * 0.04 - group.rotation.x) * 0.03;
				}
				camera.lookAt(-3.5 + pointerX * 1.1, -0.2 - pointerY * 0.8, -24);
				renderer.render(scene, camera);
				if (!motion.matches && !document.hidden) frame = requestAnimationFrame(draw);
			}
			const resume = () => {
				cancelAnimationFrame(frame);
				uniforms.uMotion.value = motion.matches ? 0 : 1;
				if (!document.hidden) frame = requestAnimationFrame(draw);
			};
			const resize = () => {
				renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
				camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
				camera.updateProjectionMatrix();
				resume();
			};
			const observer = new ResizeObserver(resize);
			observer.observe(canvas);
			window.addEventListener('pointermove', pointer, { passive: true });
			if (wheelNavigation) window.addEventListener('wheel', wheel, { passive: true });
			document.addEventListener('visibilitychange', resume);
			motion.addEventListener('change', resume);
			resize();
			dispose = () => {
				cancelAnimationFrame(frame);
				observer.disconnect();
				window.removeEventListener('pointermove', pointer);
				window.removeEventListener('wheel', wheel);
				document.removeEventListener('visibilitychange', resume);
				motion.removeEventListener('change', resume);
				box.dispose();
				edges.dispose();
				geometry.dispose();
				material.dispose();
				renderer.dispose();
			};
		}
		start();
		return () => {
			active = false;
			dispose?.();
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true" class:unavailable></canvas>{#if unavailable}<div
		class="static-fabric"
		aria-hidden="true"
	></div>{/if}

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	.unavailable {
		display: none;
	}
	.static-fabric {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(#8294b41a 1px, transparent 1px),
			linear-gradient(90deg, #8294b41a 1px, transparent 1px);
		background-size: 90px 90px;
		transform: perspective(600px) rotateY(-15deg);
		opacity: 0.4;
	}
</style>
