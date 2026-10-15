<!-- src/lib/features/inventory/components/StockMovementForm.svelte -->
<!-- Fields of a manual stock movement; the parent owns submission. -->
<script lang="ts">
    import DatePicker from '$lib/components/ui/DatePicker.svelte';
    import { kindNeedsReason, manualKinds, type ManualKind } from '../movementTypes';

    interface Props {
        kind: ManualKind;
        quantity: string;
        batchNumber: string;
        expiresOn: string;
        reason: string;
        disabled?: boolean;
    }
    let {
        kind = $bindable(),
        quantity = $bindable(),
        batchNumber = $bindable(),
        expiresOn = $bindable(),
        reason = $bindable(),
        disabled = false
    }: Props = $props();

    const inputClass = `w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
        focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
        disabled:cursor-not-allowed disabled:opacity-50
        dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50`;
    const labelClass = 'mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300';
</script>

<div class="space-y-4">
    <div>
        <label for="movement-kind" class={labelClass}>Tipo de movimiento</label>
        <select id="movement-kind" bind:value={kind} {disabled} class={inputClass}>
            {#each manualKinds as option (option.id)}
                <option value={option.id}>{option.label}</option>
            {/each}
        </select>
    </div>

    <div>
        <label for="movement-quantity" class={labelClass}>Cantidad</label>
        <input
            id="movement-quantity"
            type="number"
            min="0.001"
            step="any"
            inputmode="decimal"
            bind:value={quantity}
            {disabled}
            class={inputClass}
        />
    </div>

    {#if kind === 'Entry'}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label for="movement-batch" class={labelClass}>Lote (opcional)</label>
                <input id="movement-batch" type="text" maxlength="50" bind:value={batchNumber} {disabled} class={inputClass} />
            </div>
            <div>
                <label for="movement-expires" class={labelClass}>Vence (opcional)</label>
                <DatePicker id="movement-expires" bind:value={expiresOn} {disabled} />
            </div>
        </div>
    {/if}

    {#if kindNeedsReason(kind)}
        <div>
            <label for="movement-reason" class={labelClass}>Motivo</label>
            <textarea
                id="movement-reason"
                rows="2"
                maxlength="500"
                bind:value={reason}
                {disabled}
                class="{inputClass} resize-none"
            ></textarea>
        </div>
    {/if}
</div>
