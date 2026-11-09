<script lang="ts">
	import CodeTabs from './CodeTabs.svelte';
	import { SlidersHorizontal } from '@lucide/svelte';
	let workspace = $state('my-workspace');
	let name = $state('hello-world');
	const examples = $derived({
		TypeScript: `const sandbox = await miosa.sandboxes.create({\n  workspaceSlug: ${JSON.stringify(workspace)},\n  name: ${JSON.stringify(name)},\n  templateId: "miosa-sandbox",\n});`,
		Python: `sandbox = client.sandboxes.create(\n    workspace_slug=${JSON.stringify(workspace)},\n    name=${JSON.stringify(name)},\n    template_id="miosa-sandbox",\n)`
	});
</script>

<div class="request-builder">
	<div class="builder-title"><SlidersHorizontal size={14} />Make the example yours</div>
	<div class="fields">
		<label
			>Workspace<input bind:value={workspace} maxlength={60} placeholder="my-workspace" /></label
		><label>Sandbox name<input bind:value={name} maxlength={60} placeholder="hello-world" /></label>
	</div>
	<CodeTabs {examples} />
	<p>These fields update the example. They do not send a request.</p>
</div>

<style>
	.request-builder {
		margin: 25px 0;
	}
	.builder-title {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 12px;
		font-weight: 550;
		margin-bottom: 12px;
	}
	.fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	label {
		font-size: 11px;
		color: var(--muted);
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	input {
		height: 35px;
		border: 1px solid var(--border);
		border-radius: 7px;
		padding: 0 10px;
		background: var(--surface);
		font-size: 12px;
		min-width: 0;
	}
	p {
		font-size: 11px;
		color: var(--muted);
		margin-top: -10px !important;
	}
	@media (max-width: 450px) {
		.fields {
			grid-template-columns: 1fr;
		}
	}
</style>
