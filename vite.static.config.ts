import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
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
			output: { bundleStrategy: 'single' },
			prerender: { handleHttpError: 'warn', handleEntryGeneratorMismatch: 'warn' }
		})
	]
});
