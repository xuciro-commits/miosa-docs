<script lang="ts">
	import { marked } from 'marked';
	import { i18n } from '#lib/i18n.svelte.js';
	const files = import.meta.glob('/src/content/docs/*/api.md', {
		eager: true,
		query: '?raw',
		import: 'default'
	}) as Record<string, string>;
	const source = (path: string) => {
		const match = Object.entries(files).find(([file]) => file.includes(`/${path}/api.md`));
		return match ? match[1].replace(/^---[\s\S]*?---\r?\n?/, '') : '';
	};
	const htmlEn = marked.parse(source('en')) as string;
	const htmlZh = marked.parse(source('zh') || source('en')) as string;
	const html = $derived(i18n.locale === 'zh' ? htmlZh : htmlEn);
</script>

<div class="article-content">{@html html}</div>
