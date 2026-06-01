<!-- src/lib/features/patients/components/AllergySelector.svelte -->
<!-- As-you-type allergy search with multi-select pills and optional notes. -->
<script lang="ts">
    import { IconSearch, IconX } from '@tabler/icons-svelte';
    import { allergyApi, type AllergyResponse } from '$lib/api/allergyApi';
    import type { CreatePatientAllergyItem } from '$lib/api/patientApi';

    interface SelectedAllergy {
        allergyCode: string;
        allergyName: string;
        notes: string;
    }

    interface Props {
        onchange: (allergies: CreatePatientAllergyItem[]) => void;
        disabled?: boolean;
    }
    let { onchange, disabled = false }: Props = $props();

    let query     = $state('');
    let results   = $state<AllergyResponse[]>([]);
    let selected  = $state<SelectedAllergy[]>([]);
    let searching = $state(false);
    let open      = $state(false);
    let timer: ReturnType<typeof setTimeout> | undefined;

    function handleInput(e: Event) {
        query = (e.currentTarget as HTMLInputElement).value;
        open = false;
        clearTimeout(timer);
        if (!query.trim()) { results = []; return; }
        timer = setTimeout(fetchResults, 350);
    }

    async function fetchResults() {
        searching = true;
        try {
            const page = await allergyApi.getPage(1, 10, query.trim());
            results = page.items.filter(
                a => a.isActive && !selected.some(s => s.allergyCode === a.allergyCode)
            );
            open = results.length > 0;
        } catch {
            results = [];
        } finally {
            searching = false;
        }
    }

    function add(allergy: AllergyResponse) {
        selected = [...selected, { allergyCode: allergy.allergyCode, allergyName: allergy.name, notes: '' }];
        query = '';
        results = [];
        open = false;
        notify();
    }

    function remove(code: string) {
        selected = selected.filter(s => s.allergyCode !== code);
        notify();
    }

    function updateNote(code: string, note: string) {
        selected = selected.map(s => s.allergyCode === code ? { ...s, notes: note } : s);
        notify();
    }

    function notify() {
        onchange(selected.map(s => ({
            AllergyCode: s.allergyCode,
            Notes: s.notes.trim() || null
        })));
    }

    const inputCls = `w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm
        text-stone-900 placeholder:text-stone-400 transition-colors
        focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
        disabled:cursor-not-allowed disabled:opacity-50
        dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50
        dark:placeholder:text-stone-600 dark:focus:border-teal-600`;
</script>

<div class="space-y-3">
    <!-- Search input -->
    <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {#if searching}
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-teal-500
                             dark:border-stone-600 dark:border-t-teal-400" aria-hidden="true"></span>
            {:else}
                <IconSearch size={16} class="text-stone-400" aria-hidden="true" />
            {/if}
        </div>
        <input
            type="search"
            value={query}
            oninput={handleInput}
            {disabled}
            placeholder="Buscar alergia…"
            autocomplete="off"
            class={inputCls}
        />

        {#if open && results.length > 0}
            <ul
                role="listbox"
                class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-stone-200
                       bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800"
            >
                {#each results as allergy (allergy.allergyCode)}
                    <li role="option" aria-selected="false">
                        <button
                            type="button"
                            onclick={() => add(allergy)}
                            class="w-full cursor-pointer px-4 py-2 text-left text-sm transition-colors
                                   text-stone-900 hover:bg-teal-50
                                   dark:text-stone-50 dark:hover:bg-teal-900/30"
                        >
                            {allergy.name}
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>

    <!-- Selected allergies -->
    {#if selected.length > 0}
        <ul class="space-y-2">
            {#each selected as item (item.allergyCode)}
                <li class="flex flex-col gap-1.5 rounded-lg border border-stone-200 bg-stone-50
                           px-3 py-2.5 dark:border-stone-700 dark:bg-stone-800/50">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-medium text-stone-800 dark:text-stone-100">
                            {item.allergyName}
                        </span>
                        <button
                            type="button"
                            onclick={() => remove(item.allergyCode)}
                            {disabled}
                            class="cursor-pointer shrink-0 rounded p-0.5 text-stone-400 transition-colors
                                   hover:bg-stone-200 hover:text-stone-600
                                   dark:hover:bg-stone-700 dark:hover:text-stone-300"
                            aria-label="Quitar {item.allergyName}"
                        >
                            <IconX size={14} aria-hidden="true" />
                        </button>
                    </div>
                    <input
                        type="text"
                        value={item.notes}
                        oninput={(e) => updateNote(item.allergyCode, (e.currentTarget as HTMLInputElement).value)}
                        {disabled}
                        placeholder="Nota (opcional)"
                        maxlength="500"
                        class="w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs
                               text-stone-700 placeholder:text-stone-400
                               focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20
                               disabled:cursor-not-allowed disabled:opacity-50
                               dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300
                               dark:placeholder:text-stone-600"
                    />
                </li>
            {/each}
        </ul>
    {:else}
        <p class="text-xs text-stone-400 dark:text-stone-500">
            Sin alergias registradas.
        </p>
    {/if}
</div>
