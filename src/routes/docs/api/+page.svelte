<script lang="ts">
	import { marked } from 'marked';
	import generatedData from '#lib/content/generated-docs.json';
	const page = generatedData.pages.find((item) => item.slug === 'api');
	const html = page ? (marked.parse(page.markdown) as string) : '';
</script>

<div class="article-content">{@html html}</div>
