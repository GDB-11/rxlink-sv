<!-- src/lib/components/ui/PersonPicker.svelte -->
<!-- As-you-type person search with dropdown and selection card. Create-mode only. -->
<script lang="ts">
    import { IconSearch, IconX, IconUser, IconAlertCircle } from '@tabler/icons-svelte';
    import { personApi, type PersonResponse } from '$lib/api/personApi';

    interface Props {
        onselect: (person: PersonResponse | null) => void;
        disabled?: boolean;
        error?: boolean;
        excludeLinkedUsers?: boolean;
        excludeLinkedPatients?: boolean;
    }
    let { onselect, disabled = false, error = false, excludeLinkedUsers = false, excludeLinkedPatients = false }: Props = $props();

    let query        = $state('');
    let results      = $state<PersonResponse[]>([]);
    let selected     = $state<PersonResponse | null>(null);
    let searching    = $state(false);
    let open         = $state(false);
    let noResults    = $state(false);
    let timer: ReturnType<typeof setTimeout> | undefined;

    function handleInput(e: Event) {
        query = (e.currentTarget as HTMLInputElement).value;
        noResults = false;
        open = false;
        clearTimeout(timer);
        if (!query.trim()) {
            results = [];
            return;
        }
        timer = setTimeout(search, 350);
    }

    async function search() {
        searching = true;
        try {
            const page = await personApi.getAvailable(1, 8, query.trim(), { excludeLinkedUsers, excludeLinkedPatients });
            results = page.items;
            noResults = results.length === 0;
            open = results.length > 0;
        } catch {
            results = [];
            noResults = true;
        } finally {
            searching = false;
        }
    }

    function pick(person: PersonResponse) {
        selected = person;
        open = false;
        query = '';
        results = [];
        noResults = false;
        onselect(person);
    }

    function clear() {
        selected = null;
        query = '';
        results = [];
        noResults = false;
        open = false;
        onselect(null);
    }

    function formatDoc(p: PersonResponse): string {
        if (!p.documentTypeName || !p.documentNumber) return 'Sin documento registrado';
        return `${p.documentTypeName} ${p.documentNumber}`;
    }

    const inputBase = `w-full rounded-lg border py-2 pl-9 pr-9 text-sm
        text-stone-900 placeholder:text-stone-400 transition-colors
        focus:outline-none focus:ring-2
        disabled:cursor-not-allowed disabled:opacity-50
        dark:text-stone-50 dark:placeholder:text-stone-600`;

    const inputNormal = `border-stone-200 bg-white focus:border-teal-500 focus:ring-teal-500/20
        dark:border-stone-700 dark:bg-stone-900 dark:focus:border-teal-600`;

    const inputError = `border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/20
        dark:border-rose-500 dark:bg-rose-950/30`;
</script>

{#if selected}
    <!-- Selected person summary card -->
    <div class="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50/60 px-4 py-3
                dark:border-teal-800 dark:bg-teal-900/20">
        <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                    bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400">
            <IconUser size={16} aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                {selected.surnames}, {selected.names}
            </p>
            <p class="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                {formatDoc(selected)}
            </p>
        </div>
        {#if !disabled}
            <button
                type="button"
                onclick={clear}
                class="cursor-pointer shrink-0 rounded p-1 text-stone-400 transition-colors
                       hover:bg-teal-100 hover:text-stone-600
                       dark:hover:bg-teal-800 dark:hover:text-stone-300"
                aria-label="Cambiar persona seleccionada"
            >
                <IconX size={14} aria-hidden="true" />
            </button>
        {/if}
    </div>
{:else}
    <!-- Search input + dropdown -->
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
            placeholder="Buscar por nombre o número de documento…"
            autocomplete="off"
            class="{inputBase} {error ? inputError : inputNormal}"
            aria-label="Buscar persona"
        />

        {#if query}
            <button
                type="button"
                onclick={clear}
                {disabled}
                class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3
                       text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                aria-label="Limpiar búsqueda"
            >
                <IconX size={16} aria-hidden="true" />
            </button>
        {/if}

        {#if open && results.length > 0}
            <ul
                role="listbox"
                class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-stone-200
                       bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800"
            >
                {#each results as person (person.personCode)}
                    <li role="option" aria-selected="false">
                        <button
                            type="button"
                            onclick={() => pick(person)}
                            class="w-full cursor-pointer px-4 py-2.5 text-left transition-colors
                                   hover:bg-teal-50 dark:hover:bg-teal-900/30"
                        >
                            <p class="text-sm font-medium text-stone-900 dark:text-stone-50">
                                {person.surnames}, {person.names}
                            </p>
                            <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                                {formatDoc(person)}
                            </p>
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}

        {#if noResults}
            <div class="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50
                        px-3 py-2.5 dark:border-amber-800 dark:bg-amber-900/20">
                <IconAlertCircle size={15} class="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <p class="text-xs text-amber-700 dark:text-amber-300">
                    No se encontró ninguna persona con ese criterio.
                    Regístrela primero en <strong>Personas</strong>.
                </p>
            </div>
        {/if}
    </div>
{/if}
