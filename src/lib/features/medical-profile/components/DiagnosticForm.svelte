<!-- src/lib/features/medical-profile/components/DiagnosticForm.svelte -->
<!-- Add/edit diagnostic modal. Parent uses {#key} remount to reset state per open. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import { medicalProfile } from '../stores/medicalProfile.svelte';
    import type { DiagnosticResponse } from '$lib/api/diagnosticApi';

    interface Props {
        open:            boolean;
        diagnostic:      DiagnosticResponse | null;
        appointmentCode: string | null;
        onclose:         () => void;
    }
    let { open, diagnostic, appointmentCode, onclose }: Props = $props();

    const isEdit = $derived(diagnostic !== null);

    let description = $state(untrack(() => diagnostic?.description ?? ''));
    let diagnosedAt = $state(untrack(() => diagnostic?.diagnosedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)));
    let notes       = $state(untrack(() => diagnostic?.notes ?? ''));

    let touched = $state(false);
    let errors  = $state<{ description?: string; diagnosedAt?: string; noAppointment?: string }>({});

    function validate(): boolean {
        const e: typeof errors = {};
        if (!description.trim())           e.description   = 'La descripción es requerida.';
        if (!diagnosedAt)                  e.diagnosedAt   = 'La fecha es requerida.';
        if (!isEdit && !appointmentCode)   e.noAppointment = 'No hay cita asociada para este diagnóstico.';
        errors = e;
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: SubmitEvent): Promise<void> {
        e.preventDefault();
        touched = true;
        if (!validate()) return;
        medicalProfile.clearSubmitError();

        const ok = isEdit && diagnostic
            ? await medicalProfile.updateDiagnostic(diagnostic.diagnosticCode, {
                Description: description.trim(),
                DiagnosedAt: diagnosedAt,
                Notes:       notes.trim() || null
              })
            : await medicalProfile.addDiagnostic({
                AppointmentCode: appointmentCode!,
                Description:     description.trim(),
                DiagnosedAt:     diagnosedAt,
                Notes:           notes.trim() || null
              });

        if (ok) onclose();
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
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="diag-form-title"
    >
        <div class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="diag-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {isEdit ? 'Editar diagnóstico' : 'Nuevo diagnóstico'}
                </h2>
            </div>

            <form onsubmit={handleSubmit} novalidate>
                <div class="space-y-4 px-6 py-5">

                    {#if medicalProfile.submitError}
                        <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                                    text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                            {medicalProfile.submitError}
                        </div>
                    {/if}

                    {#if touched && errors.noAppointment}
                        <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm
                                    text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            {errors.noAppointment}
                        </div>
                    {/if}

                    <div>
                        <label for="df-description" class={fieldLabel}>
                            Descripción <span class="text-rose-500" aria-hidden="true">*</span>
                        </label>
                        <textarea
                            id="df-description"
                            bind:value={description}
                            disabled={medicalProfile.submitting}
                            rows="3"
                            maxlength="1000"
                            placeholder="Descripción del diagnóstico…"
                            class="{inputCls} {touched && errors.description
                                ? 'border-rose-500 dark:border-rose-500' : ''}"
                        ></textarea>
                        {#if touched && errors.description}
                            <p class={fieldError}>{errors.description}</p>
                        {/if}
                    </div>

                    <div>
                        <label for="df-date" class={fieldLabel}>
                            Fecha de diagnóstico <span class="text-rose-500" aria-hidden="true">*</span>
                        </label>
                        <input
                            id="df-date"
                            type="date"
                            bind:value={diagnosedAt}
                            disabled={medicalProfile.submitting}
                            class="{inputCls} {touched && errors.diagnosedAt
                                ? 'border-rose-500 dark:border-rose-500' : ''}"
                        />
                        {#if touched && errors.diagnosedAt}
                            <p class={fieldError}>{errors.diagnosedAt}</p>
                        {/if}
                    </div>

                    <div>
                        <label for="df-notes" class={fieldLabel}>
                            Notas
                            <span class="ml-1 text-xs font-normal text-stone-400">(opcional)</span>
                        </label>
                        <textarea
                            id="df-notes"
                            bind:value={notes}
                            disabled={medicalProfile.submitting}
                            rows="2"
                            maxlength="500"
                            placeholder="Observaciones adicionales…"
                            class={inputCls}
                        ></textarea>
                    </div>

                </div>

                <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
                    <button
                        type="button"
                        onclick={onclose}
                        disabled={medicalProfile.submitting}
                        class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                               text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900
                               disabled:cursor-not-allowed disabled:opacity-50
                               dark:border-stone-700 dark:text-stone-400
                               dark:hover:bg-stone-700 dark:hover:text-stone-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={medicalProfile.submitting}
                        class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                               text-white transition-colors hover:bg-teal-600
                               disabled:cursor-not-allowed disabled:opacity-50
                               dark:bg-teal-600 dark:hover:bg-teal-700"
                    >
                        {medicalProfile.submitting
                            ? 'Guardando…'
                            : isEdit ? 'Guardar cambios' : 'Crear diagnóstico'}
                    </button>
                </div>
            </form>

        </div>
    </div>
{/if}
