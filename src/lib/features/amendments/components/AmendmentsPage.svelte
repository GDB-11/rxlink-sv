<!-- src/lib/features/amendments/components/AmendmentsPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { AmendmentResponse, AmendmentStatus, DecideAmendmentBody } from '$lib/api/privacyApi';
    import TabBar from '$lib/components/ui/TabBar.svelte';
    import PaginationControls from '$lib/components/ui/PaginationControls.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { amendments } from '../stores/amendments.svelte';
    import AmendmentCard from './AmendmentCard.svelte';
    import DecideAmendmentModal from './DecideAmendmentModal.svelte';

    type Filter = 'Pendiente' | 'todas';

    const TABS: { id: Filter; label: string }[] = [
        { id: 'Pendiente', label: 'Pendientes' },
        { id: 'todas', label: 'Todas' }
    ];

    let target = $state<AmendmentResponse | null>(null);

    const filter = $derived<Filter>(amendments.status === 'Pendiente' ? 'Pendiente' : 'todas');

    onMount(() => {
        amendments.setStatus('Pendiente');
    });

    function selectFilter(id: Filter): void {
        const status: AmendmentStatus | null = id === 'Pendiente' ? 'Pendiente' : null;
        amendments.setStatus(status);
    }

    async function handleSubmit(body: DecideAmendmentBody): Promise<void> {
        if (!target) return;
        if (await amendments.decide(target.amendmentRequestCode, body)) target = null;
    }

    function close(): void {
        target = null;
        amendments.clearSubmitError();
    }
</script>

<div class="mx-auto max-w-4xl space-y-6">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Solicitudes de enmienda
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Correcciones a la historia clínica pedidas por los pacientes
        </p>
    </div>

    <TabBar tabs={TABS} active={filter} label="Filtro de solicitudes" onselect={selectFilter} />

    <ErrorAlert message={amendments.error} />

    {#if amendments.loading && amendments.items.length === 0}
        <div class="h-40 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-700"></div>
    {:else if amendments.items.length === 0 && !amendments.error}
        <p class="rounded-xl border border-dashed border-stone-300 px-5 py-10 text-center text-sm text-stone-500
                  dark:border-stone-700 dark:text-stone-400">
            {filter === 'Pendiente' ? 'No hay solicitudes pendientes.' : 'Aún no hay solicitudes.'}
        </p>
    {:else}
        <div class="space-y-4">
            {#each amendments.items as amendment (amendment.amendmentRequestCode)}
                <AmendmentCard {amendment} ondecide={(a) => (target = a)} />
            {/each}
        </div>

        <PaginationControls
            page={amendments.page}
            pageSize={amendments.pageSize}
            totalCount={amendments.totalCount}
            totalPages={amendments.totalPages}
            loading={amendments.loading}
            onPageChange={(p) => amendments.load(p)}
        />
    {/if}
</div>

{#key target?.amendmentRequestCode}
    <DecideAmendmentModal
        amendment={target}
        submitting={amendments.submitting}
        submitError={amendments.submitError}
        onsubmit={handleSubmit}
        onclose={close}
    />
{/key}
