<script lang="ts">
	import { Copy, Check, ArrowRight } from '@lucide/svelte';
	import { copyText } from '#lib/clipboard.js';
	import { t } from '#lib/i18n.svelte.js';
	let mode = $state('CLI'),
		tab = $state('npm'),
		copied = $state(false),
		failed = $state(false);
	const installers: Record<string, Record<string, string>> = {
		CLI: {
			npm: 'npm i -g @miosa/cli',
			Homebrew: 'brew install miosa/tap/miosa',
			Script: 'curl -fsSL https://miosa.ai/install.sh | sh'
		},
		SDK: {
			TypeScript: 'npm i @miosa/sdk',
			Python: 'pip install miosa',
			Go: 'go get github.com/Miosa-osa/miosa-go'
		}
	};
	const tabs = $derived(Object.keys(installers[mode]));
	const command = $derived(installers[mode][tab]);
	function chooseMode(value: string) {
		mode = value;
		tab = Object.keys(installers[value])[0];
		copied = false;
		failed = false;
	}
	async function copy() {
		copied = await copyText(command);
		failed = !copied;
		setTimeout(() => (copied = false), 1800);
	}
	function keys(
		event: KeyboardEvent,
		options: string[],
		current: string,
		choose: (value: string) => void
	) {
		if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		const next =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? options.length - 1
					: (options.indexOf(current) + (event.key === 'ArrowRight' ? 1 : -1) + options.length) %
						options.length;
		choose(options[next]);
		(event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')[next]?.focus();
	}
</script>

<div class="install">
	<div class="mode" role="tablist" aria-label={t('docs.install.typeAria')}>
		{#each ['CLI', 'SDK'] as item}<button
				role="tab"
				aria-selected={mode === item}
				tabindex={mode === item ? 0 : -1}
				onclick={() => chooseMode(item)}
				onkeydown={(e) => keys(e, ['CLI', 'SDK'], mode, chooseMode)}>{item}</button
			>{/each}
	</div>
	<div class="command-box">
		<div class="install-tabs" role="tablist" aria-label={t('docs.install.methodAria')}>
			{#each tabs as item}<button
					role="tab"
					aria-selected={tab === item}
					tabindex={tab === item ? 0 : -1}
					onclick={() => {
						tab = item;
						copied = false;
						failed = false;
					}}
					onkeydown={(e) => keys(e, tabs, tab, (v) => (tab = v))}>{item}</button
				>{/each}
		</div>
		<div
			class="command-line"
			role="tabpanel"
			aria-label={t('docs.install.panelAria', { mode, tab })}
		>
			<code><span>$</span> {command}</code><button
				aria-label={t('docs.install.copyAria')}
				onclick={copy}
				>{#if copied}<Check size={12} />{:else}<Copy size={12} />{/if}{copied
					? t('docs.install.copied')
					: t('docs.install.copy')}</button
			>
		</div>
		{#if failed}<p class="copy-failed" role="status">
				{t('docs.install.failed')}
			</p>{/if}
	</div>
	<a href={mode === 'CLI' ? '/docs/cli' : '/docs/sdks'}
		>{t('docs.install.docs', { mode })}<ArrowRight size={12} /></a
	>
</div>

<style>
	.install {
		font-size: 15px;
		line-height: 1.7;
		color: var(--dt2);
		max-width: 420px;
	}
	.mode {
		display: inline-flex;
		padding: 3px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 99px;
		margin: 24px 0 7px;
		font-size: 12px;
	}
	.mode button {
		padding: 4px 14px;
		border-radius: 99px;
		color: var(--muted);
	}
	.mode button[aria-selected='true'] {
		background: var(--button);
		color: var(--button-text);
	}
	.command-box {
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 0;
		box-shadow: inset 0 1px #ffffff0d;
	}
	.install-tabs {
		display: flex;
		gap: 2px;
		padding: 6px 6px 0;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.install-tabs::-webkit-scrollbar {
		display: none;
	}
	.install-tabs button {
		padding: 5px 10px;
		height: 28px;
		font-size: 12.5px;
		font-weight: 500;
		color: var(--dt3);
		border-radius: 8px;
	}
	.install-tabs button[aria-selected='true'] {
		background: var(--surface-2);
		color: var(--text);
	}
	.command-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 6px 6px 6px 14px;
	}
	.command-line code {
		font-size: 13px;
		color: var(--dt);
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
		white-space: pre;
		user-select: all;
	}
	.command-line code span {
		color: var(--faint);
	}
	.command-line button {
		display: flex;
		align-items: center;
		gap: 5px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-radius: 9px;
		padding: 6px 10px;
		font-size: 11px;
		flex: none;
	}
	.install > a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-top: 7px;
		font-size: 12px;
	}
	:global(:root:not([data-theme='dark']):not([data-theme='glass-dark'])) .command-box {
		border-color: transparent;
		box-shadow:
			0 0 0 1px #0000000d,
			0 1px 2px #0000000a,
			0 6px 14px -8px #0000001f;
	}
	.copy-failed {
		font-size: 11px;
		color: var(--muted);
		padding: 0 8px;
	}
</style>
