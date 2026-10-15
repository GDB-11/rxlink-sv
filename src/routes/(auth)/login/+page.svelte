<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import MobileLogo from '$lib/components/ui/MobileLogo.svelte';
	import AuthSplitLayout from '$lib/features/auth/components/AuthSplitLayout.svelte';
	import BrandingPanel from '$lib/features/auth/components/BrandingPanel.svelte';
	import LoginForm from '$lib/features/auth/components/LoginForm.svelte';
	import { partner } from '$lib/features/partner';

	onMount(() => {
		partner.load();
	});
</script>

<svelte:head>
	<title>Iniciar sesión — RxLink</title>
</svelte:head>

<AuthSplitLayout>
	{#snippet left()}
		<BrandingPanel />
	{/snippet}

	{#snippet right()}
		<MobileLogo name={partner.displayName} logoSrc={partner.logoSrc} />
		<LoginForm />
	{/snippet}
</AuthSplitLayout>
