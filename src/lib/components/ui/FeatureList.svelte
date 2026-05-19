<!-- src/lib/components/ui/FeatureList.svelte -->
<script lang="ts">
	interface Props {
		items: string[];
	}

	let { items }: Props = $props();
</script>

<ul class="space-y-3">
	{#each items as item}
		<li class="flex items-start gap-3 text-sm leading-relaxed text-teal-200/70">
			<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400/70" aria-hidden="true"
			></span>
			{item}
		</li>
	{/each}
</ul>
