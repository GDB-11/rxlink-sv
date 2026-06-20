<!-- src/lib/features/nurse/components/NursePrescriptionCard.svelte -->
<script lang="ts">
    import type { PrescriptionSummaryResponse } from '$lib/api/diagnosticApi';

    interface Props {
        prescription: PrescriptionSummaryResponse;
        ondispense:   (prescriptionCode: string) => void;
    }
    let { prescription, ondispense }: Props = $props();

    const canDispense = $derived(prescription.statusName === 'Activo');

    function statusBadgeCls(status: string): string {
        switch (status) {
            case 'Borrador':   return 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
            case 'Activo':     return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
            case 'Suspendido': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
            case 'Cancelado':  return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
            case 'Dispensado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
            case 'Finalizado': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
            case 'Caducado':   return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
            default:           return 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
        }
    }

    function fmtDate(s: string): string {
        return new Date(s.length === 10 ? s + 'T00:00:00' : s)
            .toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
    }
</script>

<div class="mt-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3
            dark:border-stone-700 dark:bg-stone-800/50">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold {statusBadgeCls(prescription.statusName)}">
                {prescription.statusName}
            </span>
            <span class="text-xs text-stone-500 dark:text-stone-400">
                Vence: {fmtDate(prescription.validUntil)}
            </span>
            <span class="text-xs text-stone-400 dark:text-stone-500">
                · {prescription.detailCount} medicamento{prescription.detailCount !== 1 ? 's' : ''}
            </span>
        </div>

        {#if canDispense}
            <button
                type="button"
                onclick={() => ondispense(prescription.prescriptionCode)}
                class="cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium
                       text-white transition-colors hover:bg-blue-600
                       dark:bg-blue-600 dark:hover:bg-blue-700"
            >
                Dispensar
            </button>
        {/if}
    </div>
</div>
