<!-- src/lib/features/amendments/components/AmendmentStatusBadge.svelte -->
<script lang="ts">
    import type { AmendmentStatus } from '$lib/api/privacyApi';

    interface Props {
        status: AmendmentStatus;
    }
    let { status }: Props = $props();

    const CLASSES: Record<AmendmentStatus, string> = {
        Pendiente: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        Aceptada:  'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
        Denegada:  'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
    };
</script>

<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {CLASSES[status]}">
    {status}
</span>
