<!-- src/lib/features/partner/components/PartnerIdentityCard.svelte -->
<!-- Read-only identity (name, logo) owned by the partner registry. -->
<script lang="ts">
	import type { PublicPartnerConfigResponse } from '$lib/api/partnerApi';
	import { partnerApi } from '$lib/api/partnerApi';

	interface Props {
		identity: PublicPartnerConfigResponse;
	}

	let { identity }: Props = $props();

	const logoSrc = $derived(partnerApi.resolveLogoUrl(identity.logoUrl));
</script>

<section
	class="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900"
>
	{#if logoSrc}
		<img src={logoSrc} alt="Logo de {identity.displayName}" class="h-14 w-14 rounded-lg object-contain" />
	{/if}
	<div class="min-w-0">
		<p class="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-stone-400">
			Identidad
		</p>
		<p class="truncate text-lg font-semibold text-stone-900 dark:text-stone-50">
			{identity.displayName}
		</p>
		<p class="text-xs text-stone-500 dark:text-stone-400">
			El nombre y el logo los administra RxLink y no se pueden editar aquí.
		</p>
	</div>
</section>
