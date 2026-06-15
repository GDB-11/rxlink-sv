<!-- src/lib/features/doctor-availability/components/SlotChip.svelte -->
<script lang="ts">
    import { IconX } from '@tabler/icons-svelte';
    import type { AvailabilityResponse } from '$lib/api/availabilityApi';

    interface Props {
        slot:     AvailabilityResponse;
        isAdmin:  boolean;
        ondelete: (code: string) => void;
    }
    let { slot, isAdmin, ondelete }: Props = $props();
</script>

{#if slot.isBooked}
    <span
        class="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5
               text-xs text-stone-400 dark:bg-stone-800 dark:text-stone-500"
        title="Reservado"
    >
        {slot.startTime}
        <span aria-hidden="true" class="text-stone-300 dark:text-stone-600">●</span>
    </span>
{:else if isAdmin}
    <button
        type="button"
        onclick={() => ondelete(slot.availabilityCode)}
        class="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5
               text-xs text-teal-700 transition-colors
               hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50"
        aria-label="Eliminar slot {slot.startTime}"
    >
        {slot.startTime}
        <IconX size={10} aria-hidden="true" />
    </button>
{:else}
    <span
        class="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5
               text-xs text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
    >
        {slot.startTime}
    </span>
{/if}
