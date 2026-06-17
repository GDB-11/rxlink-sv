<!-- src/lib/features/admin-appointments/components/AdminAppointmentStatusBadge.svelte -->
<script lang="ts">
    interface Props { statusName: string; }
    let { statusName }: Props = $props();

    function cls(s: string): string {
        switch (s) {
            case 'Confirmado':    return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
            case 'Completado':    return 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
            case 'Cancelado':     return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            case 'NoAsistio':     return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'PendientePago': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:              return 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
        }
    }

    const label: Record<string, string> = {
        Confirmado:    'Confirmado',
        Completado:    'Completado',
        Cancelado:     'Cancelado',
        NoAsistio:     'No asistió',
        PendientePago: 'Pendiente pago'
    };
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {cls(statusName)}">
    {label[statusName] ?? statusName}
</span>
