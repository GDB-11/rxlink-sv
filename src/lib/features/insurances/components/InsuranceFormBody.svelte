<!-- src/lib/features/insurances/components/InsuranceFormBody.svelte -->
<!-- Mounted fresh on every open via {#key} in InsuranceForm — no $effect needed. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import type { InsuranceResponse, InsuranceRequestBody } from '$lib/api/insuranceApi';
    import TextInput from '$lib/components/ui/TextInput.svelte';

    interface Props {
        mode: 'create' | 'edit';
        initial: InsuranceResponse | null;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: InsuranceRequestBody) => void;
        oncancel: () => void;
    }
    let { mode, initial, submitting, error, onsubmit, oncancel }: Props = $props();

    // DB constraints (Insurance table):
    //   Name VARCHAR(100) NOT NULL
    //   CoveragePercentage NUMERIC(5,2) NOT NULL CHECK (BETWEEN 0 AND 100)
    const NAME_MAX = 100;

    let name               = $state(untrack(() => initial?.name ?? ''));
    let coveragePercentage = $state(untrack(() => initial?.coveragePercentage?.toString() ?? ''));
    let fieldErrors        = $state<Record<string, string>>({});

    function parsePercentage(raw: string): number {
        return Number(raw.replace(',', '.'));
    }

    function validate(): boolean {
        const e: Record<string, string> = {};
        const n = name.trim();
        if (!n) e.name = 'El nombre es requerido.';
        else if (n.length > NAME_MAX) e.name = `El nombre no debe superar ${NAME_MAX} caracteres.`;

        const pct = parsePercentage(coveragePercentage);
        if (!coveragePercentage.trim() || !Number.isFinite(pct) || pct < 0 || pct > 100) {
            e.coveragePercentage = 'Ingrese un porcentaje de cobertura entre 0 y 100.';
        }

        fieldErrors = e;
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!validate()) return;
        onsubmit({ Name: name.trim(), CoveragePercentage: parsePercentage(coveragePercentage) });
    }

    const dpNormal = 'border-stone-200 bg-white focus:border-teal-500 dark:border-stone-700 dark:bg-stone-900';
    const dpErr    = 'border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/30';
    function dpCls(field: string) {
        return fieldErrors[field] ? dpErr : dpNormal;
    }

    const fieldLabel = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300';
    const fieldError = 'mt-1 text-xs text-rose-600 dark:text-rose-400';
    const required   = 'text-rose-500';
</script>

<form onsubmit={handleSubmit} novalidate>
    <div class="space-y-4 px-6 py-5">

        {#if error}
            <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                       text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                {error}
            </div>
        {/if}

        <!-- Name -->
        <div>
            <label for="insurance-name" class={fieldLabel}>
                Nombre <span class={required} aria-hidden="true">*</span>
            </label>
            <TextInput
                id="insurance-name"
                bind:value={name}
                maxLength={NAME_MAX}
                disabled={submitting}
                placeholder="ej. Rimac Seguros"
                class={dpCls('name')}
            />
            {#if fieldErrors.name}
                <p class={fieldError}>{fieldErrors.name}</p>
            {/if}
        </div>

        <!-- Coverage percentage -->
        <div>
            <label for="insurance-coverage" class={fieldLabel}>
                Cobertura (%) <span class={required} aria-hidden="true">*</span>
            </label>
            <input
                id="insurance-coverage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                bind:value={coveragePercentage}
                disabled={submitting}
                placeholder="ej. 80"
                class="w-full rounded-lg border px-3 py-2 text-sm transition-colors
                       text-stone-900 placeholder:text-stone-400
                       focus:outline-none focus:ring-2 focus:ring-teal-500/20
                       disabled:cursor-not-allowed disabled:opacity-50
                       dark:text-stone-50 dark:placeholder:text-stone-600
                       {dpCls('coveragePercentage')}"
            />
            {#if fieldErrors.coveragePercentage}
                <p class={fieldError}>{fieldErrors.coveragePercentage}</p>
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
            {submitting ? 'Guardando…' : mode === 'create' ? 'Crear' : 'Guardar cambios'}
        </button>
    </div>
</form>
