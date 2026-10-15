<!-- src/lib/components/ui/TextArea.svelte -->
<script lang="ts">
    interface Props {
        value?: string;
        id?: string;
        rows?: number;
        maxLength?: number;
        disabled?: boolean;
        placeholder?: string;
    }
    let { value = $bindable(''), id, rows = 3, maxLength, disabled = false, placeholder }: Props = $props();
</script>

<textarea
    {id}
    bind:value
    {rows}
    maxlength={maxLength}
    {disabled}
    {placeholder}
    class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
           focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none
           disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
></textarea>
