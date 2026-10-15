<!-- src/lib/features/inventory/components/LowStockToggle.svelte -->
<script lang="ts">
    import ToggleSwitch from '$lib/components/ui/ToggleSwitch.svelte';

    interface Props {
        checked: boolean;
        disabled?: boolean;
        onchange: (checked: boolean) => void;
    }
    let { checked, disabled = false, onchange }: Props = $props();
</script>

<div class="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
    <ToggleSwitch {checked} {disabled} label="Mostrar solo stock bajo o agotado" {onchange} />
    <span>Solo stock bajo o agotado</span>
</div>
