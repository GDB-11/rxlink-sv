<!-- src/lib/components/ui/TabBar.svelte -->
<script lang="ts" generics="T extends string">
    interface Props {
        tabs: { id: T; label: string }[];
        active: T;
        label: string;
        onselect: (id: T) => void;
    }
    let { tabs, active, label, onselect }: Props = $props();
</script>

<div role="tablist" aria-label={label} class="flex flex-wrap gap-1 border-b border-stone-200 dark:border-stone-700">
    {#each tabs as tab (tab.id)}
        <button
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onclick={() => onselect(tab.id)}
            class="-mb-px cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors
                   {active === tab.id
                       ? 'border-teal-500 text-teal-700 dark:border-teal-400 dark:text-teal-300'
                       : 'border-transparent text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50'}"
        >
            {tab.label}
        </button>
    {/each}
</div>
