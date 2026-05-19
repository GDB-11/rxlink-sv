<!-- src/lib/features/auth/components/BrandingPanel.svelte -->
<script lang="ts">
	import BrandCopyright from '$lib/components/ui/BrandCopyright.svelte';
	import BrandLogo from '$lib/components/ui/BrandLogo.svelte';
	import BrandQuote from '$lib/components/ui/BrandQuote.svelte';
	import CrossPattern from '$lib/components/ui/CrossPattern.svelte';
	import DecorativeRings from '$lib/components/ui/DecorativeRings.svelte';
	import FeatureList from '$lib/components/ui/FeatureList.svelte';

	const features = [
		'Gestión segura de recetas médicas',
		'Control de medicamentos e historial clínico',
		'Roles para médicos, enfermeros y administradores'
	];
</script>

<div
	class="relative flex h-full
           w-full flex-col
           justify-between overflow-hidden
           bg-teal-900 px-10
           py-12 lg:px-14 lg:py-14 dark:bg-teal-950"
>
	<CrossPattern />
	<DecorativeRings />

	<!-- Logo -->
	<div class="relative z-10 space-y-1.5">
		<BrandLogo variant="light" size="lg" />
		<p class="text-sm tracking-wide text-teal-400/80">Sistema clínico de recetas</p>
	</div>

	<!-- Quote + features -->
	<div class="relative z-10 space-y-8">
		<BrandQuote />
		<FeatureList items={features} />
	</div>

	<BrandCopyright />
</div>
