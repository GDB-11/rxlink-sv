<!-- src/lib/components/ui/MobileLogo.svelte -->
<script lang="ts">
	import BrandLogo from './BrandLogo.svelte';

	interface Props {
		name?:    string | null;
		logoSrc?: string | null;
	}

	let { name = null, logoSrc = null }: Props = $props();
</script>

<div class="mb-10 text-center md:hidden">
	<div class="flex items-baseline justify-center">
		<BrandLogo variant="color" size="md" {name} {logoSrc} />
	</div>
	<p class="mt-1.5 text-sm text-stone-500 dark:text-stone-400">Sistema clínico de recetas</p>
</div>
