<!-- src/lib/components/ui/InlineNumberEditor.svelte -->
<script lang="ts">
    import { IconPencil, IconCheck, IconX, IconRestore } from '@tabler/icons-svelte';

    interface Props {
        value: number | null;
        /** Subject used in the accessible names, e.g. "Paracetamol". */
        label: string;
        /** What is being edited, e.g. "nivel de reposición". */
        field: string;
        /** Text shown when not editing; defaults to the raw value or "—". */
        display?: string;
        min?: number;
        max?: number;
        step?: number | 'any';
        disabled?: boolean;
        /** Return true when saved so the editor closes. */
        onsave: (value: number) => Promise<boolean>;
        /** When given, a reset button appears while `value` is set. */
        onclear?: () => Promise<boolean>;
        clearLabel?: string;
    }
    let {
        value,
        label,
        field,
        display,
        min = 0,
        max,
        step = 'any',
        disabled = false,
        onsave,
        onclear,
        clearLabel = 'Restablecer'
    }: Props = $props();

    let editing = $state(false);
    let draft = $state<number | null>(null);

    const valid = $derived(
        typeof draft === 'number' &&
            Number.isFinite(draft) &&
            draft >= min &&
            (max === undefined || draft <= max)
    );

    function start() {
        draft = value;
        editing = true;
    }

    async function save() {
        if (!valid || draft === null) return;
        if (await onsave(draft)) editing = false;
    }

    function onkeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') save();
        else if (e.key === 'Escape') editing = false;
    }

    const iconButton = `cursor-pointer rounded-lg p-1 disabled:cursor-not-allowed disabled:opacity-40`;
</script>

{#if editing}
    <div class="flex items-center gap-1">
        <input
            type="number"
            {min}
            {max}
            {step}
            bind:value={draft}
            {onkeydown}
            {disabled}
            aria-label="{field} de {label}"
            class="w-20 rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm text-stone-900
                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                   dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
        />
        <button
            type="button"
            onclick={save}
            disabled={disabled || !valid}
            class="{iconButton} text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/30"
            aria-label="Guardar {field}"
        >
            <IconCheck size={16} aria-hidden="true" />
        </button>
        <button
            type="button"
            onclick={() => (editing = false)}
            class="{iconButton} text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Cancelar"
        >
            <IconX size={16} aria-hidden="true" />
        </button>
    </div>
{:else}
    <div class="flex items-center gap-1">
        <span class="text-stone-600 dark:text-stone-400">{display ?? value ?? '—'}</span>
        <button
            type="button"
            onclick={start}
            {disabled}
            class="{iconButton} text-stone-400 transition-colors hover:bg-teal-50 hover:text-teal-700
                   dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
            aria-label="Editar {field} de {label}"
        >
            <IconPencil size={14} aria-hidden="true" />
        </button>
        {#if onclear && value !== null}
            <button
                type="button"
                onclick={() => onclear()}
                {disabled}
                class="{iconButton} text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700
                       dark:hover:bg-stone-800 dark:hover:text-stone-200"
                aria-label="{clearLabel} {field} de {label}"
            >
                <IconRestore size={14} aria-hidden="true" />
            </button>
        {/if}
    </div>
{/if}
