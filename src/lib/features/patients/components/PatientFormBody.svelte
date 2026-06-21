<!-- src/lib/features/patients/components/PatientFormBody.svelte -->
<!-- Mounted fresh on every open via {#key} in PatientForm — no $effect needed. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import { IconUser, IconAlertCircle } from '@tabler/icons-svelte';
    import type { PatientResponse, CreatePatientBody, UpdatePatientBody, CreatePatientAllergyItem } from '$lib/api/patientApi';
    import type { PersonResponse } from '$lib/api/personApi';
    import PersonPicker from '$lib/components/ui/PersonPicker.svelte';
    import TextInput from '$lib/components/ui/TextInput.svelte';
    import AllergySelector from '$lib/components/ui/AllergySelector.svelte';

    interface Props {
        mode: 'create' | 'edit';
        initial: PatientResponse | null;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: CreatePatientBody | UpdatePatientBody) => void;
        oncancel: () => void;
    }
    let { mode, initial, submitting, error, onsubmit, oncancel }: Props = $props();

    let selectedPerson       = $state<PersonResponse | null>(null);
    let medicalRecordNumber  = $state(untrack(() => initial?.medicalRecordNumber ?? ''));
    let selectedAllergies    = $state<CreatePatientAllergyItem[]>([]);

    let fieldErrors = $state<Record<string, string>>({});

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (mode === 'create' && !selectedPerson) e.person = 'Seleccione una persona para continuar.';
        if (mode === 'edit' && !medicalRecordNumber.trim()) e.mrn = 'El número de historia clínica es requerido.';
        fieldErrors = e;
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!validate()) return;

        if (mode === 'create') {
            onsubmit({
                PersonCode: selectedPerson!.personCode,
                Allergies:  selectedAllergies.length > 0 ? selectedAllergies : undefined
            });
        } else {
            onsubmit({ MedicalRecordNumber: medicalRecordNumber.trim() });
        }
    }

    const dpNormal = 'border-stone-200 bg-white focus:border-teal-500 dark:border-stone-700 dark:bg-stone-900';
    const dpErr    = 'border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/30';

    const sectionTitle = 'mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400';
    const fieldLabel   = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300';
    const fieldError   = 'mt-1 text-xs text-rose-600 dark:text-rose-400';
    const required     = 'text-rose-500';
</script>

<form onsubmit={handleSubmit} novalidate>
    <div class="max-h-[75vh] overflow-y-auto px-6 py-5">

        {#if error}
            <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                       text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                {error}
            </div>
        {/if}

        <!-- Person section -->
        <p class={sectionTitle}>Persona</p>
        {#if mode === 'create'}
            <div class="mb-1">
                <PersonPicker
                    onselect={(p) => (selectedPerson = p)}
                    disabled={submitting}
                    error={!!fieldErrors.person}
                    excludeLinkedPatients={true}
                />
            </div>
            {#if fieldErrors.person}
                <p class={fieldError}>{fieldErrors.person}</p>
            {/if}
        {:else if initial}
            <div class="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50
                        px-4 py-3 dark:border-stone-700 dark:bg-stone-800/50">
                <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                            bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400">
                    <IconUser size={16} aria-hidden="true" />
                </div>
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                        {initial.surnames}, {initial.names}
                    </p>
                    <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                        {initial.email}
                    </p>
                </div>
            </div>
        {/if}

        <!-- MRN — only in edit mode (auto-generated on create) -->
        {#if mode === 'edit'}
            <div class="mt-6">
                <p class={sectionTitle}>Historia clínica</p>
                <div>
                    <label for="p-mrn" class={fieldLabel}>
                        N.° de historia clínica <span class={required} aria-hidden="true">*</span>
                    </label>
                    <TextInput
                        id="p-mrn"
                        bind:value={medicalRecordNumber}
                        maxLength={50}
                        disabled={submitting}
                        class={fieldErrors.mrn ? dpErr : dpNormal}
                    />
                    {#if fieldErrors.mrn}<p class={fieldError}>{fieldErrors.mrn}</p>{/if}
                </div>
            </div>
        {/if}

        <!-- Allergies section -->
        <div class="mt-6">
            <p class={sectionTitle}>
                Alergias <span class="ml-1 text-xs font-normal normal-case text-stone-400">(opcional)</span>
            </p>

            {#if mode === 'create'}
                <AllergySelector
                    onchange={(a) => (selectedAllergies = a)}
                    disabled={submitting}
                />
            {:else if initial}
                {#if initial.allergies.length > 0}
                    <ul class="space-y-1">
                        {#each initial.allergies as a (a.patientAllergyCode)}
                            <li class="flex flex-col rounded-lg border border-stone-200 bg-stone-50
                                       px-3 py-2 dark:border-stone-700 dark:bg-stone-800/50">
                                <span class="text-sm font-medium text-stone-800 dark:text-stone-100">
                                    {a.allergyName}
                                </span>
                                {#if a.notes}
                                    <span class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                                        {a.notes}
                                    </span>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="text-xs text-stone-400 dark:text-stone-500">Sin alergias registradas.</p>
                {/if}
                <div class="mt-2 flex items-start gap-2 rounded-lg border border-stone-200
                            bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-800/50">
                    <IconAlertCircle size={14} class="mt-0.5 shrink-0 text-stone-400" aria-hidden="true" />
                    <p class="text-xs text-stone-500 dark:text-stone-400">
                        La gestión de alergias se realiza desde el módulo de paciente.
                    </p>
                </div>
            {/if}
        </div>

    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
        <button
            type="button"
            onclick={oncancel}
            disabled={submitting}
            class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                   text-stone-600 transition-colors
                   hover:bg-stone-50 hover:text-stone-900
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-stone-700 dark:text-stone-400
                   dark:hover:bg-stone-700 dark:hover:text-stone-50"
        >
            Cancelar
        </button>
        <button
            type="submit"
            disabled={submitting}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                   text-white transition-colors
                   hover:bg-teal-600
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            {submitting ? 'Guardando…' : mode === 'create' ? 'Registrar paciente' : 'Guardar cambios'}
        </button>
    </div>
</form>
