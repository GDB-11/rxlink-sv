<script lang="ts">
    import { auth } from '$lib/features/auth';
    import { AdminDashboard, DoctorDashboard, NurseDashboard } from '$lib/features/inicio';
</script>

<svelte:head>
    <title>Inicio — RxLink</title>
</svelte:head>

{#if auth.roleName === 'Administrador'}
    <AdminDashboard />
{:else if auth.roleName === 'Doctor'}
    <DoctorDashboard />
{:else if auth.roleName === 'Enfermero'}
    <NurseDashboard />
{/if}
