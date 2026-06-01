<!-- src/lib/features/patients/components/PatientPagination.svelte -->
<script lang="ts">
    interface Props {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        loading: boolean;
        onPageChange: (page: number) => void;
    }
    let { page, pageSize, totalCount, totalPages, loading, onPageChange }: Props = $props();

    const start = $derived((page - 1) * pageSize + 1);
    const end   = $derived(Math.min(page * pageSize, totalCount));
</script>

<div class="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
    <span>
        Mostrando {start}–{end} de {totalCount} paciente{totalCount !== 1 ? 's' : ''}
    </span>
    <div class="flex gap-1">
        <button
            type="button"
            onclick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                   transition-colors hover:bg-stone-50
                   disabled:cursor-not-allowed disabled:opacity-40
                   dark:border-stone-700 dark:hover:bg-stone-800"
        >
            Anterior
        </button>
        <button
            type="button"
            onclick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                   transition-colors hover:bg-stone-50
                   disabled:cursor-not-allowed disabled:opacity-40
                   dark:border-stone-700 dark:hover:bg-stone-800"
        >
            Siguiente
        </button>
    </div>
</div>
