<!-- src/lib/features/nurse/components/DispenseQuantityFields.svelte -->
<!-- One quantity input per prescription line; the nurse confirms what is handed over. -->
<script lang="ts">
    import type { PrescriptionDetailResponse } from '$lib/api/prescriptionApi';

    interface Props {
        details:    PrescriptionDetailResponse[];
        /** Quantity per prescriptionDetailCode; null while the field is empty. */
        quantities: Record<string, number | null>;
        disabled?:  boolean;
    }
    let { details, quantities = $bindable(), disabled = false }: Props = $props();
</script>

<ul class="mt-4 space-y-3">
    {#each details as d (d.prescriptionDetailCode)}
        <li class="flex items-center justify-between gap-3">
            <label for="dispense-qty-{d.prescriptionDetailCode}" class="min-w-0 text-sm">
                <span class="block truncate font-medium text-stone-900 dark:text-stone-100">{d.medicationName}</span>
                <span class="block truncate text-xs text-stone-500 dark:text-stone-400">
                    {d.dose} · {d.frequencyDescription} · {d.durationDays} d
                </span>
            </label>
            <input
                id="dispense-qty-{d.prescriptionDetailCode}"
                type="number"
                min="0.001"
                step="any"
                inputmode="decimal"
                {disabled}
                bind:value={quantities[d.prescriptionDetailCode]}
                class="w-24 shrink-0 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-right text-sm
                       text-stone-900 focus:border-blue-500 focus:outline-none
                       disabled:cursor-not-allowed disabled:opacity-50
                       dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
        </li>
    {/each}
</ul>
