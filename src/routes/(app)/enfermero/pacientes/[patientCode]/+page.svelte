<script lang="ts">
    import { page } from '$app/state';
    import NurseClinicalPage from '$lib/features/nurse/components/NurseClinicalPage.svelte';
</script>

<svelte:head>
    <title>Historial clínico — RxLink</title>
</svelte:head>

<NurseClinicalPage patientCode={page.params.patientCode!} />
