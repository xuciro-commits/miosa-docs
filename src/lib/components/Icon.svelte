<script lang="ts">
	import {
		BookOpen,
		Box,
		Server,
		Layers,
		Network,
		Plug,
		Rocket,
		GraduationCap,
		CircleDollarSign,
		Monitor,
		Code,
		Terminal,
		Database,
		Globe,
		ShieldCheck,
		Settings,
		BookText,
		Play,
		Blocks,
		FileText
	} from '@lucide/svelte';
	let { name = 'book', size = 16 }: { name?: string; size?: number } = $props();
	const icons = {
		book: BookOpen,
		box: Box,
		server: Server,
		layers: Layers,
		network: Network,
		plug: Plug,
		rocket: Rocket,
		learn: GraduationCap,
		earn: CircleDollarSign,
		monitor: Monitor,
		code: Code,
		terminal: Terminal,
		database: Database,
		globe: Globe,
		shield: ShieldCheck,
		settings: Settings,
		words: BookText,
		play: Play,
		blocks: Blocks,
		file: FileText
	};
	const Glyph = $derived(icons[name as keyof typeof icons] ?? FileText);
</script>

<Glyph {size} strokeWidth={1.55} aria-hidden="true" />
