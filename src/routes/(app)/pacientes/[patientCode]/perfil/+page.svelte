<!-- src/routes/(app)/pacientes/[patientCode]/perfil/+page.svelte -->
<script lang="ts">
    import { page } from '$app/state';
    import MedicalProfilePage from '$lib/features/medical-profile/components/MedicalProfilePage.svelte';
</script>

<svelte:head>
    <title>Perfil médico — RxLink</title>
</svelte:head>

<MedicalProfilePage patientCode={page.params.patientCode!} />
