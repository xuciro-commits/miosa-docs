<script lang="ts">
	let { data } = $props();
	const Content = $derived(data.Content);
</script>

<div class="article-content"><Content /></div>
