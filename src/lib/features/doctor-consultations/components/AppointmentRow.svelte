<!-- src/lib/features/doctor-consultations/components/AppointmentRow.svelte -->
<script lang="ts">
    import type { AppointmentResponse } from '$lib/api/appointmentApi';
    import AppointmentStatusBadge from './AppointmentStatusBadge.svelte';

    interface Props { item: AppointmentResponse; }
    let { item }: Props = $props();

    const isActionable = $derived(item.statusName === 'Confirmado');

    function fmtDate(s: string): string {
        return new Date(s + 'T00:00:00').toLocaleDateString('es-PE', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }
</script>

<tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
    <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
        {item.patientSurnames}, {item.patientNames}
    </td>
    <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 sm:table-cell">
        {fmtDate(item.date)}
    </td>
    <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 md:table-cell">
        {item.time}
    </td>
    <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 lg:table-cell">
        {item.consultationTypeName}
    </td>
    <td class="px-4 py-3">
        <AppointmentStatusBadge statusName={item.statusName} />
    </td>
    <td class="px-4 py-3 text-right">
        <a
            href="/consultas/{item.appointmentCode}"
            class="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                   {isActionable
                       ? 'bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700'
                       : 'border border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800'}"
        >
            {isActionable ? 'Iniciar consulta' : 'Ver detalle'}
        </a>
    </td>
</tr>
