<script lang="ts">
	import {
		ArrowRight,
		ArrowLeft,
		Plus,
		Pause,
		Play,
		Camera,
		Trash2,
		RotateCcw,
		Check,
		Circle,
		Box,
		Server,
		Trophy,
		GripVertical,
		X,
		ChevronRight
	} from '@lucide/svelte';
	import { learning, saveProgress } from '#lib/learning.svelte.js';
	import { terms, sequences } from '#lib/content/learning.js';
	let { data } = $props();
	let finished = $state(false);
	let message = $state('');
	let selectedWord = $state('');
	let matched = $state<string[]>([]);
	const pairs = $derived(
		data.unit.id === 'connections'
			? [
					{ word: 'Domain', definition: 'The public name that routes people to the application.' },
					{
						word: 'Database binding',
						definition: 'The connection that gives an application access to its records.'
					},
					{
						word: 'Persistent volume',
						definition: 'The filesystem that survives the process using it.'
					}
				]
			: terms
					.filter((term) => term.category === 'core')
					.map((term) => ({ word: term.word, definition: term.definition }))
	);
	const pairOptions = $derived([...pairs].reverse());
	let chosen = $state<string[]>([]);
	let sequenceChecked = $state(false);
	const sequence = $derived(sequences[data.unit.id] ?? []);
	const sequenceOptions = $derived([...sequence.slice(2), ...sequence.slice(0, 2)]);
	let machines = $state<{ id: number; name: string; status: 'running' | 'paused' }[]>([]);
	let nextId = 1;
	let selected = $state(0);
	let snapshot = $state<{ name: string; sourceId: number } | null>(null);
	let created = $state(false);
	let removed = $state(false);
	let restored = $state(false);
	let fleetCreated = $state(false);
	const selectedMachine = $derived(machines.find((machine) => machine.id === selected));
	const running = $derived(machines.filter((machine) => machine.status === 'running').length);
	const paused = $derived(machines.filter((machine) => machine.status === 'paused').length);
	const cost = $derived(Number((running * 2 + paused * 0.2).toFixed(1)));
	const tasks = $derived(
		data.unit.id === 'fleet'
			? [
					{ title: 'Create three machines', done: fleetCreated },
					{ title: 'Pause at least one machine', done: paused >= 1 },
					{ title: 'Keep two useful machines', done: machines.length === 2 },
					{ title: 'Bring the active cost below 3 units', done: machines.length === 2 && cost < 3 }
				]
			: [
					{ title: 'Create a sandbox', done: created },
					{ title: 'Save a snapshot', done: !!snapshot },
					{ title: 'Remove the original machine', done: removed },
					{ title: 'Restore from the saved snapshot', done: restored }
				]
	);
	const complete = $derived(
		data.unit.type === 'match'
			? matched.length === pairs.length
			: data.unit.type === 'sequence'
				? sequenceChecked
				: tasks.every((task) => task.done)
	);
	function match(word: string) {
		if (!selectedWord) {
			message = 'Choose a term on the left first.';
			return;
		}
		if (word === selectedWord) {
			matched = [...matched, word];
			message = 'That connection fits.';
			selectedWord = '';
		} else message = 'Those have different jobs. Try another connection.';
	}
	function create() {
		const machine = {
			id: nextId++,
			name: `sandbox-${String(nextId - 1).padStart(2, '0')}`,
			status: 'running' as const
		};
		machines = [...machines, machine];
		selected = machine.id;
		created = true;
		if (machines.length >= 3) fleetCreated = true;
		message = 'A new isolated machine is running.';
	}
	function remove() {
		if (!selectedMachine) return;
		machines = machines.filter((machine) => machine.id !== selected);
		if (snapshot?.sourceId === selected) removed = true;
		selected = machines[0]?.id ?? 0;
		message = 'The instance is gone. A saved snapshot remains separate.';
	}
	function restore() {
		if (!snapshot) return;
		const machine = { id: nextId++, name: snapshot.name + '-restored', status: 'running' as const };
		machines = [...machines, machine];
		selected = machine.id;
		restored = removed;
		message = 'A new instance was created from the saved state.';
	}
	function finish() {
		saveProgress('labs', data.unit.id);
		finished = true;
	}
	function reset() {
		finished = false;
		message = '';
		matched = [];
		selectedWord = '';
		chosen = [];
		sequenceChecked = false;
		machines = [];
		snapshot = null;
		created = false;
		removed = false;
		restored = false;
		fleetCreated = false;
		selected = 0;
	}
	$effect(() => {
		data.unit.id;
		reset();
	});
</script>

<a class="text-link lab-back" href="/docs/learn/games"><ArrowLeft size={12} />All learning labs</a>
<section class="lab panel">
	<header>
		<span class="pill">Interactive practice</span><span class="pill reward"
			>+${data.unit.reward}</span
		>
	</header>
	<div class="lab-heading">
		<h2 id="the-lab">{data.unit.title}</h2>
		<p>{data.unit.subtitle}</p>
	</div>
	{#if finished}<div class="lab-finished">
			<Trophy size={40} strokeWidth={1.4} />
			<h3>One more idea, understood.</h3>
			<p>Your completed unit is saved. You can replay it any time.</p>
			<div>
				<a href="/docs/learn/games" class="button primary"
					>Choose another lab<ArrowRight size={13} /></a
				><button class="button" onclick={reset}><RotateCcw size={13} />Play again</button>
			</div>
		</div>{:else if data.unit.type === 'match'}<div class="match-game">
			<p class="instruction">Choose a term, then choose the description that belongs to it.</p>
			<div class="matching-columns">
				<div>
					{#each pairs as pair}<button
							disabled={matched.includes(pair.word)}
							class:chosen={selectedWord === pair.word}
							class:matched={matched.includes(pair.word)}
							onclick={() => {
								selectedWord = pair.word;
								message = '';
							}}
							>{pair.word}{#if matched.includes(pair.word)}<Check size={15} />{:else}<ChevronRight
									size={14}
								/>{/if}</button
						>{/each}
				</div>
				<div>
					{#each pairOptions as pair}<button
							disabled={matched.includes(pair.word)}
							class:matched={matched.includes(pair.word)}
							onclick={() => match(pair.word)}
							>{pair.definition}{#if matched.includes(pair.word)}<Check size={14} />{/if}</button
						>{/each}
				</div>
			</div>
			<div class="match-progress">{matched.length} of {pairs.length} connections made</div>
		</div>{:else if data.unit.type === 'sequence'}<div class="sequence-game">
			<p class="instruction">
				Build the workflow in order. Click a step to add it; remove a step to change your answer.
			</p>
			<div class="chosen-steps" aria-label="Your workflow">
				{#if !chosen.length}<p>Your workflow starts here.</p>{/if}{#each chosen as step, i}<button
						onclick={() => {
							chosen = chosen.filter((item) => item !== step);
							sequenceChecked = false;
						}}
						disabled={sequenceChecked}><span>{i + 1}</span>{step}<X size={13} /></button
					>{/each}
			</div>
			<div class="available-steps">
				{#each sequenceOptions.filter((step) => !chosen.includes(step)) as step}<button
						onclick={() => {
							chosen = [...chosen, step];
							message = '';
						}}><Plus size={13} />{step}</button
					>{/each}
			</div>
			<button
				class="button"
				disabled={chosen.length !== sequence.length || sequenceChecked}
				onclick={() => {
					sequenceChecked = chosen.every((step, i) => step === sequence[i]);
					message = sequenceChecked
						? 'This workflow keeps building, verification and publishing in the right order.'
						: 'Look at the dependencies. What has to exist before the next action can happen?';
				}}><Check size={13} />Check the workflow</button
			>
		</div>{:else}<div class="sandbox-game">
			<div class="lab-toolbar">
				<div><span class="machine-status"></span>Local simulation</div>
				<span>{machines.length} machines · <b>{cost}</b> cost units</span>
			</div>
			<div class="machine-area">
				{#each machines as machine}<button
						class="machine"
						class:selected={selected === machine.id}
						class:paused={machine.status === 'paused'}
						onclick={() => (selected = machine.id)}
						><Server size={29} strokeWidth={1.25} /><strong>{machine.name}</strong><span
							><i></i>{machine.status}</span
						></button
					>{/each}{#if machines.length < 4}<button class="add-machine" onclick={create}
						><Plus size={25} /><span>Create sandbox</span></button
					>{/if}
			</div>
			<div class="machine-controls">
				<button
					class="button"
					disabled={!selectedMachine}
					onclick={() => {
						if (selectedMachine) {
							selectedMachine.status = selectedMachine.status === 'running' ? 'paused' : 'running';
							message = 'Pausing reduces active compute while retaining the instance.';
						}
					}}
					>{#if selectedMachine?.status === 'paused'}<Play size={12} />Resume{:else}<Pause
							size={12}
						/>Pause{/if}</button
				><button
					class="button"
					disabled={!selectedMachine}
					onclick={() => {
						if (selectedMachine) {
							snapshot = { name: selectedMachine.name, sourceId: selectedMachine.id };
							removed = false;
							restored = false;
							message = 'The recovery point is saved independently of the active instance.';
						}
					}}><Camera size={13} />Snapshot</button
				><button class="button" disabled={!selectedMachine} onclick={remove}
					><Trash2 size={12} />Remove</button
				><button class="button" disabled={!snapshot || machines.length >= 4} onclick={restore}
					><RotateCcw size={12} />Restore</button
				>
			</div>
			{#if snapshot}<div class="snapshot-label">
					<Camera size={12} />Saved snapshot: {snapshot.name}
				</div>{/if}
			<div class="lab-tasks">
				{#each tasks as task}<div class:done={task.done}>
						{#if task.done}<Check size={14} />{:else}<Circle size={14} />{/if}{task.title}
					</div>{/each}
			</div>
		</div>{/if}{#if !finished}<div class="lab-message" role="status">
			{message || 'Explore the controls. Nothing here changes a real cloud resource.'}
		</div>
		<div class="lab-bottom">
			<button class="text-link" onclick={reset}><RotateCcw size={12} />Start over</button><button
				class="button primary"
				disabled={!complete}
				onclick={finish}>Complete this lab<Check size={13} /></button
			>
		</div>{/if}
</section>
<p class="lab-disclaimer">
	{learning.labs.includes(data.unit.id)
		? 'You have completed this unit. Replaying does not add credits again.'
		: 'Complete the exercise to save this unit to your local learning progress.'}
</p>

<style>
	.lab-back {
		margin: 10px 0 22px;
		color: var(--muted);
	}
	.lab {
		overflow: hidden;
	}
	.lab > header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 17px 22px;
		border-bottom: 1px solid var(--border);
	}
	.lab-heading {
		padding: 24px 24px 0;
	}
	.lab-heading h2 {
		font-size: 25px;
		margin: 0 0 9px;
	}
	.lab-heading p {
		font-size: 13px;
		color: var(--muted);
		margin: 0;
		line-height: 1.8;
	}
	.instruction {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.8;
		margin-bottom: 20px;
	}
	.match-game,
	.sequence-game,
	.sandbox-game {
		padding: 23px;
	}
	.matching-columns {
		display: grid;
		grid-template-columns: 0.8fr 1.4fr;
		gap: 18px;
	}
	.matching-columns > div {
		display: flex;
		flex-direction: column;
		gap: 9px;
	}
	.matching-columns button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		text-align: left;
		min-height: 67px;
		font-size: 12px;
		line-height: 1.65;
		padding: 12px 14px;
		border: 1px solid var(--border);
		border-radius: 9px;
	}
	.matching-columns > div:first-child button {
		font-weight: 550;
	}
	.matching-columns button.chosen {
		background: var(--hover);
		border-color: var(--text);
	}
	.matching-columns button.matched {
		background: var(--green-bg);
		color: var(--green);
		border-color: transparent;
		opacity: 1;
	}
	.match-progress {
		font-size: 10px;
		color: var(--muted);
		margin-top: 20px;
	}
	.chosen-steps {
		min-height: 160px;
		padding: 14px;
		background: var(--surface-2);
		border: 1px dashed var(--border);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 17px;
	}
	.chosen-steps > p {
		font-size: 12px;
		color: var(--muted);
		margin: auto;
		text-align: center;
	}
	.chosen-steps button {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 12px;
		border: 1px solid var(--border);
		border-radius: 7px;
		background: var(--surface);
		text-align: left;
		font-size: 12px;
	}
	.chosen-steps button > span {
		font-size: 10px;
		color: var(--muted);
	}
	.chosen-steps button > :global(svg) {
		margin-left: auto;
	}
	.available-steps {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 19px;
	}
	.available-steps button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 7px;
		font-size: 11px;
	}
	.available-steps button:hover {
		background: var(--hover);
	}
	.lab-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		border: 1px solid var(--border);
		padding: 10px 13px;
		border-radius: 9px 9px 0 0;
		background: var(--surface-2);
		font-size: 10px;
		color: var(--muted);
	}
	.lab-toolbar > div {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.machine-status {
		width: 5px;
		height: 5px;
		background: var(--green);
		border-radius: 50%;
	}
	.machine-area {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 13px;
		padding: 20px;
		min-height: 185px;
		border: 1px solid var(--border);
		border-top: 0;
		border-radius: 0 0 10px 10px;
		background: var(--surface-2);
	}
	.machine,
	.add-machine {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-height: 130px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		padding: 15px;
	}
	.machine.selected {
		border-color: var(--text);
	}
	.machine strong {
		font-size: 11px;
		font-weight: 500;
	}
	.machine > span {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 9px;
		color: var(--green);
	}
	.machine i {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--green);
	}
	.machine.paused > span {
		color: var(--muted);
	}
	.machine.paused i {
		background: var(--muted);
	}
	.add-machine {
		border-style: dashed;
		color: var(--muted);
		font-size: 11px;
		background: transparent;
	}
	.machine-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin-top: 13px;
	}
	.machine-controls .button {
		font-size: 10px;
		padding: 7px 10px;
		min-height: 30px;
	}
	.snapshot-label {
		display: flex;
		gap: 6px;
		align-items: center;
		font-size: 10px;
		color: var(--muted);
		margin-top: 13px;
	}
	.lab-tasks {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-top: 24px;
		padding-top: 20px;
		border-top: 1px solid var(--border);
	}
	.lab-tasks > div {
		display: flex;
		align-items: flex-start;
		gap: 7px;
		font-size: 10px;
		color: var(--muted);
	}
	.lab-tasks > div.done {
		color: var(--green);
	}
	.lab-message {
		padding: 14px 23px;
		background: var(--surface-2);
		border-top: 1px solid var(--border);
		font-size: 11px;
		color: var(--muted);
		line-height: 1.7;
	}
	.lab-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 18px 23px;
	}
	.lab-bottom .text-link {
		font-size: 10px;
		color: var(--muted);
	}
	.lab-bottom .button {
		font-size: 11px;
	}
	.lab-finished {
		text-align: center;
		padding: 40px 25px;
	}
	.lab-finished > :global(svg) {
		color: var(--green);
	}
	.lab-finished h3 {
		font-size: 25px;
	}
	.lab-finished p {
		font-size: 13px;
		color: var(--muted);
	}
	.lab-finished > div {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-top: 24px;
		flex-wrap: wrap;
	}
	.lab-disclaimer {
		font-size: 11px;
		color: var(--muted);
		margin-top: 15px;
		line-height: 1.8;
	}
	@media (max-width: 550px) {
		.lab-heading {
			padding: 22px 17px 0;
		}
		.match-game,
		.sequence-game,
		.sandbox-game {
			padding: 20px 16px;
		}
		.matching-columns {
			grid-template-columns: 0.7fr 1fr;
			gap: 9px;
		}
		.matching-columns button {
			font-size: 10px;
			padding: 10px;
			min-height: 90px;
		}
		.machine-area {
			padding: 12px;
			gap: 9px;
		}
		.machine {
			padding: 10px;
		}
		.lab-toolbar {
			font-size: 9px;
		}
		.lab-tasks {
			grid-template-columns: 1fr;
		}
		.lab-bottom {
			padding: 15px;
		}
		.lab-heading h2 {
			font-size: 22px;
		}
	}
</style>
