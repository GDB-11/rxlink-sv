<!-- src/lib/features/doctor-consultations/components/AppointmentFilters.svelte -->
<script lang="ts">
    import { untrack } from 'svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';

    interface Props {
        date:    string | null;
        status:  string | null;
        loading: boolean;
        onchange: (date: string | null, status: string | null) => void;
    }
    let { date, status, loading, onchange }: Props = $props();

    let localDate   = $state(untrack(() => date ?? ''));
    let localStatus = $state(untrack(() => status ?? ''));

    const STATUS_OPTIONS = [
        { value: '',             label: 'Todos los estados' },
        { value: 'Confirmado',   label: 'Confirmado' },
        { value: 'Completado',   label: 'Completado' },
        { value: 'Cancelado',    label: 'Cancelado' },
        { value: 'NoAsistio',    label: 'No asistió' },
        { value: 'PendientePago', label: 'Pendiente pago' }
    ];

    function apply(): void {
        onchange(localDate || null, localStatus || null);
    }

    function clear(): void {
        localDate   = '';
        localStatus = '';
        onchange(null, null);
    }

    const hasFilters = $derived(!!localDate || !!localStatus);
</script>

<div class="flex flex-wrap items-end gap-3">
    <div class="min-w-[160px] flex-1">
        <p class="mb-1.5 text-xs font-medium text-stone-600 dark:text-stone-400" aria-hidden="true">Fecha</p>
        <DatePicker bind:value={localDate} disabled={loading} placeholder="Cualquier fecha" />
    </div>

    <div class="min-w-[160px] flex-1">
        <label for="apt-status-filter" class="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Estado
        </label>
        <select
            id="apt-status-filter"
            bind:value={localStatus}
            disabled={loading}
            class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
                   transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
        >
            {#each STATUS_OPTIONS as opt (opt.value)}
                <option value={opt.value}>{opt.label}</option>
            {/each}
        </select>
    </div>

    <div class="flex gap-2">
        <button
            type="button"
            onclick={apply}
            disabled={loading}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white
                   transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50
                   dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            Filtrar
        </button>
        {#if hasFilters}
            <button
                type="button"
                onclick={clear}
                disabled={loading}
                class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                       text-stone-600 transition-colors hover:bg-stone-50
                       disabled:cursor-not-allowed disabled:opacity-50
                       dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
            >
                Limpiar
            </button>
        {/if}
    </div>
</div>
