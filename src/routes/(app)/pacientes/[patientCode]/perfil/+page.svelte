<!-- src/routes/(app)/pacientes/[patientCode]/perfil/+page.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import MedicalProfilePage from '$lib/features/medical-profile/components/MedicalProfilePage.svelte';

    const patientCode = $derived($page.params.patientCode);
</script>

<svelte:head>
    <title>Perfil médico — RxLink</title>
</svelte:head>

<MedicalProfilePage {patientCode} />
