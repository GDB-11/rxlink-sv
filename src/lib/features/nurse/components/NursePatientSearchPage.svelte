<!-- src/lib/features/nurse/components/NursePatientSearchPage.svelte -->
<script lang="ts">
    import { nurse } from '../stores/nurse.svelte';
    import NursePatientSearchBar from './NursePatientSearchBar.svelte';
    import NursePatientResults from './NursePatientResults.svelte';

    $effect(() => {
        return () => nurse.reset();
    });
</script>

<div class="mb-6 flex flex-col gap-3">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Buscar paciente
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Busque un paciente para consultar su historial clínico y dispensar recetas.
        </p>
    </div>
</div>

<div class="mb-4">
    <NursePatientSearchBar
        value={nurse.search}
        onsearch={(q) => nurse.searchPatients(q)}
    />
</div>

{#if nurse.error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {nurse.error}
    </div>
{/if}

<NursePatientResults
    items={nurse.results}
    loading={nurse.loading}
    search={nurse.search}
    totalCount={nurse.totalCount}
    page={nurse.page}
    totalPages={nurse.totalPages}
    onpage={(p) => nurse.setPage(p)}
/>
