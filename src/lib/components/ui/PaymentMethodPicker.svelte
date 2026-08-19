<!-- src/lib/components/ui/PaymentMethodPicker.svelte -->
<!-- Payment-method choice + live coverage breakdown. Shared by the appointment booking
     form ('booking' mode — Seguro/Particular/Pagar después) and the admin "mark paid"
     flow ('resolve' mode — Seguro/Particular only, since the payment is being resolved now). -->
<script lang="ts">
    import type { InsuranceLookupItemResponse } from '$lib/api/lookupsApi';
    import SearchSelect from './SearchSelect.svelte';

    type PaymentMode = 'insurance' | 'particular' | 'later';

    interface Props {
        insurances: InsuranceLookupItemResponse[];
        basePrice: number | null;
        mode: 'booking' | 'resolve';
        paymentMode?: PaymentMode;
        insuranceCode?: string | null;
        disabled?: boolean;
    }

    let {
        insurances,
        basePrice,
        mode,
        paymentMode = $bindable('later'),
        insuranceCode = $bindable(null),
        disabled = false
    }: Props = $props();

    const insuranceOptions = $derived(insurances.map(i => ({ value: i.code, label: i.name })));

    const selectedInsurance = $derived(
        insuranceCode ? (insurances.find(i => i.code === insuranceCode) ?? null) : null
    );

    const coveragePercentage = $derived(
        paymentMode === 'insurance' && selectedInsurance ? selectedInsurance.coveragePercentage : 0
    );

    const coveredAmount = $derived(
        basePrice !== null ? Math.round(basePrice * coveragePercentage) / 100 : null
    );

    const patientAmount = $derived(
        basePrice !== null && coveredAmount !== null ? basePrice - coveredAmount : null
    );

    const paymentResolved = $derived(
        paymentMode === 'particular' || (paymentMode === 'insurance' && !!insuranceCode)
    );

    const showBreakdown = $derived(basePrice !== null && paymentResolved);
    const priceUnknown = $derived(basePrice === null && paymentResolved);

    function fmt(amount: number): string {
        return `S/ ${amount.toFixed(2)}`;
    }

    function selectMode(next: PaymentMode) {
        if (disabled) return;
        paymentMode = next;
        if (next !== 'insurance') insuranceCode = null;
    }

    const optionBase =
        'rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';
    const optionActive =
        'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-600 dark:bg-teal-900/30 dark:text-teal-300';
    const optionInactive =
        'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800';
</script>

<div class="space-y-3">
    <div class="flex flex-wrap gap-2">
        <button
            type="button"
            {disabled}
            onclick={() => selectMode('insurance')}
            class="{optionBase} {paymentMode === 'insurance' ? optionActive : optionInactive}"
        >
            Seguro
        </button>
        <button
            type="button"
            {disabled}
            onclick={() => selectMode('particular')}
            class="{optionBase} {paymentMode === 'particular' ? optionActive : optionInactive}"
        >
            Particular
        </button>
        {#if mode === 'booking'}
            <button
                type="button"
                {disabled}
                onclick={() => selectMode('later')}
                class="{optionBase} {paymentMode === 'later' ? optionActive : optionInactive}"
            >
                Pagar después
            </button>
        {/if}
    </div>

    {#if paymentMode === 'insurance'}
        <SearchSelect
            value={insuranceCode ?? ''}
            options={insuranceOptions}
            placeholder="— Seleccionar seguro —"
            searchPlaceholder="Buscar seguro…"
            {disabled}
            onchange={(v) => (insuranceCode = v)}
        />
    {/if}

    {#if showBreakdown && basePrice !== null && coveredAmount !== null && patientAmount !== null}
        <div class="space-y-1 rounded-lg bg-stone-50 p-3 text-sm dark:bg-stone-800/50">
            <div class="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Precio base</span>
                <span>{fmt(basePrice)}</span>
            </div>
            <div class="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Cobertura</span>
                <span>{coveragePercentage}%</span>
            </div>
            <div class="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Seguro cubre</span>
                <span>{fmt(coveredAmount)}</span>
            </div>
            <div class="flex justify-between border-t border-stone-200 pt-1 font-semibold text-stone-900 dark:border-stone-700 dark:text-stone-50">
                <span>Paciente paga</span>
                <span>{fmt(patientAmount)}</span>
            </div>
        </div>
    {:else if priceUnknown}
        <p class="text-sm text-stone-400">El monto se calculará al confirmar el pago.</p>
    {/if}
</div>
