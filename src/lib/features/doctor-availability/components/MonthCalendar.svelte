<!-- src/lib/features/doctor-availability/components/MonthCalendar.svelte -->
<script lang="ts">
    import type { AvailabilityResponse } from '$lib/api/availabilityApi';
    import CalendarDay from './CalendarDay.svelte';

    interface Props {
        slots:    AvailabilityResponse[];
        month:    string;   // "YYYY-MM"
        isAdmin:  boolean;
        ondelete: (code: string) => void;
    }
    let { slots, month, isAdmin, ondelete }: Props = $props();

    const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    interface Cell {
        date:           string;   // "YYYY-MM-DD"
        isCurrentMonth: boolean;
    }

    function pad2(n: number): string { return String(n).padStart(2, '0'); }

    function buildCalendarWeeks(m: string): Cell[][] {
        const [y, mo] = m.split('-').map(Number);

        // Use local-time Date constructor to avoid UTC-offset day-shift bugs
        const firstDOW   = new Date(y, mo - 1, 1).getDay();       // 0=Sun
        const offset     = firstDOW === 0 ? 6 : firstDOW - 1;     // Mon-first
        const lastDay    = new Date(y, mo, 0).getDate();

        const prevMo   = mo === 1  ? 12 : mo - 1;
        const prevY    = mo === 1  ? y - 1 : y;
        const prevLast = new Date(prevY, prevMo, 0).getDate();

        const nextMo = mo === 12 ? 1  : mo + 1;
        const nextY  = mo === 12 ? y + 1 : y;

        const cells: Cell[] = [];

        // Trailing days of previous month
        for (let i = offset - 1; i >= 0; i--) {
            const d = prevLast - i;
            cells.push({ date: `${prevY}-${pad2(prevMo)}-${pad2(d)}`, isCurrentMonth: false });
        }

        // Current month
        for (let d = 1; d <= lastDay; d++) {
            cells.push({ date: `${y}-${pad2(mo)}-${pad2(d)}`, isCurrentMonth: true });
        }

        // Leading days of next month
        const totalCells = Math.ceil((offset + lastDay) / 7) * 7;
        const padAfter   = totalCells - offset - lastDay;
        for (let d = 1; d <= padAfter; d++) {
            cells.push({ date: `${nextY}-${pad2(nextMo)}-${pad2(d)}`, isCurrentMonth: false });
        }

        const weeks: Cell[][] = [];
        for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
        return weeks;
    }

    const weeks = $derived(buildCalendarWeeks(month));

    const slotsByDate = $derived(
        slots.reduce((acc, s) => {
            (acc[s.date] ??= []).push(s);
            return acc;
        }, {} as Record<string, AvailabilityResponse[]>)
    );

    // Dates that have at least one free (non-booked) slot
    const availableDates = $derived(
        new Set(slots.filter(s => !s.isBooked).map(s => s.date))
    );
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <!-- Header row -->
    <div class="grid min-w-[560px] grid-cols-7 border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
        {#each DAYS as label (label)}
            <div class="px-2 py-2 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
                {label}
            </div>
        {/each}
    </div>

    <!-- Calendar grid -->
    <div class="grid min-w-[560px] grid-cols-7">
        {#each weeks as week (week.map(c => c.date).join(','))}
            {#each week as cell (cell.date)}
                {@const day = parseInt(cell.date.slice(8), 10)}
                <CalendarDay
                    {day}
                    date={cell.date}
                    isCurrentMonth={cell.isCurrentMonth}
                    slots={cell.isCurrentMonth ? (slotsByDate[cell.date] ?? []) : []}
                    hasAvailable={availableDates.has(cell.date)}
                    {isAdmin}
                    {ondelete}
                />
            {/each}
        {/each}
    </div>
</div>
