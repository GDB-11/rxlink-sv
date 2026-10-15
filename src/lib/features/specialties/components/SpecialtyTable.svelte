<!-- src/lib/features/specialties/components/SpecialtyTable.svelte -->
<script lang="ts">
    import type { SpecialtyResponse } from '$lib/api/specialtyApi';
    import CatalogStatusBadge from '$lib/components/ui/CatalogStatusBadge.svelte';
    import InlineNumberEditor from '$lib/components/ui/InlineNumberEditor.svelte';
    import ToggleSwitch from '$lib/components/ui/ToggleSwitch.svelte';

    interface Props {
        items: SpecialtyResponse[];
        loading: boolean;
        busy?: boolean;
        onToggle: (item: SpecialtyResponse, enabled: boolean) => void;
        onPrice: (item: SpecialtyResponse, kind: 'priceInPerson' | 'priceVirtual', value: number) => Promise<boolean>;
    }
    let { items, loading, busy = false, onToggle, onPrice }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
    const money = (v: number) => `S/ ${v.toFixed(2)}`;

    /** A specialty needs both prices above zero to be offered; a deactivated one can't be newly enabled. */
    function cannotEnable(item: SpecialtyResponse): boolean {
        return !item.isEnabled && (!item.isActive || item.priceInPerson <= 0 || item.priceVirtual <= 0);
    }
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Nombre</th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Precio presencial</th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Precio virtual</th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 sm:table-cell">Catálogo</th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Habilitada</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
            {#if loading}
                {#each skeletonRows as n (n)}
                    <tr>
                        <td class="px-4 py-3"><div class="h-4 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div></td>
                        <td class="px-4 py-3"><div class="h-4 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div></td>
                        <td class="px-4 py-3"><div class="h-4 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div></td>
                        <td class="hidden px-4 py-3 sm:table-cell"><div class="h-5 w-14 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div></td>
                        <td class="px-4 py-3"><div class="h-5 w-9 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div></td>
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="5" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-500 dark:text-stone-400">No se encontraron especialidades.</p>
                    </td>
                </tr>
            {:else}
                {#each items as item (item.specialtyCode)}
                    <tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">{item.name}</td>
                        <td class="px-4 py-3">
                            <InlineNumberEditor
                                value={item.priceInPerson}
                                display={money(item.priceInPerson)}
                                label={item.name}
                                field="precio presencial"
                                step={0.01}
                                disabled={busy}
                                onsave={(v) => onPrice(item, 'priceInPerson', v)}
                            />
                        </td>
                        <td class="px-4 py-3">
                            <InlineNumberEditor
                                value={item.priceVirtual}
                                display={money(item.priceVirtual)}
                                label={item.name}
                                field="precio virtual"
                                step={0.01}
                                disabled={busy}
                                onsave={(v) => onPrice(item, 'priceVirtual', v)}
                            />
                        </td>
                        <td class="hidden px-4 py-3 sm:table-cell"><CatalogStatusBadge isActive={item.isActive} /></td>
                        <td class="px-4 py-3">
                            <ToggleSwitch
                                checked={item.isEnabled}
                                label="Habilitar {item.name}"
                                disabled={busy || cannotEnable(item)}
                                onchange={(v) => onToggle(item, v)}
                            />
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
