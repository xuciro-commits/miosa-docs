<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, Search } from '@lucide/svelte';
	import { preferences } from '#lib/preferences.svelte.js';
</script>

<div class="error-page">
	<span>{page.status}</span>
	<h1>{page.status === 404 ? 'This page has moved out of view.' : 'This page could not load.'}</h1>
	<p>{page.error?.message ?? 'Choose another page or return to the learning workspace.'}</p>
	<div>
		<a href="/docs/learn/earn" class="button"><ArrowLeft size={14} />Back to learning</a><button
			class="button primary"
			onclick={() => (preferences.searchOpen = true)}
			><Search size={14} />Search documentation</button
		>
	</div>
</div>

<style>
	.error-page {
		max-width: 620px;
		margin: 10vh auto;
		padding: 30px;
	}
	.error-page > span {
		font-family: 'Geist Mono', monospace;
		font-size: 13px;
		color: var(--muted);
	}
	h1 {
		font-size: 30px;
		margin: 17px 0;
	}
	p {
		font-size: 14px;
		color: var(--muted);
		line-height: 1.8;
	}
	.error-page > div {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		margin-top: 25px;
	}
</style>
