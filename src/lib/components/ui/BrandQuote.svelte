<!-- src/lib/components/ui/BrandQuote.svelte -->
<script lang="ts">
	interface Props {
		text?: string;
	}

	let { text = 'La precisión en la prescripción protege la vida del paciente.' }: Props = $props();
</script>

<blockquote
	style="font-family: 'Instrument Serif', serif;"
	class="text-xl leading-relaxed text-white/75 italic"
>
	"{text}"
</blockquote>
