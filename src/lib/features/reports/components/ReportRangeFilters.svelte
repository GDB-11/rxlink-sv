<!-- src/lib/features/reports/components/ReportRangeFilters.svelte -->
<script lang="ts">
    import { untrack } from 'svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';

    interface Props {
        from:     string;
        to:       string;
        loading:  boolean;
        onchange: (from: string, to: string) => void;
    }
    let { from, to, loading, onchange }: Props = $props();

    let fromValue = $state(untrack(() => from));
    let toValue   = $state(untrack(() => to));

    function apply(): void {
        onchange(fromValue, toValue);
    }
</script>

<div class="flex flex-wrap items-end gap-3">
    <div class="space-y-1.5">
        <label for="report-from" class="text-sm font-medium text-stone-700 dark:text-stone-300">Desde</label>
        <DatePicker id="report-from" bind:value={fromValue} disabled={loading} />
    </div>
    <div class="space-y-1.5">
        <label for="report-to" class="text-sm font-medium text-stone-700 dark:text-stone-300">Hasta</label>
        <DatePicker id="report-to" bind:value={toValue} disabled={loading} />
    </div>
    <button
        type="button"
        onclick={apply}
        disabled={loading || !fromValue || !toValue}
        class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors
               hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60
               dark:bg-teal-600 dark:hover:bg-teal-700"
    >
        {loading ? 'Generando…' : 'Generar'}
    </button>
</div>
