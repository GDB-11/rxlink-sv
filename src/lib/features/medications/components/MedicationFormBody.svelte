<!-- src/lib/features/medications/components/MedicationFormBody.svelte -->
<!-- Mounted fresh on every open via {#key} in MedicationForm — no $effect needed. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import type { MedicationResponse, MedicationRequestBody } from '$lib/api/medicationApi';
    import type { LookupItem } from '../stores/medications.svelte';

    interface Props {
        mode: 'create' | 'edit';
        initial: MedicationResponse | null;
        knownForms: LookupItem[];
        knownRoutes: LookupItem[];
        submitting: boolean;
        error: string | null;
        onsubmit: (data: MedicationRequestBody) => void;
        oncancel: () => void;
    }
    let {
        mode,
        initial,
        knownForms,
        knownRoutes,
        submitting,
        error,
        onsubmit,
        oncancel
    }: Props = $props();

    let genericName           = $state(untrack(() => initial?.genericName ?? ''));
    let commercialName        = $state(untrack(() => initial?.commercialName ?? ''));
    let concentration         = $state(untrack(() => initial?.concentration ?? ''));
    let pharmaceuticalFormId  = $state(untrack(() => initial?.pharmaceuticalFormId ?? 0));
    let administrationRouteId = $state(untrack(() => initial?.administrationRouteId ?? 0));
    let fieldErrors           = $state<Record<string, string>>({});

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!genericName.trim()) e.genericName = 'El nombre genérico es requerido.';
        if (!concentration.trim()) e.concentration = 'La concentración es requerida.';
        if (!pharmaceuticalFormId) e.pharmaceuticalFormId = 'Seleccione una forma farmacéutica.';
        if (!administrationRouteId) e.administrationRouteId = 'Seleccione una vía de administración.';
        fieldErrors = e;
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!validate()) return;
        onsubmit({
            PharmaceuticalFormId: pharmaceuticalFormId,
            AdministrationRouteId: administrationRouteId,
            GenericName: genericName.trim(),
            CommercialName: commercialName.trim() || undefined,
            Concentration: concentration.trim()
        });
    }

    const inputBase =
        'w-full rounded-lg border px-3 py-2 text-sm transition-colors ' +
        'text-stone-900 placeholder:text-stone-400 ' +
        'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ' +
        'disabled:cursor-not-allowed disabled:opacity-50 ' +
        'dark:text-stone-50 dark:placeholder:text-stone-600 dark:focus:border-teal-600 ';

    const inputNormal = inputBase + 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900';
    const inputErr    = inputBase + 'border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/30';
</script>

<form onsubmit={handleSubmit} novalidate>
    <div class="space-y-4 px-6 py-5">

        {#if error}
            <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                       text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                {error}
            </div>
        {/if}

        <!-- Generic name -->
        <div>
            <label for="med-genericName" class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                Nombre genérico <span class="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
                id="med-genericName"
                type="text"
                bind:value={genericName}
                disabled={submitting}
                class={fieldErrors.genericName ? inputErr : inputNormal}
            />
            {#if fieldErrors.genericName}
                <p class="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.genericName}</p>
            {/if}
        </div>

        <!-- Commercial name -->
        <div>
            <label for="med-commercialName" class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                Nombre comercial
                <span class="ml-1 text-xs font-normal text-stone-400">(opcional)</span>
            </label>
            <input
                id="med-commercialName"
                type="text"
                bind:value={commercialName}
                disabled={submitting}
                placeholder="ej. Amoxil"
                class={inputNormal}
            />
        </div>

        <!-- Concentration -->
        <div>
            <label for="med-concentration" class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                Concentración <span class="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
                id="med-concentration"
                type="text"
                bind:value={concentration}
                disabled={submitting}
                placeholder="ej. 500 mg, 5 mg/ml"
                class={fieldErrors.concentration ? inputErr : inputNormal}
            />
            {#if fieldErrors.concentration}
                <p class="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.concentration}</p>
            {/if}
        </div>

        <!-- Pharmaceutical form + Administration route -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
                <label for="med-pharmForm" class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Forma farmacéutica <span class="text-rose-500" aria-hidden="true">*</span>
                </label>
                <select
                    id="med-pharmForm"
                    bind:value={pharmaceuticalFormId}
                    disabled={submitting}
                    class={fieldErrors.pharmaceuticalFormId ? inputErr : inputNormal}
                >
                    <option value={0}>— Seleccionar —</option>
                    {#each knownForms as form (form.id)}
                        <option value={form.id}>{form.name}</option>
                    {/each}
                </select>
                {#if fieldErrors.pharmaceuticalFormId}
                    <p class="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.pharmaceuticalFormId}</p>
                {/if}
            </div>

            <div>
                <label for="med-adminRoute" class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Vía de administración <span class="text-rose-500" aria-hidden="true">*</span>
                </label>
                <select
                    id="med-adminRoute"
                    bind:value={administrationRouteId}
                    disabled={submitting}
                    class={fieldErrors.administrationRouteId ? inputErr : inputNormal}
                >
                    <option value={0}>— Seleccionar —</option>
                    {#each knownRoutes as route (route.id)}
                        <option value={route.id}>{route.name}</option>
                    {/each}
                </select>
                {#if fieldErrors.administrationRouteId}
                    <p class="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.administrationRouteId}</p>
                {/if}
            </div>

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
            {submitting ? 'Guardando…' : mode === 'create' ? 'Crear' : 'Guardar cambios'}
        </button>
    </div>
</form>
