<!-- src/lib/features/medical-profile/components/PrescriptionForm.svelte -->
<!-- Add/edit prescription modal. Parent uses {#key} remount to reset state per open. -->
<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { IconPlus, IconTrash } from '@tabler/icons-svelte';
    import SearchSelect from '$lib/components/ui/SearchSelect.svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';
    import {
        prescriptionApi,
        type PrescriptionResponse,
        type MedicationLookupItem,
        type PrescriptionLookupItem
    } from '$lib/api/prescriptionApi';
    import { medicalProfile } from '../stores/medicalProfile.svelte';

    interface DetailLine {
        id:                      string;
        medicationCode:          string;
        dose:                    string;
        administrationRouteCode: string;
        frequencyCode:           string;
        durationDays:            number;
        instructions:            string;
    }

    interface Props {
        open:           boolean;
        prescription:   PrescriptionResponse | null;
        diagnosticCode: string;
        onclose:        () => void;
    }
    const TODAY = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    let { open, prescription, diagnosticCode, onclose }: Props = $props();

    const isEdit = $derived(prescription !== null);

    let validUntil = $state(untrack(() => prescription?.validUntil?.slice(0, 10) ?? ''));
    let notes      = $state(untrack(() => prescription?.notes ?? ''));

    function newLine(): DetailLine {
        return {
            id:                      crypto.randomUUID(),
            medicationCode:          '',
            dose:                    '',
            administrationRouteCode: '',
            frequencyCode:           '',
            durationDays:            1,
            instructions:            ''
        };
    }

    let lines = $state<DetailLine[]>(
        untrack(() =>
            prescription?.details.length
                ? prescription.details.map(d => ({
                    id:                      crypto.randomUUID(),
                    medicationCode:          d.medicationCode,
                    dose:                    d.dose,
                    administrationRouteCode: d.administrationRouteCode,
                    frequencyCode:           d.frequencyCode,
                    durationDays:            d.durationDays,
                    instructions:            d.instructions ?? ''
                  }))
                : [newLine()]
        )
    );

    let medications          = $state<MedicationLookupItem[]>([]);
    let administrationRoutes = $state<PrescriptionLookupItem[]>([]);
    let frequencies          = $state<PrescriptionLookupItem[]>([]);
    let loadingLookups       = $state(true);
    let lookupError          = $state<string | null>(null);

    let touched = $state(false);
    let errors  = $state<{ validUntil?: string; lines?: string }>({});

    const medicationOptions = $derived(medications.map(m => ({ value: m.code, label: m.name })));

    function applyMedicationDefaults(index: number, code: string): void {
        const med = medications.find(m => m.code === code);
        if (!med) return;
        lines[index].dose                    = med.defaultDose;
        lines[index].administrationRouteCode = med.defaultAdministrationRouteCode;
    }

    onMount(async () => {
        try {
            const data = await prescriptionApi.getPrescriptionLookups();
            medications          = data.medications;
            administrationRoutes = data.administrationRoutes;
            frequencies          = data.frequencies;
            const firstRoute = data.administrationRoutes[0]?.code ?? '';
            const firstFreq  = data.frequencies[0]?.code ?? '';
            for (const l of lines) {
                if (!l.administrationRouteCode) l.administrationRouteCode = firstRoute;
                if (!l.frequencyCode)           l.frequencyCode           = firstFreq;
            }
        } catch {
            lookupError = 'Error al cargar las opciones de receta.';
        } finally {
            loadingLookups = false;
        }
    });

    function addLine(): void {
        const l = newLine();
        l.administrationRouteCode = administrationRoutes[0]?.code ?? '';
        l.frequencyCode           = frequencies[0]?.code ?? '';
        lines = [...lines, l];
    }

    function removeLine(id: string): void {
        lines = lines.filter(l => l.id !== id);
    }

    function validate(): boolean {
        const e: typeof errors = {};
        if (!validUntil) e.validUntil = 'La fecha de vigencia es requerida.';
        if (
            lines.length === 0 ||
            lines.some(l =>
                !l.medicationCode ||
                !l.dose.trim() ||
                !l.administrationRouteCode ||
                !l.frequencyCode ||
                l.durationDays < 1
            )
        ) {
            e.lines = 'Complete todas las líneas o elimine las incompletas. Mínimo 1 medicamento.';
        }
        errors = e;
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: SubmitEvent): Promise<void> {
        e.preventDefault();
        touched = true;
        if (!validate()) return;
        medicalProfile.clearSubmitError();

        const details = lines.map(l => ({
            MedicationCode:          l.medicationCode,
            AdministrationRouteCode: l.administrationRouteCode,
            FrequencyCode:           l.frequencyCode,
            Dose:                    l.dose.trim(),
            DurationDays:            l.durationDays,
            Instructions:            l.instructions.trim() || null
        }));

        const ok = isEdit && prescription
            ? await medicalProfile.updatePrescription(prescription.prescriptionCode, {
                Notes:      notes.trim() || null,
                ValidUntil: validUntil,
                Details:    details
              })
            : await medicalProfile.addPrescription({
                DiagnosticCode: diagnosticCode,
                Notes:          notes.trim() || null,
                ValidUntil:     validUntil,
                Details:        details
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
    const selectCls  = [
        'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900',
        'focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50'
    ].join(' ');
    const fieldError = 'mt-1 text-xs text-rose-600 dark:text-rose-400';
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="rx-form-title"
    >
        <div class="my-auto w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="rx-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {isEdit ? 'Editar receta' : 'Nueva receta'}
                </h2>
            </div>

            {#if loadingLookups}
                <div class="flex items-center justify-center px-6 py-12">
                    <span
                        class="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-teal-500
                               dark:border-stone-700 dark:border-t-teal-400"
                        aria-hidden="true"
                    ></span>
                </div>
            {:else if lookupError}
                <div class="px-6 py-5">
                    <p class="text-sm text-rose-600 dark:text-rose-400">{lookupError}</p>
                    <button
                        type="button"
                        onclick={onclose}
                        class="mt-4 cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm
                               font-medium text-stone-600 transition-colors hover:bg-stone-50
                               dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700"
                    >
                        Cerrar
                    </button>
                </div>
            {:else}
                <form onsubmit={handleSubmit} novalidate autocomplete="off">
                    <div class="space-y-5 px-6 py-5">

                        {#if medicalProfile.submitError}
                            <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                                        text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                                {medicalProfile.submitError}
                            </div>
                        {/if}

                        <!-- ValidUntil + Notes -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label for="rx-valid-until" class={fieldLabel}>
                                    Válida hasta <span class="text-rose-500" aria-hidden="true">*</span>
                                </label>
                                <DatePicker
                                    id="rx-valid-until"
                                    bind:value={validUntil}
                                    disabled={medicalProfile.submitting}
                                    placeholder="Seleccionar fecha…"
                                    minDate={TODAY}
                                    class={touched && errors.validUntil
                                        ? 'border-rose-500 bg-white focus:border-rose-500 dark:border-rose-500 dark:bg-stone-900'
                                        : 'border-stone-200 bg-white focus:border-teal-500 dark:border-stone-700 dark:bg-stone-900'}
                                />
                                {#if touched && errors.validUntil}
                                    <p class={fieldError}>{errors.validUntil}</p>
                                {/if}
                            </div>

                            <div>
                                <label for="rx-notes" class={fieldLabel}>
                                    Notas
                                    <span class="ml-1 text-xs font-normal text-stone-400">(opcional)</span>
                                </label>
                                <input
                                    id="rx-notes"
                                    type="text"
                                    bind:value={notes}
                                    disabled={medicalProfile.submitting}
                                    maxlength="500"
                                    placeholder="Indicaciones generales…"
                                    class={inputCls}
                                />
                            </div>
                        </div>

                        <!-- Detail lines -->
                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Medicamentos <span class="text-rose-500" aria-hidden="true">*</span>
                                </span>
                                <button
                                    type="button"
                                    onclick={addLine}
                                    disabled={medicalProfile.submitting}
                                    class="flex cursor-pointer items-center gap-1 rounded-lg border border-teal-200
                                           px-2.5 py-1.5 text-xs font-medium text-teal-700 transition-colors
                                           hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50
                                           dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                >
                                    <IconPlus size={13} aria-hidden="true" />
                                    Agregar línea
                                </button>
                            </div>

                            {#if touched && errors.lines}
                                <p class="{fieldError} mb-2">{errors.lines}</p>
                            {/if}

                            <div class="space-y-3">
                                {#each lines as _line, i (lines[i].id)}
                                    <div class="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
                                        <div class="mb-3 flex items-center justify-between">
                                            <span class="text-xs font-semibold uppercase tracking-wide
                                                         text-stone-400 dark:text-stone-500">
                                                Línea {i + 1}
                                            </span>
                                            {#if lines.length > 1}
                                                <button
                                                    type="button"
                                                    onclick={() => removeLine(lines[i].id)}
                                                    disabled={medicalProfile.submitting}
                                                    aria-label="Eliminar línea {i + 1}"
                                                    class="cursor-pointer rounded p-1 text-stone-400 transition-colors
                                                           hover:bg-rose-100 hover:text-rose-600
                                                           disabled:cursor-not-allowed disabled:opacity-50
                                                           dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                                                >
                                                    <IconTrash size={14} aria-hidden="true" />
                                                </button>
                                            {/if}
                                        </div>

                                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                            <!-- Medication -->
                                            <div class="sm:col-span-2">
                                                <label for="rx-med-{i}" class={fieldLabel}>
                                                    Medicamento <span class="text-rose-500" aria-hidden="true">*</span>
                                                </label>
                                                <SearchSelect
                                                    id="rx-med-{i}"
                                                    bind:value={lines[i].medicationCode}
                                                    options={medicationOptions}
                                                    placeholder="Seleccionar medicamento…"
                                                    searchPlaceholder="Buscar medicamento…"
                                                    disabled={medicalProfile.submitting}
                                                    onchange={(code) => applyMedicationDefaults(i, code)}
                                                />
                                            </div>

                                            <!-- Dose -->
                                            <div>
                                                <label for="rx-dose-{i}" class={fieldLabel}>
                                                    Dosis <span class="text-rose-500" aria-hidden="true">*</span>
                                                </label>
                                                <input
                                                    id="rx-dose-{i}"
                                                    type="text"
                                                    bind:value={lines[i].dose}
                                                    disabled={medicalProfile.submitting}
                                                    maxlength="100"
                                                    placeholder="Ej: 500mg"
                                                    class={inputCls}
                                                />
                                            </div>

                                            <!-- Duration -->
                                            <div>
                                                <label for="rx-dur-{i}" class={fieldLabel}>
                                                    Duración (días) <span class="text-rose-500" aria-hidden="true">*</span>
                                                </label>
                                                <input
                                                    id="rx-dur-{i}"
                                                    type="number"
                                                    bind:value={lines[i].durationDays}
                                                    disabled={medicalProfile.submitting}
                                                    min="1"
                                                    max="365"
                                                    class={inputCls}
                                                />
                                            </div>

                                            <!-- Administration route -->
                                            <div>
                                                <label for="rx-route-{i}" class={fieldLabel}>
                                                    Vía de administración <span class="text-rose-500" aria-hidden="true">*</span>
                                                </label>
                                                <select
                                                    id="rx-route-{i}"
                                                    bind:value={lines[i].administrationRouteCode}
                                                    disabled={medicalProfile.submitting}
                                                    class={selectCls}
                                                >
                                                    <option value="" disabled>Seleccionar…</option>
                                                    {#each administrationRoutes as r (r.code)}
                                                        <option value={r.code}>{r.name}</option>
                                                    {/each}
                                                </select>
                                            </div>

                                            <!-- Frequency -->
                                            <div>
                                                <label for="rx-freq-{i}" class={fieldLabel}>
                                                    Frecuencia <span class="text-rose-500" aria-hidden="true">*</span>
                                                </label>
                                                <select
                                                    id="rx-freq-{i}"
                                                    bind:value={lines[i].frequencyCode}
                                                    disabled={medicalProfile.submitting}
                                                    class={selectCls}
                                                >
                                                    <option value="" disabled>Seleccionar…</option>
                                                    {#each frequencies as f (f.code)}
                                                        <option value={f.code}>{f.name}</option>
                                                    {/each}
                                                </select>
                                            </div>

                                            <!-- Instructions -->
                                            <div class="sm:col-span-2">
                                                <label for="rx-inst-{i}" class={fieldLabel}>
                                                    Instrucciones
                                                    <span class="ml-1 text-xs font-normal text-stone-400">(opcional)</span>
                                                </label>
                                                <input
                                                    id="rx-inst-{i}"
                                                    type="text"
                                                    bind:value={lines[i].instructions}
                                                    disabled={medicalProfile.submitting}
                                                    maxlength="300"
                                                    placeholder="Ej: Tomar con las comidas"
                                                    class={inputCls}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                {/each}
                            </div>
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
                                : isEdit ? 'Guardar cambios' : 'Crear receta'}
                        </button>
                    </div>
                </form>
            {/if}

        </div>
    </div>
{/if}
