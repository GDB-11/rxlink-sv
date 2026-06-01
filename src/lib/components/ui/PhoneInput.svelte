<!-- src/lib/components/ui/PhoneInput.svelte -->
<script lang="ts">
    import { untrack } from 'svelte';
    import { IconChevronDown, IconSearch } from '@tabler/icons-svelte';

    interface Country {
        name: string;
        dial: string;
        flag: string;
    }

    interface Props {
        value?: string;
        format?: string;
        disabled?: boolean;
        placeholder?: string;
        id?: string;
        class?: string;
    }

    let {
        value       = $bindable(''),
        format      = '### ### ####',
        disabled    = false,
        placeholder = 'Número de teléfono',
        id,
        class: className = ''
    }: Props = $props();

    const COUNTRIES: Country[] = [
        { name: 'Colombia',        dial: '+57',  flag: '🇨🇴' },
        { name: 'Venezuela',       dial: '+58',  flag: '🇻🇪' },
        { name: 'Ecuador',         dial: '+593', flag: '🇪🇨' },
        { name: 'Perú',            dial: '+51',  flag: '🇵🇪' },
        { name: 'Chile',           dial: '+56',  flag: '🇨🇱' },
        { name: 'Argentina',       dial: '+54',  flag: '🇦🇷' },
        { name: 'Bolivia',         dial: '+591', flag: '🇧🇴' },
        { name: 'Brasil',          dial: '+55',  flag: '🇧🇷' },
        { name: 'Uruguay',         dial: '+598', flag: '🇺🇾' },
        { name: 'Paraguay',        dial: '+595', flag: '🇵🇾' },
        { name: 'México',          dial: '+52',  flag: '🇲🇽' },
        { name: 'Costa Rica',      dial: '+506', flag: '🇨🇷' },
        { name: 'Guatemala',       dial: '+502', flag: '🇬🇹' },
        { name: 'Honduras',        dial: '+504', flag: '🇭🇳' },
        { name: 'El Salvador',     dial: '+503', flag: '🇸🇻' },
        { name: 'Nicaragua',       dial: '+505', flag: '🇳🇮' },
        { name: 'Panamá',          dial: '+507', flag: '🇵🇦' },
        { name: 'Cuba',            dial: '+53',  flag: '🇨🇺' },
        { name: 'Rep. Dominicana', dial: '+1809',flag: '🇩🇴' },
        { name: 'España',          dial: '+34',  flag: '🇪🇸' },
        { name: 'EE. UU.',         dial: '+1',   flag: '🇺🇸' },
        { name: 'Canadá',          dial: '+1',   flag: '🇨🇦' },
        { name: 'Reino Unido',     dial: '+44',  flag: '🇬🇧' },
        { name: 'Alemania',        dial: '+49',  flag: '🇩🇪' },
        { name: 'Francia',         dial: '+33',  flag: '🇫🇷' },
        { name: 'Italia',          dial: '+39',  flag: '🇮🇹' },
        { name: 'Portugal',        dial: '+351', flag: '🇵🇹' },
        { name: 'Países Bajos',    dial: '+31',  flag: '🇳🇱' },
        { name: 'Bélgica',         dial: '+32',  flag: '🇧🇪' },
        { name: 'Suiza',           dial: '+41',  flag: '🇨🇭' },
        { name: 'Austria',         dial: '+43',  flag: '🇦🇹' },
        { name: 'Suecia',          dial: '+46',  flag: '🇸🇪' },
        { name: 'Noruega',         dial: '+47',  flag: '🇳🇴' },
        { name: 'Dinamarca',       dial: '+45',  flag: '🇩🇰' },
        { name: 'Finlandia',       dial: '+358', flag: '🇫🇮' },
        { name: 'Polonia',         dial: '+48',  flag: '🇵🇱' },
        { name: 'China',           dial: '+86',  flag: '🇨🇳' },
        { name: 'Japón',           dial: '+81',  flag: '🇯🇵' },
        { name: 'Corea del Sur',   dial: '+82',  flag: '🇰🇷' },
        { name: 'India',           dial: '+91',  flag: '🇮🇳' },
        { name: 'Australia',       dial: '+61',  flag: '🇦🇺' },
        { name: 'Nueva Zelanda',   dial: '+64',  flag: '🇳🇿' },
        { name: 'Rusia',           dial: '+7',   flag: '🇷🇺' },
    ];

    function applyFormat(digits: string, mask: string): string {
        let result = '';
        let di = 0;
        for (const ch of mask) {
            if (di >= digits.length) break;
            if (ch === '#') result += digits[di++];
            else result += ch;
        }
        return result;
    }

    function countMaskDigits(mask: string): number {
        let n = 0;
        for (const ch of mask) if (ch === '#') n++;
        return n;
    }

    function parseInitial(v: string, mask: string): { country: Country; local: string } {
        const def = COUNTRIES.find(c => c.dial === '+51') ?? COUNTRIES[0];
        if (!v) return { country: def, local: '' };
        const maxDig = countMaskDigits(mask);
        const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
        for (const c of sorted) {
            if (v.startsWith(c.dial + ' ')) {
                return { country: c, local: v.slice(c.dial.length + 1).replace(/\D/g, '').slice(0, maxDig) };
            }
        }
        return { country: def, local: v.replace(/\D/g, '').slice(0, countMaskDigits(mask)) };
    }

    const init           = parseInitial(untrack(() => value), untrack(() => format));
    let selectedCountry  = $state<Country>(init.country);
    let localRaw         = $state(init.local);

    const maxDigits = $derived(countMaskDigits(format));
    const formatted = $derived(applyFormat(localRaw, format));

    let open       = $state(false);
    let search     = $state('');
    let triggerEl  = $state<HTMLButtonElement | undefined>();
    let popupEl    = $state<HTMLDivElement    | undefined>();
    let searchEl   = $state<HTMLInputElement  | undefined>();
    let popupStyle = $state('');

    const filtered = $derived(
        search.trim()
            ? COUNTRIES.filter(c =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.dial.includes(search)
              )
            : COUNTRIES
    );

    function handleLocalInput(e: Event) {
        const el     = e.target as HTMLInputElement;
        const digits = el.value.replace(/\D/g, '').slice(0, maxDigits);
        localRaw     = digits;
        value        = digits ? `${selectedCountry.dial} ${formatted}` : '';
    }

    function selectCountry(c: Country) {
        selectedCountry = c;
        open            = false;
        if (localRaw) value = `${c.dial} ${formatted}`;
    }

    function openDropdown() {
        if (disabled) return;
        if (open) { open = false; return; }
        if (triggerEl) {
            const rect     = triggerEl.getBoundingClientRect();
            const popupW   = 256;
            const popupH   = 320;
            const left     = Math.max(8, Math.min(rect.left, window.innerWidth - popupW - 8));
            const fitsBelow = window.innerHeight - rect.bottom >= popupH;
            const top      = fitsBelow ? rect.bottom + 4 : rect.top - popupH - 4;
            popupStyle = `top:${top}px;left:${left}px;width:${popupW}px;`;
        }
        search = '';
        open   = true;
    }

    // Focus search input after popup renders
    $effect(() => {
        if (open && searchEl) searchEl.focus();
    });

    // Close on outside click while open
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

    // Close on Escape while open
    $effect(() => {
        if (!open) return;
        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.stopPropagation(); open = false; }
        };
        window.addEventListener('keydown', onKeydown);
        return () => window.removeEventListener('keydown', onKeydown);
    });
</script>

<!-- Trigger: country selector + phone input merged into one bordered row -->
<div
    class="flex w-full overflow-hidden rounded-lg border text-sm transition-colors
           focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20
           dark:focus-within:border-teal-600
           {className || 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900'}"
>
    <!-- Country dial-code picker -->
    <button
        type="button"
        bind:this={triggerEl}
        onclick={openDropdown}
        {disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Seleccionar código de país"
        class="flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-stone-200 px-3 py-2
               transition-colors hover:bg-black/5
               disabled:cursor-not-allowed disabled:opacity-50
               dark:border-stone-700 dark:hover:bg-white/5"
    >
        <span class="text-base leading-none" aria-hidden="true">{selectedCountry.flag}</span>
        <span class="text-xs font-medium text-stone-700 dark:text-stone-300">{selectedCountry.dial}</span>
        <IconChevronDown
            size={12}
            class="text-stone-400 transition-transform duration-200 {open ? 'rotate-180' : ''}"
            aria-hidden="true"
        />
    </button>

    <!-- Local number input -->
    <input
        {id}
        type="tel"
        value={formatted}
        oninput={handleLocalInput}
        {disabled}
        {placeholder}
        autocomplete="tel"
        inputmode="numeric"
        class="min-w-0 flex-1 bg-transparent px-3 py-2
               text-stone-900 placeholder:text-stone-400
               focus:outline-none
               disabled:cursor-not-allowed disabled:opacity-50
               dark:text-stone-50 dark:placeholder:text-stone-600"
    />
</div>

<!-- Country dropdown (fixed to escape overflow clipping) -->
{#if open}
    <div
        bind:this={popupEl}
        role="listbox"
        aria-label="Países"
        style={popupStyle}
        class="fixed z-[100] overflow-hidden rounded-xl border border-stone-200
               bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-800"
    >
        <!-- Search -->
        <div class="border-b border-stone-100 p-2 dark:border-stone-700">
            <div class="flex items-center gap-2 rounded-lg bg-stone-50 px-2.5 py-1.5 dark:bg-stone-700">
                <IconSearch size={14} class="shrink-0 text-stone-400" aria-hidden="true" />
                <input
                    bind:this={searchEl}
                    bind:value={search}
                    type="text"
                    placeholder="Buscar país…"
                    class="min-w-0 flex-1 bg-transparent text-sm text-stone-900
                           placeholder:text-stone-400 focus:outline-none
                           dark:text-stone-50 dark:placeholder:text-stone-500"
                />
            </div>
        </div>

        <!-- Country list -->
        <ul class="max-h-64 overflow-y-auto py-1">
            {#each filtered as country (country.name + country.dial)}
                {@const isSelected = selectedCountry.name === country.name && selectedCountry.dial === country.dial}
                <li role="option" aria-selected={isSelected}>
                    <button
                        type="button"
                        onclick={() => selectCountry(country)}
                        class="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm
                               transition-colors
                               {isSelected
                                 ? 'bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                                 : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-700'}"
                    >
                        <span class="text-base leading-none" aria-hidden="true">{country.flag}</span>
                        <span class="flex-1 text-left">{country.name}</span>
                        <span class="text-xs text-stone-400 dark:text-stone-500">{country.dial}</span>
                    </button>
                </li>
            {/each}
            {#if filtered.length === 0}
                <li class="px-3 py-4 text-center text-sm text-stone-400">Sin resultados</li>
            {/if}
        </ul>
    </div>
{/if}
