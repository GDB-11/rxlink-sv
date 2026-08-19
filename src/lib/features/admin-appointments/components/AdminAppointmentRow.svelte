<!-- src/lib/features/admin-appointments/components/AdminAppointmentRow.svelte -->
<script lang="ts">
    import type { AppointmentResponse } from '$lib/api/appointmentApi';
    import AdminAppointmentStatusBadge from './AdminAppointmentStatusBadge.svelte';
    import PaymentToggle from './PaymentToggle.svelte';

    interface Props {
        item:      AppointmentResponse;
        onToggled: () => void;
    }
    let { item, onToggled }: Props = $props();

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
        {item.doctorSurnames}, {item.doctorNames}
    </td>
    <td class="hidden px-4 py-3 text-stone-500 dark:text-stone-500 xl:table-cell">
        {item.specialtyName}
    </td>
    <td class="hidden px-4 py-3 text-stone-500 dark:text-stone-500 xl:table-cell">
        {item.consultationTypeName}
    </td>
    <td class="px-4 py-3">
        <AdminAppointmentStatusBadge statusName={item.statusName} />
        {#if item.patientAmount !== null}
            <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                S/ {item.patientAmount.toFixed(2)} · {item.insuranceName ?? 'Particular'}
            </p>
        {/if}
    </td>
    <td class="px-4 py-3 text-right">
        <PaymentToggle
            appointmentCode={item.appointmentCode}
            statusName={item.statusName}
            {onToggled}
        />
    </td>
</tr>
