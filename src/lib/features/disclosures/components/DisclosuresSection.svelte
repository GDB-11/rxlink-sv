<!-- src/lib/features/disclosures/components/DisclosuresSection.svelte -->
<!-- Accounting of disclosures for one patient: list + record form. -->
<script lang="ts">
    import { IconPlus } from '@tabler/icons-svelte';
    import type { CreateDisclosureBody } from '$lib/api/privacyApi';
    import PaginationControls from '$lib/components/ui/PaginationControls.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { disclosures } from '../stores/disclosures.svelte';
    import DisclosureCard from './DisclosureCard.svelte';
    import DisclosureForm from './DisclosureForm.svelte';

    interface Props {
        patientCode: string;
    }
    let { patientCode }: Props = $props();

    let formOpen = $state(false);

    $effect(() => {
        disclosures.load(patientCode);
    });

    async function handleSubmit(body: CreateDisclosureBody): Promise<void> {
        if (await disclosures.record(body)) formOpen = false;
    }

    function closeForm(): void {
        formOpen = false;
        disclosures.clearSubmitError();
    }
</script>

<section class="space-y-4">
    <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
            Divulgaciones
            {#if disclosures.totalCount > 0}
                <span class="ml-1.5 text-sm font-normal text-stone-400 dark:text-stone-500">
                    ({disclosures.totalCount})
                </span>
            {/if}
        </h2>
        <button
            type="button"
            onclick={() => (formOpen = true)}
            class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-2
                   text-sm font-medium text-white transition-colors hover:bg-teal-600
                   dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            <IconPlus size={15} aria-hidden="true" />
            Registrar divulgación
        </button>
    </div>

    <ErrorAlert message={disclosures.error} />

    {#if disclosures.items.length === 0 && !disclosures.loading && !disclosures.error}
        <p class="rounded-xl border border-dashed border-stone-300 px-5 py-6 text-center text-sm text-stone-500
                  dark:border-stone-700 dark:text-stone-400">
            No se ha divulgado información de este paciente fuera de atención, pago y operaciones.
        </p>
    {:else}
        <ul class="space-y-3">
            {#each disclosures.items as disclosure (disclosure.disclosureCode)}
                <DisclosureCard {disclosure} />
            {/each}
        </ul>

        {#if disclosures.totalPages > 1}
            <PaginationControls
                page={disclosures.page}
                pageSize={disclosures.pageSize}
                totalCount={disclosures.totalCount}
                totalPages={disclosures.totalPages}
                loading={disclosures.loading}
                onPageChange={(p) => disclosures.load(patientCode, p)}
            />
        {/if}
    {/if}
</section>

{#if formOpen}
    <DisclosureForm
        submitting={disclosures.submitting}
        submitError={disclosures.submitError}
        onsubmit={handleSubmit}
        onclose={closeForm}
    />
{/if}
