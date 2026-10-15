<!-- src/lib/components/ui/ToggleSwitch.svelte -->
<script lang="ts">
    interface Props {
        checked: boolean;
        label: string;
        disabled?: boolean;
        onchange: (checked: boolean) => void;
    }
    let { checked, label, disabled = false, onchange }: Props = $props();
</script>

<button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {disabled}
    onclick={() => onchange(!checked)}
    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors
           focus:outline-none focus:ring-2 focus:ring-teal-500/40
           disabled:cursor-not-allowed disabled:opacity-50
           {checked ? 'bg-teal-500 dark:bg-teal-600' : 'bg-stone-300 dark:bg-stone-600'}"
>
    <span
        class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform
               {checked ? 'translate-x-4.5' : 'translate-x-0.5'}"
    ></span>
</button>
