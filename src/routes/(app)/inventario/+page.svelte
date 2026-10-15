<!-- src/routes/(app)/inventario/+page.svelte -->
<script lang="ts">
    import { page } from '$app/state';
    import InventoryPage from '$lib/features/inventory/components/InventoryPage.svelte';

    const lowStockOnly = page.url.searchParams.get('stock') === 'bajo';
</script>

<svelte:head>
    <title>Inventario — RxLink</title>
</svelte:head>

<InventoryPage {lowStockOnly} />
