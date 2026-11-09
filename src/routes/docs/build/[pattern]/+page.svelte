<script lang="ts">
 import RequestBuilder from '#lib/components/RequestBuilder.svelte';import Callout from '#lib/components/Callout.svelte';
 let {data}=$props();const computer=$derived(/computer|desktop|browser|persistent/.test(data.product.blurb));
</script>
<Callout title="A reusable product pattern">This local guide explains the resource pattern behind {data.product.name}. It does not connect to that product or provision MIOSA infrastructure.</Callout>
<h2>Choose the environment</h2><p>{data.product.blurb}</p><p>{computer?'Use a persistent computer when the agent needs a visual desktop, a browser session, or human handoff. Keep the computer identity separate from an individual run.':'Give each task an isolated sandbox with its own working directory, dependencies, and preview. Track the run separately so its events and results can be inspected.'}</p>
<h2>Create the workspace</h2><p>Choose a workspace and a name for this product’s environment. The example updates when these parameters change.</p><RequestBuilder/>
<h2>Run, observe, and publish</h2><ol><li>Authenticate your user and choose the environment that belongs to the task.</li><li>Start the agent, stream its events, and keep the produced files with the run.</li><li>Expose a preview for review. Give a human control when the task needs a decision.</li><li>Save a snapshot before a risky change. Publish a verified version as a separate deployment.</li></ol>
<h2>Continue building</h2><p><a href={computer?'/docs/computers':'/docs/sandboxes'}>Read the environment guide</a> · <a href="/docs/agents">Agent runs and events</a> · <a href="/docs/deployments">Publish a version</a></p><p><a href={`https://miosa.ai${data.product.href}`} target="_blank" rel="noreferrer">Read MIOSA’s original {data.product.name} recipe ↗</a></p>
