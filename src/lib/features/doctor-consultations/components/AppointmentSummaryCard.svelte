<!-- src/lib/features/doctor-consultations/components/AppointmentSummaryCard.svelte -->
<script lang="ts">
    import type { AppointmentResponse } from '$lib/api/appointmentApi';
    import AppointmentStatusBadge from './AppointmentStatusBadge.svelte';

    interface Props { appointment: AppointmentResponse; }
    let { appointment }: Props = $props();

    function fmtDate(s: string): string {
        return new Date(s + 'T00:00:00').toLocaleDateString('es-PE', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
</script>

<div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
    <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Paciente
            </p>
            <p class="mt-1 text-lg font-semibold text-stone-900 dark:text-stone-50">
                {appointment.patientSurnames}, {appointment.patientNames}
            </p>
        </div>
        <AppointmentStatusBadge statusName={appointment.statusName} />
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
            <p class="text-xs text-stone-500 dark:text-stone-400">Fecha</p>
            <p class="mt-0.5 font-medium capitalize text-stone-800 dark:text-stone-100">
                {fmtDate(appointment.date)}
            </p>
        </div>
        <div>
            <p class="text-xs text-stone-500 dark:text-stone-400">Hora</p>
            <p class="mt-0.5 font-medium text-stone-800 dark:text-stone-100">{appointment.time}</p>
        </div>
        <div>
            <p class="text-xs text-stone-500 dark:text-stone-400">Tipo</p>
            <p class="mt-0.5 font-medium text-stone-800 dark:text-stone-100">{appointment.consultationTypeName}</p>
        </div>
        <div>
            <p class="text-xs text-stone-500 dark:text-stone-400">Especialidad</p>
            <p class="mt-0.5 font-medium text-stone-800 dark:text-stone-100">{appointment.specialtyName}</p>
        </div>
    </div>
</div>
