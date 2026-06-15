<!-- src/lib/features/doctor-availability/components/DoctorsPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { userApi, type UserResponse } from '$lib/api/userApi';
    import DoctorTable from './DoctorTable.svelte';

    let items   = $state<UserResponse[]>([]);
    let loading = $state(false);
    let error   = $state<string | null>(null);

    onMount(async () => {
        loading = true;
        error   = null;
        try {
            const data = await userApi.getPage(1, 50, undefined, 'Doctor');
            items = data.items;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Error al cargar los doctores.';
        } finally {
            loading = false;
        }
    });
</script>

<div class="mb-6">
    <h1
        class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
        style="font-family: 'Instrument Serif', serif;"
    >
        Doctores
    </h1>
    <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
        Directorio de doctores activos
    </p>
</div>

{#if error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {error}
    </div>
{/if}

<DoctorTable {items} {loading} />
