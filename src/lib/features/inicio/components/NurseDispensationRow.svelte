<!-- src/lib/features/inicio/components/NurseDispensationRow.svelte -->
<script lang="ts">
    import type { NurseDispensationResponse } from '$lib/api/prescriptionApi';

    interface Props {
        dispensation: NurseDispensationResponse;
    }
    let { dispensation }: Props = $props();

    const time = $derived(
        new Date(dispensation.dispensedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    );
</script>

<div class="flex items-start gap-4 py-3">
    <div class="flex w-16 shrink-0 flex-col items-center rounded-xl bg-teal-50 py-2 dark:bg-teal-900/30">
        <span class="text-xs text-teal-600 dark:text-teal-400">dispensado</span>
        <span class="text-base font-semibold text-teal-700 dark:text-teal-300">{time}</span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
            {dispensation.patientNames} {dispensation.patientSurnames}
        </span>
        <span class="truncate text-xs text-stone-500 dark:text-stone-400">
            {dispensation.diagnosticDescription}
        </span>
        <span class="truncate text-xs text-stone-400 dark:text-stone-500">
            {dispensation.medicationNames}
        </span>
    </div>

    <span class="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium
                 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
        {dispensation.detailCount} med.
    </span>
</div>
