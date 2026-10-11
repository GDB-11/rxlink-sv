<!-- src/lib/features/reports/components/ReportsPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { reports } from '../stores/reports.svelte';
    import { reportDefinitions } from '../reportDefinitions';
    import ReportTabs from './ReportTabs.svelte';
    import ReportRangeFilters from './ReportRangeFilters.svelte';
    import ReportTable from './ReportTable.svelte';

    onMount(() => {
        reports.reset();
        reports.load();
    });

    const definition = $derived(reportDefinitions.find(d => d.kind === reports.kind)!);
</script>

<div class="space-y-6">
    <div>
        <h1 class="text-xl font-semibold text-stone-900 dark:text-stone-50">Reportes de auditoría</h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Consultar un reporte queda registrado en la auditoría.
        </p>
    </div>

    <ReportTabs active={reports.kind} onselect={(kind) => reports.setKind(kind)} />

    <p class="text-sm text-stone-600 dark:text-stone-400">{definition.description}</p>

    <ReportRangeFilters
        from={reports.from}
        to={reports.to}
        loading={reports.loading}
        onchange={(from, to) => reports.setRange(from, to)}
    />

    <ErrorAlert message={reports.error} />

    <ReportTable columns={definition.columns} rows={reports.rows} loading={reports.loading} />
</div>
