<!-- src/lib/components/ui/SearchSelect.svelte -->
<script lang="ts">
    import { IconChevronDown, IconSearch, IconCheck } from '@tabler/icons-svelte';

    interface Option {
        value: string;
        label: string;
    }

    interface Props {
        value?: string;
        options?: Option[];
        placeholder?: string;
        searchPlaceholder?: string;
        disabled?: boolean;
        id?: string;
        class?: string;
        onchange?: (value: string) => void;
    }

    let {
        value             = $bindable(''),
        options           = [],
        placeholder       = '— Seleccionar —',
        searchPlaceholder = 'Buscar…',
        disabled          = false,
        id,
        class: className  = '',
        onchange
    }: Props = $props();

    let open       = $state(false);
    let search     = $state('');
    let triggerEl  = $state<HTMLButtonElement | undefined>();
    let popupEl    = $state<HTMLDivElement    | undefined>();
    let searchEl   = $state<HTMLInputElement  | undefined>();
    let popupStyle = $state('');

    const selectedLabel = $derived(options.find(o => o.value === value)?.label ?? '');

    const filtered = $derived(
        search.trim()
            ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
            : options
    );

    function openDropdown() {
        if (disabled) return;
        if (open) { open = false; return; }

        if (triggerEl) {
            const rect      = triggerEl.getBoundingClientRect();
            const popupW    = Math.max(rect.width, 200);
            const popupH    = 320;
            const left      = Math.max(8, Math.min(rect.left, window.innerWidth - popupW - 8));
            const fitsBelow = window.innerHeight - rect.bottom >= popupH;
            const top       = fitsBelow ? rect.bottom + 4 : rect.top - popupH - 4;
            popupStyle = `top:${top}px;left:${left}px;width:${popupW}px;`;
        }

        search = '';
        open   = true;
    }

    function selectOption(opt: Option) {
        value = opt.value;
        open  = false;
        onchange?.(opt.value);
    }

    $effect(() => {
        if (open && searchEl) searchEl.focus();
    });

    $effect(() => {
        if (!open) return;
        const onMousedown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (triggerEl?.contains(t) || popupEl?.contains(t)) return;
            open = false;
        };
        document.addEventListener('mousedown', onMousedown);
        return () => document.removeEventListener('mousedown', onMousedown);
    });

    $effect(() => {
        if (!open) return;
        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.stopPropagation(); open = false; }
        };
        window.addEventListener('keydown', onKeydown);
        return () => window.removeEventListener('keydown', onKeydown);
    });
</script>

<!-- Trigger -->
<button
    type="button"
    bind:this={triggerEl}
    {id}
    onclick={openDropdown}
    {disabled}
    aria-haspopup="listbox"
    aria-expanded={open}
    class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border
           px-3 py-2 text-left text-sm transition-colors
           focus:outline-none focus:ring-2 focus:ring-teal-500/20
           disabled:cursor-not-allowed disabled:opacity-50
           {className || 'border-stone-200 bg-white focus:border-teal-500 dark:border-stone-700 dark:bg-stone-900'}"
>
    <span class={selectedLabel ? 'text-stone-900 dark:text-stone-50' : 'text-stone-400 dark:text-stone-600'}>
        {selectedLabel || placeholder}
    </span>
    <IconChevronDown
        size={14}
        class="shrink-0 text-stone-400 transition-transform duration-200 {open ? 'rotate-180' : ''}"
        aria-hidden="true"
    />
</button>

<!-- Popup (fixed so it escapes overflow clipping) -->
{#if open}
    <div
        bind:this={popupEl}
        role="listbox"
        aria-label="Opciones"
        style={popupStyle}
        class="fixed z-100 overflow-hidden rounded-xl border border-stone-200
               bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-800"
    >
        <!-- Search bar -->
        <div class="border-b border-stone-100 p-2 dark:border-stone-700">
            <div class="flex items-center gap-2 rounded-lg bg-stone-50 px-2.5 py-1.5 dark:bg-stone-700">
                <IconSearch size={14} class="shrink-0 text-stone-400" aria-hidden="true" />
                <input
                    bind:this={searchEl}
                    bind:value={search}
                    type="text"
                    placeholder={searchPlaceholder}
                    class="min-w-0 flex-1 bg-transparent text-sm text-stone-900
                           placeholder:text-stone-400 focus:outline-none
                           dark:text-stone-50 dark:placeholder:text-stone-500"
                />
            </div>
        </div>

        <!-- Options list -->
        <ul class="max-h-60 overflow-y-auto py-1">
            {#each filtered as opt (opt.value)}
                {@const isSelected = opt.value === value}
                <li role="option" aria-selected={isSelected}>
                    <button
                        type="button"
                        onclick={() => selectOption(opt)}
                        class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm
                               transition-colors
                               {isSelected
                                 ? 'bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                                 : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-700'}"
                    >
                        <span class="flex-1 text-left">{opt.label}</span>
                        {#if isSelected}
                            <IconCheck size={14} class="shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                        {/if}
                    </button>
                </li>
            {/each}
            {#if filtered.length === 0}
                <li class="px-3 py-4 text-center text-sm text-stone-400">Sin resultados</li>
            {/if}
        </ul>
    </div>
{/if}
