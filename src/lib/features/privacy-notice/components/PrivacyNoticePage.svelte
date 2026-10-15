<!-- src/lib/features/privacy-notice/components/PrivacyNoticePage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconPlus } from '@tabler/icons-svelte';
    import type { PublishPrivacyNoticeBody } from '$lib/api/privacyApi';
    import PaginationControls from '$lib/components/ui/PaginationControls.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { privacyNoticeVersions } from '../stores/privacyNoticeVersions.svelte';
    import PrivacyNoticeVersionCard from './PrivacyNoticeVersionCard.svelte';
    import PublishPrivacyNoticeModal from './PublishPrivacyNoticeModal.svelte';

    let formOpen = $state(false);

    onMount(() => {
        privacyNoticeVersions.load(1);
    });

    async function handleSubmit(body: PublishPrivacyNoticeBody): Promise<void> {
        if (await privacyNoticeVersions.publish(body)) formOpen = false;
    }

    function closeForm(): void {
        formOpen = false;
        privacyNoticeVersions.clearSubmitError();
    }
</script>

<div class="mx-auto max-w-4xl space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
            <h1
                class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
                style="font-family: 'Instrument Serif', serif;"
            >
                Aviso de privacidad
            </h1>
            <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                Versiones del aviso de prácticas de privacidad que los pacientes deben confirmar
            </p>
        </div>
        <button
            type="button"
            onclick={() => (formOpen = true)}
            class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-2
                   text-sm font-medium text-white transition-colors hover:bg-teal-600
                   dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            <IconPlus size={15} aria-hidden="true" />
            Publicar nueva versión
        </button>
    </div>

    <ErrorAlert message={privacyNoticeVersions.error} />

    {#if privacyNoticeVersions.loading && privacyNoticeVersions.items.length === 0}
        <div class="h-40 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-700"></div>
    {:else if privacyNoticeVersions.items.length === 0 && !privacyNoticeVersions.error}
        <p class="rounded-xl border border-dashed border-stone-300 px-5 py-10 text-center text-sm text-stone-500
                  dark:border-stone-700 dark:text-stone-400">
            Aún no se ha publicado ningún aviso de privacidad.
        </p>
    {:else}
        <div class="space-y-4">
            {#each privacyNoticeVersions.items as notice (notice.privacyNoticeCode)}
                <PrivacyNoticeVersionCard {notice} />
            {/each}
        </div>

        <PaginationControls
            page={privacyNoticeVersions.page}
            pageSize={privacyNoticeVersions.pageSize}
            totalCount={privacyNoticeVersions.totalCount}
            totalPages={privacyNoticeVersions.totalPages}
            loading={privacyNoticeVersions.loading}
            onPageChange={(p) => privacyNoticeVersions.load(p)}
        />
    {/if}
</div>

{#if formOpen}
    <PublishPrivacyNoticeModal
        submitting={privacyNoticeVersions.submitting}
        submitError={privacyNoticeVersions.submitError}
        onsubmit={handleSubmit}
        onclose={closeForm}
    />
{/if}
