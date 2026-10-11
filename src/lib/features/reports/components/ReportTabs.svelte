<!-- src/lib/features/reports/components/ReportTabs.svelte -->
<script lang="ts">
    import { reportDefinitions, type ReportKind } from '../reportDefinitions';

    interface Props {
        active:   ReportKind;
        onselect: (kind: ReportKind) => void;
    }
    let { active, onselect }: Props = $props();
</script>

<div role="tablist" aria-label="Reportes" class="flex flex-wrap gap-1 border-b border-stone-200 dark:border-stone-700">
    {#each reportDefinitions as def (def.kind)}
        <button
            type="button"
            role="tab"
            aria-selected={active === def.kind}
            onclick={() => onselect(def.kind)}
            class="-mb-px cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors
                   {active === def.kind
                       ? 'border-teal-500 text-teal-700 dark:border-teal-400 dark:text-teal-300'
                       : 'border-transparent text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50'}"
        >
            {def.label}
        </button>
    {/each}
</div>
