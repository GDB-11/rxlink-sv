<!-- src/lib/features/allergies/components/AllergyPagination.svelte -->
<script lang="ts">
    import { IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';

    interface Props {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        loading?: boolean;
        onPageChange: (page: number) => void;
    }
    let { page, pageSize, totalCount, totalPages, loading = false, onPageChange }: Props = $props();

    const from = $derived(totalCount === 0 ? 0 : (page - 1) * pageSize + 1);
    const to = $derived(Math.min(page * pageSize, totalCount));
</script>

<div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-stone-500 dark:text-stone-400">
        {#if totalCount === 0}
            Sin resultados
        {:else}
            Mostrando
            <span class="font-medium text-stone-700 dark:text-stone-300">{from}–{to}</span>
            de
            <span class="font-medium text-stone-700 dark:text-stone-300">{totalCount}</span>
        {/if}
    </p>

    <div class="flex items-center gap-2">
        <button
            type="button"
            onclick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5
                   text-sm text-stone-600 transition-colors
                   hover:bg-stone-50 hover:text-stone-900
                   disabled:cursor-not-allowed disabled:opacity-40
                   dark:border-stone-700 dark:text-stone-400
                   dark:hover:bg-stone-800 dark:hover:text-stone-50"
            aria-label="Página anterior"
        >
            <IconChevronLeft size={16} aria-hidden="true" />
            Anterior
        </button>

        <span class="min-w-[4rem] text-center text-sm font-medium text-stone-700 dark:text-stone-300">
            {page} / {totalPages}
        </span>

        <button
            type="button"
            onclick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5
                   text-sm text-stone-600 transition-colors
                   hover:bg-stone-50 hover:text-stone-900
                   disabled:cursor-not-allowed disabled:opacity-40
                   dark:border-stone-700 dark:text-stone-400
                   dark:hover:bg-stone-800 dark:hover:text-stone-50"
            aria-label="Página siguiente"
        >
            Siguiente
            <IconChevronRight size={16} aria-hidden="true" />
        </button>
    </div>
</div>
