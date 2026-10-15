<script lang="ts">
    interface Props {
        label: string;
        value: number | string;
        colorClass?: string;
        /** When set, the whole card is a link. */
        href?: string;
    }

    let { label, value, colorClass = 'bg-stone-100 dark:bg-stone-800', href }: Props = $props();
</script>

{#snippet content()}
    <span class="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</span>
    <span class="text-4xl font-semibold text-stone-900 dark:text-stone-50">{value}</span>
{/snippet}

{#if href}
    <a {href} class="flex flex-col gap-2 rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md {colorClass}">
        {@render content()}
    </a>
{:else}
    <div class="flex flex-col gap-2 rounded-2xl p-6 shadow-sm {colorClass}">
        {@render content()}
    </div>
{/if}
