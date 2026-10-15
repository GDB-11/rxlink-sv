<!-- src/lib/features/partner/components/PartnerLogo.svelte -->
<!-- Loads the partner identity and renders it through the generic BrandLogo. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import BrandLogo from '$lib/components/ui/BrandLogo.svelte';
	import { partner } from '../stores/partner.svelte';

	interface Props {
		variant?: 'light' | 'color';
		size?:    'xs' | 'sm' | 'md' | 'lg';
	}

	let { variant = 'light', size = 'md' }: Props = $props();

	onMount(() => {
		partner.load();
	});
</script>

<BrandLogo {variant} {size} name={partner.displayName} logoSrc={partner.logoSrc} />
