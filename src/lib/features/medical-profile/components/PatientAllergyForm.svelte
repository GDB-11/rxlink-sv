<!-- src/lib/features/medical-profile/components/PatientAllergyForm.svelte -->
<!-- Single-allergy add/edit modal. Uses {#key} remount in AllergiesSection for fresh state per open. -->
<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { IconSearch, IconX } from '@tabler/icons-svelte';
    import { allergyApi, type AllergyResponse } from '$lib/api/allergyApi';
    import { lookupsApi, type GuidLookupItemResponse } from '$lib/api/lookupsApi';
    import { medicalProfile } from '../stores/medicalProfile.svelte';
    import type { PatientAllergyResponse } from '$lib/api/patientApi';

    interface Props {
        open:    boolean;
        allergy: PatientAllergyResponse | null;
        onclose: () => void;
    }
    let { open, allergy, onclose }: Props = $props();

    const isEdit = $derived(allergy !== null);

    let allergyCode = $state(untrack(() => allergy?.allergyCode ?? ''));
    let allergyName = $state(untrack(() => allergy?.allergyName ?? ''));
    let severityCode = $state(untrack(() => allergy?.severityCode ?? ''));
    let notes        = $state(untrack(() => allergy?.notes ?? ''));

    let query        = $state(untrack(() => allergy?.allergyName ?? ''));
    let results      = $state<AllergyResponse[]>([]);
    let searching    = $state(false);
    let dropdownOpen = $state(false);
    let searchTimer: ReturnType<typeof setTimeout> | undefined;

    let severities = $state<GuidLookupItemResponse[]>([]);
    let touched    = $state(false);
    let errors     = $state<{ allergyCode?: string; severityCode?: string }>({});

    onMount(async () => {
        try {
            const data = await lookupsApi.getPatientLookups();
            severities = data.allergySeverities;
            if (!severityCode && data.allergySeverities.length > 0) {
                severityCode = data.allergySeverities[0].code;
            }
        } catch {
            severities = [];
        }
    });

    function handleInput(e: Event) {
        query        = (e.currentTarget as HTMLInputElement).value;
        allergyCode  = '';
        allergyName  = '';
        dropdownOpen = false;
        clearTimeout(searchTimer);
        if (!query.trim()) { results = []; return; }
        searchTimer = setTimeout(fetchResults, 350);
    }

    async function fetchResults() {
        searching = true;
        try {
            const page = await allergyApi.getPage(1, 10, query.trim());
            results      = page.items.filter(a => a.isActive);
            dropdownOpen = results.length > 0;
        } catch {
            results = [];
        } finally {
            searching = false;
        }
    }

    function selectAllergy(a: AllergyResponse) {
        allergyCode  = a.allergyCode;
        allergyName  = a.name;
        query        = a.name;
        results      = [];
        dropdownOpen = false;
        if (touched) validate();
    }

    function clearAllergy() {
        allergyCode = '';
        allergyName = '';
        query       = '';
        results     = [];
    }

    function validate(): boolean {
        const e: typeof errors = {};
        if (!allergyCode)  e.allergyCode  = 'Seleccione una alergia.';
        if (!severityCode) e.severityCode = 'Seleccione la severidad.';
        errors = e;
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        touched = true;
        if (!validate()) return;

        medicalProfile.clearSubmitError();

        const body = {
            AllergyCode:  allergyCode,
            SeverityCode: severityCode,
            Notes:        notes.trim() || null
        };

        const ok = isEdit && allergy
            ? await medicalProfile.updateAllergy(allergy.patientAllergyCode, body)
            : await medicalProfile.addAllergy(body);

        if (ok) onclose();
    }

    const inputCls = [
        'w-full rounded-lg border bg-white py-2 pl-9 pr-9 text-sm text-stone-900',
        'placeholder:text-stone-400 transition-colors',
        'focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-stone-900 dark:text-stone-50 dark:placeholder:text-stone-600',
        'dark:focus:border-teal-600'
    ].join(' ');

    const selectCls = [
        'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900',
        'focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50'
    ].join(' ');

    const fieldLabel = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300';
    const fieldError = 'mt-1 text-xs text-rose-600 dark:text-rose-400';
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="allergy-form-title"
    >
        <div class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="allergy-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {isEdit ? 'Editar alergia' : 'Agregar alergia'}
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

                    <!-- Allergy search -->
                    <div>
                        <label for="af-allergy" class={fieldLabel}>
                            Alergia <span class="text-rose-500" aria-hidden="true">*</span>
                        </label>
                        <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                {#if searching}
                                    <span
                                        class="h-4 w-4 animate-spin rounded-full border-2
                                               border-stone-300 border-t-teal-500
                                               dark:border-stone-600 dark:border-t-teal-400"
                                        aria-hidden="true"
                                    ></span>
                                {:else}
                                    <IconSearch size={16} class="text-stone-400" aria-hidden="true" />
                                {/if}
                            </div>

                            <input
                                id="af-allergy"
                                type="search"
                                value={query}
                                oninput={handleInput}
                                disabled={medicalProfile.submitting}
                                placeholder="Buscar alergia…"
                                autocomplete="off"
                                class="{inputCls} {touched && errors.allergyCode
                                    ? 'border-rose-500 dark:border-rose-500'
                                    : 'border-stone-200 dark:border-stone-700'}"
                            />

                            {#if allergyCode}
                                <button
                                    type="button"
                                    onclick={clearAllergy}
                                    class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3
                                           text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                                    aria-label="Quitar alergia seleccionada"
                                >
                                    <IconX size={14} aria-hidden="true" />
                                </button>
                            {/if}

                            {#if dropdownOpen && results.length > 0}
                                <ul
                                    role="listbox"
                                    class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border
                                           border-stone-200 bg-white shadow-lg
                                           dark:border-stone-700 dark:bg-stone-800"
                                >
                                    {#each results as r (r.allergyCode)}
                                        <li role="option" aria-selected={r.allergyCode === allergyCode}>
                                            <button
                                                type="button"
                                                onclick={() => selectAllergy(r)}
                                                class="w-full cursor-pointer px-4 py-2 text-left text-sm
                                                       text-stone-900 transition-colors hover:bg-teal-50
                                                       dark:text-stone-50 dark:hover:bg-teal-900/30"
                                            >
                                                {r.name}
                                            </button>
                                        </li>
                                    {/each}
                                </ul>
                            {/if}
                        </div>
                        {#if touched && errors.allergyCode}
                            <p class={fieldError}>{errors.allergyCode}</p>
                        {/if}
                    </div>

                    <!-- Severity -->
                    <div>
                        <label for="af-severity" class={fieldLabel}>
                            Severidad <span class="text-rose-500" aria-hidden="true">*</span>
                        </label>
                        <select
                            id="af-severity"
                            bind:value={severityCode}
                            disabled={medicalProfile.submitting}
                            class="{selectCls} {touched && errors.severityCode
                                ? 'border-rose-500 dark:border-rose-500'
                                : ''}"
                        >
                            <option value="" disabled>Seleccionar…</option>
                            {#each severities as sev (sev.code)}
                                <option value={sev.code}>{sev.name}</option>
                            {/each}
                        </select>
                        {#if touched && errors.severityCode}
                            <p class={fieldError}>{errors.severityCode}</p>
                        {/if}
                    </div>

                    <!-- Notes -->
                    <div>
                        <label for="af-notes" class={fieldLabel}>
                            Notas
                            <span class="ml-1 text-xs font-normal text-stone-400">(opcional)</span>
                        </label>
                        <textarea
                            id="af-notes"
                            bind:value={notes}
                            disabled={medicalProfile.submitting}
                            rows="3"
                            maxlength="500"
                            placeholder="Observaciones sobre la alergia…"
                            class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm
                                   text-stone-900 placeholder:text-stone-400 transition-colors
                                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                                   disabled:cursor-not-allowed disabled:opacity-50
                                   dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50
                                   dark:placeholder:text-stone-600"
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
                        {medicalProfile.submitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar'}
                    </button>
                </div>
            </form>

        </div>
    </div>
{/if}
