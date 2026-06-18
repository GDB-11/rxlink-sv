<!-- src/lib/features/admin-appointments/components/AdminAppointmentFilters.svelte -->
<script lang="ts">
    import { untrack } from 'svelte';
    import { IconSearch, IconX } from '@tabler/icons-svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';

    interface Props {
        patientSearch: string;
        date:          string;
        statusName:    string;
        loading:       boolean;
        onchange: (patientSearch: string, date: string, statusName: string) => void;
    }
    let { patientSearch, date, statusName, loading, onchange }: Props = $props();

    let localSearch = $state(untrack(() => patientSearch));
    let localDate   = $state(untrack(() => date));
    let localStatus = $state(untrack(() => statusName));

    const STATUS_OPTIONS = [
        { value: '',              label: 'Todos los estados' },
        { value: 'PendientePago', label: 'Pendiente pago' },
        { value: 'Confirmado',    label: 'Confirmado' },
        { value: 'Cancelado',     label: 'Cancelado' },
        { value: 'Completado',    label: 'Completado' },
        { value: 'NoAsistio',     label: 'No asistió' }
    ];

    let searchTimer: ReturnType<typeof setTimeout> | null = null;

    function onSearchInput(): void {
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            onchange(localSearch, localDate, localStatus);
        }, 350);
    }

    // Watch date changes (DatePicker uses bind:value — track via effect)
    let prevDate = untrack(() => localDate);
    $effect(() => {
        const d = localDate;
        if (d !== prevDate) {
            prevDate = d;
            onchange(localSearch, d, localStatus);
        }
    });

    function onStatusChange(): void {
        onchange(localSearch, localDate, localStatus);
    }

    function clear(): void {
        localSearch = '';
        localDate   = '';
        localStatus = '';
        onchange('', '', '');
    }

    const hasFilters = $derived(!!localSearch || !!localDate || !!localStatus);
</script>

<div class="flex flex-wrap items-end gap-3">
    <!-- Patient search -->
    <div class="min-w-[200px] flex-1">
        <label for="admin-apt-search" class="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Paciente
        </label>
        <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <IconSearch size={14} class="text-stone-400" aria-hidden="true" />
            </div>
            <input
                id="admin-apt-search"
                type="text"
                bind:value={localSearch}
                oninput={onSearchInput}
                disabled={loading}
                placeholder="Buscar por nombre o apellido…"
                autocomplete="off"
                class="w-full rounded-lg border border-stone-200 bg-white py-2 pl-8 pr-3 text-sm
                       text-stone-900 placeholder-stone-400 transition-colors
                       focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                       disabled:cursor-not-allowed disabled:opacity-50
                       dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
        </div>
    </div>

    <!-- Date -->
    <div class="min-w-[160px] flex-1">
        <p class="mb-1.5 text-xs font-medium text-stone-600 dark:text-stone-400" aria-hidden="true">Fecha</p>
        <DatePicker bind:value={localDate} disabled={loading} placeholder="Cualquier fecha" />
    </div>

    <!-- Status -->
    <div class="min-w-[160px] flex-1">
        <label for="admin-apt-status" class="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Estado
        </label>
        <select
            id="admin-apt-status"
            bind:value={localStatus}
            onchange={onStatusChange}
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

    <!-- Clear -->
    {#if hasFilters}
        <button
            type="button"
            onclick={clear}
            disabled={loading}
            class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2
                   text-sm text-stone-500 transition-colors hover:bg-stone-50
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
        >
            <IconX size={14} aria-hidden="true" />
            Limpiar
        </button>
    {/if}
</div>
