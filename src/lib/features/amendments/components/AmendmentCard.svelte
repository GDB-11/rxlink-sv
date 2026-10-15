<!-- src/lib/features/amendments/components/AmendmentCard.svelte -->
<script lang="ts">
    import type { AmendmentResponse } from '$lib/api/privacyApi';
    import AmendmentStatusBadge from './AmendmentStatusBadge.svelte';
    import { targetAreaLabel } from '../labels';

    interface Props {
        amendment: AmendmentResponse;
        ondecide: (amendment: AmendmentResponse) => void;
    }
    let { amendment, ondecide }: Props = $props();

    const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<article class="space-y-3 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
    <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
            <a
                href="/pacientes/{amendment.patientCode}"
                class="text-sm font-semibold text-stone-900 hover:text-teal-700 dark:text-stone-50 dark:hover:text-teal-400"
            >
                {amendment.patientName}
            </a>
            <p class="text-xs text-stone-500 dark:text-stone-400">
                HC {amendment.medicalRecordNumber} · {targetAreaLabel(amendment.targetArea)} ·
                {dateFormat.format(new Date(amendment.requestedAt))}
            </p>
        </div>
        <AmendmentStatusBadge status={amendment.status} />
    </header>

    <div>
        <p class="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-stone-400">
            Solicitud del paciente
        </p>
        <p class="mt-1 text-sm whitespace-pre-line text-stone-800 dark:text-stone-200">
            {amendment.requestedChange}
        </p>
    </div>

    {#if amendment.status === 'Pendiente'}
        <button
            type="button"
            onclick={() => ondecide(amendment)}
            class="cursor-pointer rounded-lg bg-teal-500 px-3 py-2 text-sm font-medium text-white
                   transition-colors hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            Resolver
        </button>
    {:else}
        <div class="space-y-2 border-t border-stone-200 pt-3 dark:border-stone-700">
            <p class="text-xs text-stone-500 dark:text-stone-400">
                {amendment.status} por {amendment.reviewedByName}
                {#if amendment.reviewedAt}· {dateFormat.format(new Date(amendment.reviewedAt))}{/if}
            </p>
            <p class="text-sm text-stone-700 dark:text-stone-300">
                <span class="font-medium">Motivo:</span> {amendment.decisionReason}
            </p>
            {#if amendment.amendmentText}
                <p class="text-sm text-stone-700 dark:text-stone-300">
                    <span class="font-medium">Agregado a la historia:</span> {amendment.amendmentText}
                </p>
            {/if}
        </div>
    {/if}
</article>
