<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
	import MobileLogo from '$lib/components/ui/MobileLogo.svelte';
	import AuthSplitLayout from '$lib/features/auth/components/AuthSplitLayout.svelte';
	import BrandingPanel from '$lib/features/auth/components/BrandingPanel.svelte';
	import LoginForm from '$lib/features/auth/components/LoginForm.svelte';
</script>

<svelte:head>
	<title>Iniciar sesión — RxLink</title>
</svelte:head>

<AuthSplitLayout>
	{#snippet left()}
		<BrandingPanel />
	{/snippet}

	{#snippet right()}
		<MobileLogo />
		<LoginForm />
	{/snippet}
</AuthSplitLayout>
