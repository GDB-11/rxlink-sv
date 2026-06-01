<!-- src/lib/features/patients/components/PatientStatusBadge.svelte -->
<script lang="ts">
    interface Props { isActive: boolean; }
    let { isActive }: Props = $props();
</script>

{#if isActive}
    <span class="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium
                 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
        Activo
    </span>
{:else}
    <span class="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium
                 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        Inactivo
    </span>
{/if}
