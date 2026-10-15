<!-- src/lib/features/consents/components/ConsentsSection.svelte -->
<!-- Authorizations (consents) for one patient: list + record + revoke. -->
<script lang="ts">
    import { IconPlus } from '@tabler/icons-svelte';
    import type { ConsentResponse, CreateConsentBody } from '$lib/api/privacyApi';
    import PaginationControls from '$lib/components/ui/PaginationControls.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { consents } from '../stores/consents.svelte';
    import ConsentCard from './ConsentCard.svelte';
    import ConsentForm from './ConsentForm.svelte';
    import RevokeConsentModal from './RevokeConsentModal.svelte';

    interface Props {
        patientCode: string;
    }
    let { patientCode }: Props = $props();

    let formOpen     = $state(false);
    let revokeTarget = $state<ConsentResponse | null>(null);

    $effect(() => {
        consents.load(patientCode);
    });

    async function handleSubmit(body: CreateConsentBody): Promise<void> {
        if (await consents.record(body)) formOpen = false;
    }

    async function handleRevoke(reason: string): Promise<void> {
        if (!revokeTarget) return;
        if (await consents.revoke(revokeTarget.consentCode, reason)) revokeTarget = null;
    }

    function closeForm(): void {
        formOpen = false;
        consents.clearSubmitError();
    }

    function closeRevoke(): void {
        revokeTarget = null;
        consents.clearSubmitError();
    }
</script>

<section class="space-y-4">
    <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
            Consentimientos
            {#if consents.totalCount > 0}
                <span class="ml-1.5 text-sm font-normal text-stone-400 dark:text-stone-500">
                    ({consents.totalCount})
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
            Registrar consentimiento
        </button>
    </div>

    <ErrorAlert message={consents.error} />

    {#if consents.items.length === 0 && !consents.loading && !consents.error}
        <p class="rounded-xl border border-dashed border-stone-300 px-5 py-6 text-center text-sm text-stone-500
                  dark:border-stone-700 dark:text-stone-400">
            El paciente no ha dado consentimientos para usos fuera de atención, pago y operaciones.
        </p>
    {:else}
        <ul class="space-y-3">
            {#each consents.items as consent (consent.consentCode)}
                <ConsentCard {consent} onrevoke={(c) => (revokeTarget = c)} />
            {/each}
        </ul>

        {#if consents.totalPages > 1}
            <PaginationControls
                page={consents.page}
                pageSize={consents.pageSize}
                totalCount={consents.totalCount}
                totalPages={consents.totalPages}
                loading={consents.loading}
                onPageChange={(p) => consents.load(patientCode, p)}
            />
        {/if}
    {/if}
</section>

{#if formOpen}
    <ConsentForm
        submitting={consents.submitting}
        submitError={consents.submitError}
        onsubmit={handleSubmit}
        onclose={closeForm}
    />
{/if}

{#key revokeTarget?.consentCode}
    <RevokeConsentModal
        consent={revokeTarget}
        submitting={consents.submitting}
        submitError={consents.submitError}
        onsubmit={handleRevoke}
        onclose={closeRevoke}
    />
{/key}
