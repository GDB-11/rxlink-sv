<!-- src/lib/features/inventory/components/StockStatusBadge.svelte -->
<script lang="ts">
    import type { StockStatus } from '$lib/api/inventoryApi';

    interface Props {
        status: StockStatus;
    }
    let { status }: Props = $props();

    const styles: Record<StockStatus, { label: string; classes: string }> = {
        InStock: { label: 'En stock', classes: 'bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-300' },
        Low: { label: 'Stock bajo', classes: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300' },
        Out: { label: 'Sin stock', classes: 'bg-rose-100 text-rose-900 dark:bg-rose-900/50 dark:text-rose-300' }
    };
    const style = $derived(styles[status]);
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {style.classes}">
    {style.label}
</span>
