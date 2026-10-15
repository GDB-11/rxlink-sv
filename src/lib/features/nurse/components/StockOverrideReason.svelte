<!-- src/lib/features/nurse/components/StockOverrideReason.svelte -->
<!-- Shown when a dispensation exceeds the clinic's balance: the nurse may go ahead only with a reason. -->
<script lang="ts">
    interface Props {
        reason:    string;
        disabled?: boolean;
    }
    let { reason = $bindable(), disabled = false }: Props = $props();
</script>

<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
    <p class="text-sm font-medium text-amber-900 dark:text-amber-200">
        El stock no alcanza para esta dispensación.
    </p>
    <p class="mt-1 text-xs text-amber-800 dark:text-amber-300">
        Puedes dispensar igualmente indicando el motivo. El faltante queda registrado y el stock quedará en
        negativo hasta que se regularice.
    </p>
    <label for="stock-override-reason" class="mt-3 block text-xs font-medium text-amber-900 dark:text-amber-200">
        Motivo
    </label>
    <textarea
        id="stock-override-reason"
        bind:value={reason}
        {disabled}
        rows="2"
        maxlength="500"
        class="mt-1 w-full resize-none rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm
               text-stone-900 focus:border-amber-500 focus:outline-none
               disabled:cursor-not-allowed disabled:opacity-50
               dark:border-amber-700 dark:bg-stone-900 dark:text-stone-50"
    ></textarea>
</div>
