<!-- src/lib/features/doctor-availability/components/AddSlotsModal.svelte -->
<script lang="ts">
    import DatePicker from '$lib/components/ui/DatePicker.svelte';
    import TimePicker from '$lib/components/ui/TimePicker.svelte';
    import { availability } from '../stores/availability.svelte';
    import { todayIso } from '$lib/utils/date';

    interface Props {
        open:       boolean;
        doctorName: string;
        onclose:    () => void;
    }
    let { open, doctorName, onclose }: Props = $props();

    type SlotRow = { date: string; startTime: string };

    let rows    = $state<SlotRow[]>([{ date: '', startTime: '' }]);
    let touched = $state(false);

    const today = todayIso();

    // Reactive validation — reruns whenever rows or touched change
    const rowErrors = $derived(
        rows.map(r => {
            const e: { date?: string; startTime?: string } = {};
            if (!touched) return e;
            if (!r.date)             e.date      = 'Fecha requerida.';
            else if (r.date < today) e.date      = 'La fecha debe ser hoy o posterior.';
            if (!r.startTime)        e.startTime = 'Hora requerida.';
            return e;
        })
    );

    const isValid = $derived(rowErrors.every(e => !e.date && !e.startTime));

    function addRow() {
        const lastDate = [...rows].reverse().find(r => r.date)?.date ?? '';
        rows = [...rows, { date: lastDate, startTime: '' }];
    }

    function removeRow(i: number) {
        if (rows.length === 1) return;
        rows = rows.filter((_, idx) => idx !== i);
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        touched = true;
        if (!isValid) return;
        availability.clearSubmitError();

        const ok = await availability.addSlots({
            slots: rows.map(r => ({ date: r.date, startTime: r.startTime }))
        });

        if (ok) {
            rows    = [{ date: '', startTime: '' }];
            touched = false;
            onclose();
        }
    }
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="add-slots-title"
    >
        <div class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="add-slots-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    Agregar slots — {doctorName}
                </h2>
            </div>

            <form onsubmit={handleSubmit}>
                <div class="max-h-[60vh] overflow-y-auto px-6 py-4">

                    {#if availability.submitError}
                        <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                                   text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                            {availability.submitError}
                        </div>
                    {/if}

                    <div class="space-y-4">
                        {#each rows as _, i (i)}
                            <div class="flex items-start gap-2">

                                <!-- Date -->
                                <div class="flex-1 space-y-1">
                                    <label
                                        for="slot-date-{i}"
                                        class="block text-xs font-medium text-stone-600 dark:text-stone-400"
                                    >
                                        Fecha
                                    </label>
                                    <DatePicker
                                        id="slot-date-{i}"
                                        bind:value={rows[i].date}
                                        minDate={today}
                                        disabled={availability.submitting}
                                    />
                                    {#if rowErrors[i]?.date}
                                        <p class="text-xs text-rose-600 dark:text-rose-400">{rowErrors[i].date}</p>
                                    {/if}
                                </div>

                                <!-- Time -->
                                <div class="flex-1 space-y-1">
                                    <label
                                        for="slot-time-{i}"
                                        class="block text-xs font-medium text-stone-600 dark:text-stone-400"
                                    >
                                        Hora
                                    </label>
                                    <TimePicker
                                        id="slot-time-{i}"
                                        bind:value={rows[i].startTime}
                                        step={30}
                                        startHour={6}
                                        endHour={20}
                                        disabled={availability.submitting}
                                    />
                                    {#if rowErrors[i]?.startTime}
                                        <p class="text-xs text-rose-600 dark:text-rose-400">{rowErrors[i].startTime}</p>
                                    {/if}
                                </div>

                                <!-- Remove row -->
                                <button
                                    type="button"
                                    onclick={() => removeRow(i)}
                                    disabled={rows.length === 1 || availability.submitting}
                                    class="mt-6 cursor-pointer rounded-lg p-1.5 text-stone-400 transition-colors
                                           hover:bg-rose-50 hover:text-rose-600
                                           disabled:cursor-not-allowed disabled:opacity-30
                                           dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                                    aria-label="Eliminar fila"
                                >
                                    ×
                                </button>
                            </div>
                        {/each}
                    </div>

                    <button
                        type="button"
                        onclick={addRow}
                        disabled={availability.submitting}
                        class="mt-4 cursor-pointer text-sm text-teal-600 transition-colors
                               hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-50
                               dark:text-teal-400 dark:hover:text-teal-300"
                    >
                        + Agregar otro
                    </button>
                </div>

                <div class="flex items-center justify-end gap-3 border-t border-stone-200 px-6 py-4
                           dark:border-stone-700">
                    <button
                        type="button"
                        onclick={onclose}
                        disabled={availability.submitting}
                        class="cursor-pointer rounded-lg border border-stone-200 bg-white px-4 py-2
                               text-sm font-medium text-stone-700 transition-colors
                               hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50
                               dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={availability.submitting}
                        class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                               text-white transition-colors hover:bg-teal-600
                               disabled:cursor-not-allowed disabled:opacity-50
                               dark:bg-teal-600 dark:hover:bg-teal-700"
                    >
                        {availability.submitting ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </form>

        </div>
    </div>
{/if}
