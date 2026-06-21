<!-- src/lib/features/doctor-availability/components/AvailabilityHeader.svelte -->
<script lang="ts">
    import { IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';
    import type { UserResponse } from '$lib/api/userApi';
    import { availability } from '../stores/availability.svelte';

    interface Props {
        doctor:   UserResponse;
        month:    string;   // "YYYY-MM"
        isAdmin:  boolean;
        backHref: string;
        onadd:    () => void;
    }
    let { doctor, month, isAdmin, backHref, onadd }: Props = $props();

    const MONTHS = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const currentMonth = new Date().toISOString().slice(0, 7);

    const monthLabel = $derived.by(() => {
        const [y, m] = month.split('-');
        return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
    });

    const isPrevDisabled = $derived(month <= currentMonth);

    function prevMonth(m: string): string {
        const [y, mo] = m.split('-').map(Number);
        return mo === 1
            ? `${y - 1}-12`
            : `${y}-${String(mo - 1).padStart(2, '0')}`;
    }

    function nextMonth(m: string): string {
        const [y, mo] = m.split('-').map(Number);
        return mo === 12
            ? `${y + 1}-01`
            : `${y}-${String(mo + 1).padStart(2, '0')}`;
    }
</script>

<div class="space-y-3">
    <a
        href={backHref}
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors
               hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
    >
        <span aria-hidden="true">←</span>
        {isAdmin ? 'Volver a doctores' : 'Volver al inicio'}
    </a>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1
                class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
                style="font-family: 'Instrument Serif', serif;"
            >
                {doctor.surnames}, {doctor.names}
            </h1>
            {#if doctor.specialtyName}
                <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                    {doctor.specialtyName}
                </p>
            {/if}
        </div>

        {#if isAdmin}
            <button
                type="button"
                onclick={onadd}
                class="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg
                       bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors
                       hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
            >
                <IconPlus size={16} aria-hidden="true" />
                Agregar slots
            </button>
        {/if}
    </div>

    <div class="flex items-center gap-2">
        <button
            type="button"
            onclick={() => availability.setMonth(prevMonth(month))}
            disabled={isPrevDisabled || availability.loading}
            class="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors
                   hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40
                   dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Mes anterior"
        >
            <IconChevronLeft size={18} aria-hidden="true" />
        </button>

        <span class="min-w-[130px] text-center text-sm font-medium text-stone-700 dark:text-stone-300">
            {monthLabel}
        </span>

        <button
            type="button"
            onclick={() => availability.setMonth(nextMonth(month))}
            disabled={availability.loading}
            class="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors
                   hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40
                   dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Mes siguiente"
        >
            <IconChevronRight size={18} aria-hidden="true" />
        </button>
    </div>
</div>
