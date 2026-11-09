import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	define: { 'import.meta.env.VITE_STATIC_SITE': JSON.stringify('1') },
	environments: {
		client: {
			build: {
				rolldownOptions: {
					output: {
						codeSplitting: {
							groups: [
								{
									name: (id) => {
										if (/@scalar|node_modules\/(?:@vue|vue)/.test(id)) return 'api-explorer';
										if (/mermaid|d3-|cytoscape|dagre|elkjs|roughjs|katex/.test(id))
											return 'diagrams';
										if (/shiki|oniguruma|regex/.test(id)) return 'highlighting';
										if (/node_modules\/three\//.test(id)) return 'scene';
										return 'vendor';
									},
									test: (id) =>
										id.includes('/node_modules/') && !id.includes('/node_modules/@sveltejs/kit/')
								}
							]
						}
					}
				}
			}
		}
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				pages: 'build-static',
				assets: 'build-static',
				fallback: '404.html',
				strict: false
			}),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md'],
			output: { bundleStrategy: 'split' },
			prerender: {
				entries: ['*', '/docs-search.json', '/openapi.json', '/api/status']
			}
		})
	]
});
