/* The homepage background: a field of wireframe cubes drifting in depth.
 *
 * This is a plain-DOM port of `src/lib/components/ComputeScene.svelte`, which the
 * docs application renders through Svelte + the three.js copy inside its bundle.
 * The homepage is a standalone document, so it loads three from the CDN instead
 * and builds the same scene here. Keep the two in step if the art changes.
 *
 * Failure is silent and graceful: no WebGL or no network means the CSS grid
 * fallback in home.css shows instead of an empty page.
 */
(function () {
	/** @type {HTMLCanvasElement | null} */
	var canvas = /** @type {any} */ (document.querySelector('.fabric-canvas'));
	/** @type {HTMLElement | null} */
	var fallback = /** @type {any} */ (document.querySelector('.static-fabric'));
	if (!canvas) return;
	var surface = canvas;

	var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	var source = canvas.dataset.three || 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

	// The homepage has a transparent scene behind a shade; the app paints it dark.
	canvas.style.opacity = '1';

	import(source)
		.then(function (T) {
			var context = surface.getContext('webgl2', { antialias: true });
			if (!context) throw new Error('no webgl2');

			var renderer = new T.WebGLRenderer({
				canvas: surface,
				context: context,
				antialias: true,
				alpha: true,
				premultipliedAlpha: false,
				preserveDrawingBuffer: true,
				powerPreference: 'high-performance'
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
			// Clear to the page colour so the wireframe reads on either theme.
			var isLight = document.documentElement.dataset.theme === 'light';
			renderer.setClearColor(isLight ? 0xfafafa : 0x07080b, 1);
			renderer.autoClear = false;

			var scene = new T.Scene();
			var camera = new T.PerspectiveCamera(62, 1, 0.1, 160);
			camera.position.set(1.2, 0.3, 11.5);

			var group = new T.Group();
			group.position.set(-4.2, 0, -10);
			scene.add(group);

			var box = new T.BoxGeometry(3.6, 3.6, 3.6);
			var edges = new T.EdgesGeometry(box);
			var geometry = new T.InstancedBufferGeometry();
			geometry.setAttribute('position', edges.getAttribute('position').clone());

			var count = 15 * 9 * 19;
			var offsets = new Float32Array(count * 3);
			var phases = new Float32Array(count);
			var actives = new Float32Array(count);
			var index = 0;
			for (var z = 0; z < 19; z++)
				for (var y = 0; y < 9; y++)
					for (var x = 0; x < 15; x++) {
						offsets.set([(x - 7) * 3.6, (y - 4) * 3.6, -z * 3.6], index * 3);
						phases[index] = x * 0.31 + y * 0.47 + z * 0.19;
						actives[index] = (x + z * 2) % 11 === 0 || (y * 3 + z) % 17 === 0 ? 1 : 0;
						index++;
					}
			geometry.instanceCount = count;
			// Three's renderer only honours an InstancedBufferGeometry when the draw
			// range is explicit; without it the call is issued but draws nothing.
			geometry.setDrawRange(0, edges.getAttribute('position').count);
			geometry.setAttribute('aOffset', new T.InstancedBufferAttribute(offsets, 3));
			geometry.setAttribute('aPhase', new T.InstancedBufferAttribute(phases, 1));
			geometry.setAttribute('aActive', new T.InstancedBufferAttribute(actives, 1));

			var uniforms = {
				uTime: { value: 0 },
				uPointer: { value: new T.Vector2() },
				uMotion: { value: motion.matches ? 0 : 1 },
				uTravel: { value: 0 },
				// 0 dark page (pale lines), 1 light page (dark lines).
				uLight: { value: isLight ? 1 : 0 }
			};

			var material = new T.ShaderMaterial({
				uniforms: uniforms,
				transparent: true,
				depthWrite: false,
				// Additive blending only reads on a dark page; on a pale page it washes
				// the dark lines out to nothing. Normal blending with the same alpha
				// keeps the geometry visible either way.
				blending: T.NormalBlending,
				vertexShader: [
					'uniform float uTime; uniform float uMotion; uniform float uTravel; uniform vec2 uPointer;',
					'attribute vec3 aOffset; attribute float aPhase; attribute float aActive;',
					'varying float vActive; varying float vDepth;',
					'void main(){',
					'vec3 cell=aOffset;cell.z=mod(cell.z+uTravel+10.8,68.4)-57.6;',
					'float pointerDistance=distance(cell.xy*.045,uPointer);',
					'float pointerField=exp(-pointerDistance*pointerDistance*1.8);',
					'float wave=sin(uTime*.55+aPhase)*.5+.5;',
					'cell.z+=pointerField*(1.4+aActive*1.5)*uMotion;',
					'cell.y+=aActive*wave*.32*uMotion;cell.x+=aActive*sin(uTime*.32+aPhase)*.16*uMotion;',
					'vec3 local=position;local*=.955+pointerField*.025;',
					'vec4 view=modelViewMatrix*vec4(local+cell,1.0);gl_Position=projectionMatrix*view;',
					'vActive=aActive*(.6+wave*.4);vDepth=clamp((-view.z-7.0)/64.0,0.0,1.0);',
					'}'
				].join('\n'),
				fragmentShader: [
					'varying float vActive;varying float vDepth;',
					'void main(){',
					'vec3 base=mix(vec3(.31,.39,.52),vec3(.70,.76,.87),vActive);',
					'vec3 warm=vec3(.86,.77,.64);vec3 color=mix(base,warm,vActive*.42);',
					'float alpha=mix(.40,.13,vDepth)+vActive*.34;gl_FragColor=vec4(color,alpha);',
					'}'
				].join('\n')
			});

			group.add(new T.LineSegments(geometry, material));

			var pointerX = 0;
			var pointerY = 0;
			var frame = 0;
			var last = 0;
			var started = performance.now();
			var active = true;

			/** @param {PointerEvent} event */
			var move = function (event) {
				pointerX = event.clientX / window.innerWidth - 0.5;
				pointerY = event.clientY / window.innerHeight - 0.5;
				uniforms.uPointer.value.set(pointerX * 2.2, -pointerY * 1.4);
			};

			/** @param {number} now */
			var draw = function (now) {
				frame = 0;
				if (!active) return;
				if (now - last < 32 && !motion.matches) {
					frame = requestAnimationFrame(draw);
					return;
				}
				last = now;
				uniforms.uTime.value = (now - started) / 1000;
				if (!motion.matches) {
					camera.position.x += (1.2 + pointerX * 2.2 - camera.position.x) * 0.04;
					camera.position.y += (0.3 - pointerY * 1.6 - camera.position.y) * 0.04;
					group.rotation.y += (pointerX * 0.065 - group.rotation.y) * 0.03;
					group.rotation.x += (-pointerY * 0.04 - group.rotation.x) * 0.03;
				}
				camera.lookAt(-3.5 + pointerX * 1.1, -0.2 - pointerY * 0.8, -24);
				renderer.clear();
				renderer.render(scene, camera);
				if (!motion.matches && !document.hidden) frame = requestAnimationFrame(draw);
			};

			var resume = function () {
				if (frame) cancelAnimationFrame(frame);
				uniforms.uMotion.value = motion.matches ? 0 : 1;
				if (!document.hidden && active) frame = requestAnimationFrame(draw);
				// Preserve the buffer, or the frame is lost between paints.
				if (!active) return;
				renderer.render(scene, camera);
			};

			var resize = function () {
				var width = surface.clientWidth || (surface.parentElement ? surface.parentElement.clientWidth : 0);
				var height = surface.clientHeight || (surface.parentElement ? surface.parentElement.clientHeight : 0);
				if (!width || !height) return;
				renderer.setSize(width, height, false);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				resume();
			};

			// A visit can start in either theme; follow later changes without a reload.
			new MutationObserver(function () {
				var light = document.documentElement.dataset.theme === 'light';
				renderer.setClearColor(light ? 0xfafafa : 0x07080b, 1);
				uniforms.uLight.value = light ? 1 : 0;
				renderer.clear();
				renderer.render(scene, camera);
			}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

			if (fallback) fallback.style.display = 'none';
			var observer = new ResizeObserver(resize);
			observer.observe(surface);
			window.addEventListener('pointermove', move, { passive: true });
			// Paint a few frames while the document settles: the first paints can be
			// dropped before the canvas is composited.
			var warm = 0;
			var warmTimer = setInterval(function () {
				renderer.clear();
				renderer.render(scene, camera);
				if (++warm > 20) clearInterval(warmTimer);
			}, 80);
			document.addEventListener('visibilitychange', resume);
			motion.addEventListener('change', resume);
			resize();
			// Draw one frame immediately: on a static page rAF can be throttled while
			// the document is still settling, which left the canvas transparent.
			renderer.clear();
			renderer.render(scene, camera);
			surface.dataset.ready = 'true';
			// The theme may resolve after this module starts (the inline head script runs
			// first, but storage may fill in later); repaint once more when everything is
			// settled so the light-mode clear colour and ink lines are applied.
			var settle = function () {
				resize();
				renderer.clear();
				renderer.render(scene, camera);
			};
			setTimeout(settle, 0);
			requestAnimationFrame(settle);
			window.addEventListener('load', settle);
			/** @type {any} */ (window).__fabric = {
				renderer: renderer,
				scene: scene,
				camera: camera,
				info: function () {
					var lines = scene.children[0] && scene.children[0].children[0];
					return {
						instances: lines ? lines.geometry.instanceCount : -1,
						drawRange: lines ? lines.geometry.drawRange : null,
						programOk: lines ? !!lines.material.program : false,
						visible: lines ? lines.visible : null
					};
				}
			};
		})
		.catch(function () {
			// Keep the CSS grid fallback; the page is fully readable without the scene.
			if (fallback) fallback.style.display = '';
		});
})();
