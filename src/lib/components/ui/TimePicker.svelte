<!-- src/lib/components/ui/TimePicker.svelte -->
<script lang="ts">
    import { IconClock } from '@tabler/icons-svelte';

    interface Props {
        value?:       string;   // bindable "HH:MM"
        step?:        number;   // minutes between options (15, 30, 60, …); default 30
        startHour?:   number;   // first hour shown; default 0
        endHour?:     number;   // last hour shown; default 23
        minTime?:     string;   // "HH:MM" inclusive lower bound
        maxTime?:     string;   // "HH:MM" inclusive upper bound
        disabled?:    boolean;
        placeholder?: string;
        id?:          string;
        class?:       string;
    }

    let {
        value       = $bindable(''),
        step        = 30,
        startHour   = 0,
        endHour     = 23,
        minTime,
        maxTime,
        disabled    = false,
        placeholder = 'Seleccionar hora',
        id,
        class: className = ''
    }: Props = $props();

    let open       = $state(false);
    let popupStyle = $state('');

    // Unique marker so the outside-click handler can identify this component's trigger
    const instanceId = Math.random().toString(36).slice(2, 8);

    const options = $derived.by(() => {
        const result: string[] = [];
        const s = Math.max(1, Math.round(step));
        for (let h = startHour; h <= endHour; h++) {
            for (let m = 0; m < 60; m += s) {
                const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                if (minTime && t < minTime) continue;
                if (maxTime && t > maxTime) continue;
                result.push(t);
            }
        }
        return result;
    });

    function handleTriggerClick(e: MouseEvent) {
        if (disabled) return;
        if (open) { open = false; return; }

        const btn       = e.currentTarget as HTMLButtonElement;
        const rect      = btn.getBoundingClientRect();
        const popupW    = 160;
        const popupH    = 240;
        const left      = Math.max(8, Math.min(rect.left, window.innerWidth - popupW - 8));
        const fitsBelow = window.innerHeight - rect.bottom >= popupH;
        const top       = fitsBelow ? rect.bottom + 4 : rect.top - popupH - 4;
        popupStyle = `top:${top}px;left:${left}px;`;
        open = true;
    }

    function select(t: string) {
        value = t;
        open  = false;
    }

    function handleOutsideMousedown(e: MouseEvent) {
        if (!open) return;
        const target = e.target as Element;
        if (target.closest?.(`[data-tp="${instanceId}"]`)) return;
        if (target.closest?.('[role="listbox"]')) return;
        open = false;
    }

    function handleEscape(e: KeyboardEvent) {
        if (!open) return;
        if (e.key === 'Escape') { e.stopPropagation(); open = false; }
    }
</script>

<svelte:document onmousedown={handleOutsideMousedown} />
<svelte:window onkeydown={handleEscape} />

<button
    type="button"
    data-tp={instanceId}
    {id}
    onclick={handleTriggerClick}
    {disabled}
    aria-haspopup="listbox"
    aria-expanded={open}
    class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border
           px-3 py-2 text-left text-sm transition-colors
           focus:outline-none focus:ring-2 focus:ring-teal-500/20
           disabled:cursor-not-allowed disabled:opacity-50
           {className || 'border-stone-200 bg-white focus:border-teal-500 dark:border-stone-700 dark:bg-stone-900'}"
>
    <span class={value ? 'text-stone-900 dark:text-stone-50' : 'text-stone-400 dark:text-stone-600'}>
        {value || placeholder}
    </span>
    <IconClock size={16} class="shrink-0 text-stone-400" aria-hidden="true" />
</button>

{#if open}
    <div
        {@attach (node) => {
            requestAnimationFrame(() => {
                const sel = node.querySelector('[aria-selected="true"]') as HTMLElement | null;
                sel?.scrollIntoView({ block: 'center' });
            });
        }}
        role="listbox"
        aria-label="Seleccionar hora"
        style={popupStyle}
        style:max-height="240px"
        class="fixed z-[100] w-40 overflow-y-auto rounded-xl border border-stone-200 bg-white
               py-1 shadow-2xl dark:border-stone-700 dark:bg-stone-800"
    >
        {#if options.length === 0}
            <p class="px-4 py-3 text-xs text-stone-400 dark:text-stone-500">Sin opciones disponibles.</p>
        {:else}
            {#each options as t (t)}
                {@const selected = t === value}
                <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onclick={() => select(t)}
                    class="flex w-full cursor-pointer items-center px-4 py-2 text-sm transition-colors
                           {selected
                               ? 'bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                               : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700'}"
                >
                    {t}
                </button>
            {/each}
        {/if}
    </div>
{/if}
