<!-- src/lib/features/inventory/components/InventoryReportPanel.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import ReportRangeFilters from '$lib/features/reports/components/ReportRangeFilters.svelte';
    import ReportTable from '$lib/features/reports/components/ReportTable.svelte';
    import { stockReportColumns } from '../reportColumns';
    import { stockReport } from '../stores/stockReport.svelte';

    onMount(() => stockReport.load());
</script>

<div class="space-y-4">
    <p class="text-sm text-stone-600 dark:text-stone-400">
        Movimientos de stock por medicamento en el rango. El stock actual es el saldo de hoy, no el del último día.
    </p>

    <ReportRangeFilters
        from={stockReport.from}
        to={stockReport.to}
        loading={stockReport.loading}
        onchange={(from, to) => stockReport.setRange(from, to)}
    />

    <ErrorAlert message={stockReport.error} />

    <ReportTable columns={stockReportColumns} rows={stockReport.rows} loading={stockReport.loading} />
</div>
