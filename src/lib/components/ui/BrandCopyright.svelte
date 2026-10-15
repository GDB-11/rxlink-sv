<!-- src/lib/components/ui/BrandCopyright.svelte -->
<script lang="ts">
	interface Props {
		/** Partner display name; defaults to the product name. */
		name?: string | null;
	}

	let { name = null }: Props = $props();
</script>

<p class="relative z-10 text-teal-600/70 text-xs">
	&copy; {new Date().getFullYear()} {name ?? 'RxLink'} — Uso exclusivo del personal clínico autorizado
</p>
