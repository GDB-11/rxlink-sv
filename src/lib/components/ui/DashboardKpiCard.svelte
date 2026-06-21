<script lang="ts">
    interface Props {
        label: string;
        value: number | string;
        colorClass?: string;
    }

    let { label, value, colorClass = 'bg-stone-100 dark:bg-stone-800' }: Props = $props();
</script>

<div class="flex flex-col gap-2 rounded-2xl p-6 shadow-sm {colorClass}">
    <span class="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</span>
    <span class="text-4xl font-semibold text-stone-900 dark:text-stone-50">{value}</span>
</div>
