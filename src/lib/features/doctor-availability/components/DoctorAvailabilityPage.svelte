<!-- src/lib/features/doctor-availability/components/DoctorAvailabilityPage.svelte -->
<script lang="ts">
    import { auth } from '$lib/features/auth';
    import { availability } from '../stores/availability.svelte';
    import AvailabilityHeader from './AvailabilityHeader.svelte';
    import MonthCalendar from './MonthCalendar.svelte';
    import AddSlotsModal from './AddSlotsModal.svelte';

    interface Props {
        userCode: string;
    }
    let { userCode }: Props = $props();

    const isAdmin = $derived(auth.roleName === 'Administrador');

    let addModalOpen = $state(false);
    let modalKey     = $state(0);

    $effect(() => {
        availability.load(userCode);
    });

    function openAddModal() {
        availability.clearSubmitError();
        modalKey++;
        addModalOpen = true;
    }
</script>

<div class="space-y-6">

    {#if availability.loading && !availability.doctor}
        <div class="flex items-center justify-center py-20">
            <span
                class="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-teal-500
                       dark:border-stone-700 dark:border-t-teal-400"
                aria-hidden="true"
            ></span>
        </div>

    {:else if availability.error && !availability.doctor}
        <a
            href="/doctores"
            class="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors
                   hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
        >
            <span aria-hidden="true">←</span>
            Volver a doctores
        </a>
        <div class="rounded-xl border border-rose-200 bg-rose-50 px-6 py-5 dark:border-rose-800 dark:bg-rose-900/30">
            <p class="text-sm text-rose-700 dark:text-rose-400">{availability.error}</p>
            <button
                type="button"
                onclick={() => availability.load(userCode)}
                class="mt-3 cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium
                       text-white transition-colors hover:bg-rose-700"
            >
                Reintentar
            </button>
        </div>

    {:else if availability.doctor}
        <AvailabilityHeader
            doctor={availability.doctor}
            month={availability.month}
            {isAdmin}
            onadd={openAddModal}
        />

        {#if availability.submitError}
            <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                       dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                {availability.submitError}
            </div>
        {/if}

        <MonthCalendar
            slots={availability.slots}
            month={availability.month}
            {isAdmin}
            ondelete={(code) => availability.removeSlot(code)}
        />
    {/if}

</div>

{#key modalKey}
    <AddSlotsModal
        open={addModalOpen}
        doctorName={availability.doctor
            ? `${availability.doctor.surnames}, ${availability.doctor.names}`
            : ''}
        onclose={() => (addModalOpen = false)}
    />
{/key}
