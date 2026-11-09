<script lang="ts">
	import { marked } from 'marked';
	const files = import.meta.glob('/src/content/docs/en/api.md', {
		eager: true,
		query: '?raw',
		import: 'default'
	}) as Record<string, string>;
	const source = Object.values(files)[0] ?? '';
	const body = source.replace(/^---[\s\S]*?---\r?\n?/, '');
	const html = marked.parse(body) as string;
</script>

<div class="article-content">{@html html}</div>
