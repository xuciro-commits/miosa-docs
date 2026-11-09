<script lang="ts">
	import { i18n, t, toggleLocale } from '#lib/i18n.svelte.js';
	const isChinese = $derived(i18n.locale === 'zh');
</script>

<button
	type="button"
	class="language-toggle"
	aria-label={t(isChinese ? 'language.switchToEnglish' : 'language.switchToChinese')}
	title={t(isChinese ? 'language.switchToEnglish' : 'language.switchToChinese')}
	onclick={toggleLocale}
>
	<span class="language-globe" aria-hidden="true">
		<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.2">
			<circle cx="8" cy="8" r="5.7"></circle>
			<path d="M2.5 8h11M8 2.3c1.5 1.5 2.3 3.4 2.3 5.7S9.5 12.9 8 14.4C6.5 12.9 5.7 11 5.7 8S6.5 3.7 8 2.3Z"></path>
		</svg>
	</span>
	<span class="language-choice" class:active={!isChinese}>EN</span>
	<span class="language-choice" class:active={isChinese}>中文</span>
</button>

<style>
	.language-toggle {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		height: 30px;
		padding: 2px 4px 2px 7px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--hover);
		color: var(--muted);
		white-space: nowrap;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.language-toggle:hover {
		background: var(--active);
		color: var(--text);
	}
	.language-globe {
		display: inline-flex;
		margin-right: 1px;
		color: var(--faint);
	}
	.language-choice {
		display: inline-flex;
		align-items: center;
		height: 24px;
		padding: 0 5px;
		border-radius: 5px;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.01em;
		line-height: 1;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.language-choice.active {
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 1px 2px #0002;
	}
</style>
