<!-- src/lib/features/doctor-consultations/components/AppointmentRow.svelte -->
<script lang="ts">
    import type { AppointmentResponse } from '$lib/api/appointmentApi';
    import AppointmentStatusBadge from './AppointmentStatusBadge.svelte';

    interface Props {
        item:      AppointmentResponse;
        onnoshow:  (code: string) => Promise<string | null>;
    }
    let { item, onnoshow }: Props = $props();

    const isConfirmed = $derived(item.statusName === 'Confirmado');

    let confirming  = $state(false);
    let submitting  = $state(false);
    let rowError    = $state<string | null>(null);

    function fmtDate(s: string): string {
        return new Date(s + 'T00:00:00').toLocaleDateString('es-PE', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    async function handleNoShow(): Promise<void> {
        submitting = true;
        rowError   = null;
        const err  = await onnoshow(item.appointmentCode);
        submitting = false;
        confirming = false;
        if (err) rowError = err;
    }
</script>

<tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
    <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
        {item.patientSurnames}, {item.patientNames}
    </td>
    <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 sm:table-cell">
        {fmtDate(item.date)}
    </td>
    <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 md:table-cell">
        {item.time}
    </td>
    <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 lg:table-cell">
        {item.consultationTypeName}
    </td>
    <td class="px-4 py-3">
        <AppointmentStatusBadge statusName={item.statusName} />
    </td>
    <td class="px-4 py-3 text-right">
        {#if rowError}
            <p class="mb-1 text-xs text-rose-600 dark:text-rose-400">{rowError}</p>
        {/if}

        {#if confirming}
            <div class="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onclick={() => { confirming = false; rowError = null; }}
                    disabled={submitting}
                    class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium
                           text-stone-600 transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onclick={handleNoShow}
                    disabled={submitting}
                    class="cursor-pointer rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium
                           text-white transition-colors hover:bg-amber-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-amber-600 dark:hover:bg-amber-700"
                >
                    {submitting ? 'Marcando…' : 'Sí, marcar'}
                </button>
            </div>
        {:else if isConfirmed}
            <div class="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onclick={() => { confirming = true; rowError = null; }}
                    class="cursor-pointer rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium
                           text-amber-700 transition-colors hover:bg-amber-50
                           dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
                >
                    No asistió
                </button>
                <a
                    href="/consultas/{item.appointmentCode}"
                    class="inline-flex items-center rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium
                           text-white transition-colors hover:bg-teal-600
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    Iniciar consulta
                </a>
            </div>
        {:else}
            <a
                href="/consultas/{item.appointmentCode}"
                class="inline-flex items-center rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                       font-medium text-stone-600 transition-colors hover:bg-stone-50
                       dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
            >
                Ver detalle
            </a>
        {/if}
    </td>
</tr>
