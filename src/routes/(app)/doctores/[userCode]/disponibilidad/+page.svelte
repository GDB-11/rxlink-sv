<!-- src/routes/(app)/doctores/[userCode]/disponibilidad/+page.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import DoctorAvailabilityPage from '$lib/features/doctor-availability/components/DoctorAvailabilityPage.svelte';

    const userCode = $derived($page.params.userCode!);
</script>

<svelte:head>
    <title>Disponibilidad — RxLink</title>
</svelte:head>

<DoctorAvailabilityPage {userCode} />
