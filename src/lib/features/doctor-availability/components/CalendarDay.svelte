<!-- src/lib/features/doctor-availability/components/CalendarDay.svelte -->
<script lang="ts">
    import type { AvailabilityResponse } from '$lib/api/availabilityApi';
    import SlotChip from './SlotChip.svelte';

    interface Props {
        day:            number;
        date:           string;             // "YYYY-MM-DD"
        isCurrentMonth: boolean;
        slots:          AvailabilityResponse[];
        hasAvailable:   boolean;            // ≥1 free slot on this date
        isAdmin:        boolean;
        ondelete:       (code: string) => void;
    }
    let { day, date, isCurrentMonth, slots, hasAvailable, isAdmin, ondelete }: Props = $props();

    const today   = new Date().toISOString().slice(0, 10);
    const isToday = $derived(date === today);
</script>

<div
    class="relative min-h-[80px] border-r border-b border-stone-100 p-1.5 dark:border-stone-800
           {!isCurrentMonth
               ? 'bg-stone-50/60 dark:bg-stone-900/40'
               : isToday
               ? 'bg-teal-50/40 dark:bg-teal-900/10'
               : ''}"
>
    <!-- Left accent for days with free slots (current month only) -->
    {#if isCurrentMonth && hasAvailable}
        <span class="absolute inset-y-0 left-0 w-0.5 rounded-full bg-teal-400 dark:bg-teal-500"
              aria-hidden="true"></span>
    {/if}

    <!-- Day number -->
    <span
        class="mb-1 block text-right text-xs font-medium
               {!isCurrentMonth
                   ? 'text-stone-300 dark:text-stone-700'
                   : isToday
                   ? 'text-teal-700 dark:text-teal-400'
                   : 'text-stone-500 dark:text-stone-400'}"
    >
        {day}
    </span>

    <!-- Slot chips (current month only) -->
    {#if isCurrentMonth && slots.length > 0}
        <div class="flex flex-col gap-0.5">
            {#each slots as slot (slot.availabilityCode)}
                <SlotChip {slot} {isAdmin} {ondelete} />
            {/each}
        </div>
    {/if}
</div>
