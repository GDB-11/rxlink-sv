<!-- src/lib/features/doctor-consultations/components/ConsultationRoomPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconArrowLeft } from '@tabler/icons-svelte';
    import { consultationRoom } from '../stores/consultationRoom.svelte';
    import AppointmentSummaryCard from './AppointmentSummaryCard.svelte';
    import DiagnosticSection from './DiagnosticSection.svelte';
    import PrescriptionSection from './PrescriptionSection.svelte';
    import CompleteConsultationButton from './CompleteConsultationButton.svelte';

    interface Props { appointmentCode: string; }
    let { appointmentCode }: Props = $props();

    onMount(async () => {
        consultationRoom.reset();
        await consultationRoom.load(appointmentCode);
    });

    const isReadOnly = $derived(
        consultationRoom.appointment?.statusName !== 'Confirmado'
    );
    const hasDiagnostic = $derived(consultationRoom.diagnostic !== null);
</script>

<div class="space-y-5">
    <div class="flex items-center gap-3">
        <a
            href="/consultas"
            class="flex items-center gap-1.5 text-sm text-stone-500 transition-colors
                   hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
        >
            <IconArrowLeft size={16} aria-hidden="true" />
            Mis consultas
        </a>
    </div>

    {#if consultationRoom.loading}
        <div class="space-y-5">
            <div class="h-32 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800"></div>
            <div class="h-48 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800"></div>
            <div class="h-32 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800"></div>
        </div>

    {:else if consultationRoom.error && !consultationRoom.appointment}
        <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                    dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
            {consultationRoom.error}
        </div>

    {:else if consultationRoom.appointment}
        {@const appt = consultationRoom.appointment}
        {@const diag = consultationRoom.diagnostic}

        <AppointmentSummaryCard appointment={appt} />

        <DiagnosticSection
            {appointmentCode}
            diagnostic={diag}
            {isReadOnly}
        />

        {#if diag}
            <PrescriptionSection
                diagnostic={diag}
                {isReadOnly}
            />
        {/if}

        <CompleteConsultationButton
            {hasDiagnostic}
            statusName={appt.statusName}
        />
    {/if}
</div>
