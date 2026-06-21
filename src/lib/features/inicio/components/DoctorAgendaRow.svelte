<!-- src/lib/features/inicio/components/DoctorAgendaRow.svelte -->
<script lang="ts">
    import type { AppointmentResponse } from '$lib/api/appointmentApi';
    import AppointmentStatusBadge from '$lib/features/doctor-consultations/components/AppointmentStatusBadge.svelte';

    interface Props {
        appt: AppointmentResponse;
    }
    let { appt }: Props = $props();

    const time = $derived(
        new Date(appt.scheduledAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    );
</script>

<div class="flex items-center gap-4 py-3">
    <div class="flex w-16 shrink-0 flex-col items-center rounded-xl bg-stone-100 py-2 dark:bg-stone-800">
        <span class="text-lg font-semibold text-stone-900 dark:text-stone-50">{time}</span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
            {appt.patientNames} {appt.patientSurnames}
        </span>
        <span class="text-xs text-stone-500 dark:text-stone-400">
            {appt.consultationTypeName}
        </span>
    </div>

    <div class="shrink-0">
        <AppointmentStatusBadge statusName={appt.statusName} />
    </div>

    {#if appt.statusName === 'Confirmado'}
        <a
            href="/consultas/{appt.appointmentCode}"
            class="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium
                   text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
        >
            Iniciar
        </a>
    {/if}
</div>
