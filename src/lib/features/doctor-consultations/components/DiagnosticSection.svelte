<!-- src/lib/features/doctor-consultations/components/DiagnosticSection.svelte -->
<script lang="ts">
    import { untrack } from 'svelte';
    import { diagnosticApi, type DiagnosticResponse } from '$lib/api/diagnosticApi';
    import { consultationRoom } from '../stores/consultationRoom.svelte';

    interface Props {
        appointmentCode: string;
        diagnostic:      DiagnosticResponse | null;
        isReadOnly:      boolean;
    }
    let { appointmentCode, diagnostic, isReadOnly }: Props = $props();

    let editMode    = $state(false);
    let submitting  = $state(false);
    let submitError = $state<string | null>(null);

    let description = $state(untrack(() => diagnostic?.description ?? ''));
    let diagnosedAt = $state(untrack(() => diagnostic?.diagnosedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)));
    let notes       = $state(untrack(() => diagnostic?.notes ?? ''));

    let touched = $state(false);
    let descErr = $state('');
    let dateErr = $state('');

    function validate(): boolean {
        descErr = description.trim() ? '' : 'La descripción es requerida.';
        dateErr = diagnosedAt        ? '' : 'La fecha es requerida.';
        return !descErr && !dateErr;
    }

    function startEdit(): void {
        description = diagnostic?.description ?? '';
        diagnosedAt = diagnostic?.diagnosedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
        notes       = diagnostic?.notes ?? '';
        touched     = false;
        submitError = null;
        editMode    = true;
    }

    function cancelEdit(): void {
        editMode    = false;
        touched     = false;
        submitError = null;
    }

    async function handleSubmit(e: SubmitEvent): Promise<void> {
        e.preventDefault();
        touched = true;
        if (!validate()) return;
        submitting  = true;
        submitError = null;
        try {
            if (diagnostic) {
                await diagnosticApi.updateDiagnostic(diagnostic.diagnosticCode, {
                    Description: description.trim(),
                    DiagnosedAt: diagnosedAt,
                    Notes:       notes.trim() || null
                });
            } else {
                await diagnosticApi.createDiagnostic({
                    AppointmentCode: appointmentCode,
                    Description:     description.trim(),
                    DiagnosedAt:     diagnosedAt,
                    Notes:           notes.trim() || null
                });
            }
            await consultationRoom.reloadDiagnostic();
            editMode = false;
            touched  = false;
        } catch (err) {
            submitError = err instanceof Error ? err.message : 'Error al guardar el diagnóstico.';
        } finally {
            submitting = false;
        }
    }

    function fmtDate(s: string): string {
        return new Date(s.length === 10 ? s + 'T00:00:00' : s)
            .toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    const fieldLabel = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300';
    const inputCls   = [
        'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900',
        'placeholder:text-stone-400 transition-colors',
        'focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 dark:placeholder:text-stone-600'
    ].join(' ');
    const fieldError = 'mt-1 text-xs text-rose-600 dark:text-rose-400';

    const showForm = $derived(!diagnostic || editMode);
</script>

<div class="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <div class="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-700">
        <h2 class="text-sm font-semibold text-stone-900 dark:text-stone-50">Diagnóstico</h2>
        {#if diagnostic && !isReadOnly && !editMode}
            <button
                type="button"
                onclick={startEdit}
                class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium
                       text-stone-600 transition-colors hover:bg-stone-50
                       dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
            >
                Editar
            </button>
        {/if}
    </div>

    <div class="p-5">
        {#if showForm && !isReadOnly}
            <form onsubmit={handleSubmit} novalidate class="space-y-4">
                {#if submitError}
                    <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                                text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        {submitError}
                    </div>
                {/if}

                <div>
                    <label for="ds-description" class={fieldLabel}>
                        Descripción <span class="text-rose-500" aria-hidden="true">*</span>
                    </label>
                    <textarea
                        id="ds-description"
                        bind:value={description}
                        disabled={submitting}
                        rows="4"
                        maxlength="1000"
                        placeholder="Descripción del diagnóstico…"
                        class="{inputCls} {touched && descErr ? 'border-rose-500 dark:border-rose-500' : ''}"
                    ></textarea>
                    {#if touched && descErr}<p class={fieldError}>{descErr}</p>{/if}
                </div>

                <div>
                    <label for="ds-date" class={fieldLabel}>
                        Fecha de diagnóstico <span class="text-rose-500" aria-hidden="true">*</span>
                    </label>
                    <input
                        id="ds-date"
                        type="date"
                        bind:value={diagnosedAt}
                        disabled={submitting}
                        class="{inputCls} {touched && dateErr ? 'border-rose-500 dark:border-rose-500' : ''}"
                    />
                    {#if touched && dateErr}<p class={fieldError}>{dateErr}</p>{/if}
                </div>

                <div>
                    <label for="ds-notes" class={fieldLabel}>
                        Notas <span class="ml-1 text-xs font-normal text-stone-400">(opcional)</span>
                    </label>
                    <textarea
                        id="ds-notes"
                        bind:value={notes}
                        disabled={submitting}
                        rows="2"
                        maxlength="500"
                        placeholder="Observaciones adicionales…"
                        class={inputCls}
                    ></textarea>
                </div>

                <div class="flex justify-end gap-3">
                    {#if editMode}
                        <button
                            type="button"
                            onclick={cancelEdit}
                            disabled={submitting}
                            class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                                   text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900
                                   disabled:cursor-not-allowed disabled:opacity-50
                                   dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-50"
                        >
                            Cancelar
                        </button>
                    {/if}
                    <button
                        type="submit"
                        disabled={submitting}
                        class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                               text-white transition-colors hover:bg-teal-600
                               disabled:cursor-not-allowed disabled:opacity-50
                               dark:bg-teal-600 dark:hover:bg-teal-700"
                    >
                        {submitting ? 'Guardando…' : diagnostic ? 'Guardar cambios' : 'Crear diagnóstico'}
                    </button>
                </div>
            </form>

        {:else if diagnostic}
            <div class="space-y-3">
                <div>
                    <p class="text-xs text-stone-500 dark:text-stone-400">Descripción</p>
                    <p class="mt-1 text-sm text-stone-800 dark:text-stone-100">{diagnostic.description}</p>
                </div>
                <div class="flex gap-6">
                    <div>
                        <p class="text-xs text-stone-500 dark:text-stone-400">Fecha</p>
                        <p class="mt-0.5 text-sm font-medium text-stone-800 dark:text-stone-100">
                            {fmtDate(diagnostic.diagnosedAt)}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-stone-500 dark:text-stone-400">Estado</p>
                        <p class="mt-0.5 text-sm font-medium text-stone-800 dark:text-stone-100">
                            {diagnostic.statusName}
                        </p>
                    </div>
                </div>
                {#if diagnostic.notes}
                    <div>
                        <p class="text-xs text-stone-500 dark:text-stone-400">Notas</p>
                        <p class="mt-1 text-sm italic text-stone-600 dark:text-stone-400">{diagnostic.notes}</p>
                    </div>
                {/if}
            </div>
        {:else}
            <p class="text-sm text-stone-500 dark:text-stone-400">No hay diagnóstico registrado para esta consulta.</p>
        {/if}
    </div>
</div>
