<!-- src/lib/features/doctor-consultations/components/AppointmentTable.svelte -->
<script lang="ts">
    import type { AppointmentResponse } from '$lib/api/appointmentApi';
    import AppointmentRow from './AppointmentRow.svelte';

    interface Props {
        items:   AppointmentResponse[];
        loading: boolean;
    }
    let { items, loading }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Paciente</th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 sm:table-cell">Fecha</th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 md:table-cell">Hora</th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 lg:table-cell">Tipo</th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Estado</th>
                <th class="px-4 py-3 text-right font-medium text-stone-600 dark:text-stone-400">Acción</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
            {#if loading}
                {#each skeletonRows as n (n)}
                    <tr>
                        <td class="px-4 py-3">
                            <div class="h-4 w-40 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 sm:table-cell">
                            <div class="h-4 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            <div class="h-4 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 lg:table-cell">
                            <div class="h-4 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="h-5 w-20 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3"></td>
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="6" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-500 dark:text-stone-400">No se encontraron citas.</p>
                    </td>
                </tr>
            {:else}
                {#each items as item (item.appointmentCode)}
                    <AppointmentRow {item} />
                {/each}
            {/if}
        </tbody>
    </table>
</div>
