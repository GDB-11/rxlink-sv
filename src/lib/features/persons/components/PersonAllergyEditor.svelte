<!-- src/lib/features/persons/components/PersonAllergyEditor.svelte -->
<!-- Live allergy CRUD for a person in edit mode. Operations fire immediately. -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconSearch, IconX, IconPlus } from '@tabler/icons-svelte';
    import { patientApi, type PatientAllergyResponse } from '$lib/api/patientApi';
    import { allergyApi, type AllergyResponse } from '$lib/api/allergyApi';
    import { lookupsApi, type GuidLookupItemResponse } from '$lib/api/lookupsApi';

    interface Props {
        personCode: string;
        disabled?: boolean;
    }
    let { personCode, disabled = false }: Props = $props();

    let patientCode  = $state('');
    let allergies    = $state<PatientAllergyResponse[]>([]);
    let severities   = $state<GuidLookupItemResponse[]>([]);
    let loading      = $state(true);
    let loadError    = $state<string | null>(null);

    // Add-allergy search state
    let query        = $state('');
    let results      = $state<AllergyResponse[]>([]);
    let searching    = $state(false);
    let dropdownOpen = $state(false);
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Pending (selected but not yet saved)
    let pending      = $state<{ allergyCode: string; allergyName: string; severityCode: string; notes: string } | null>(null);
    let saving       = $state(false);
    let saveError    = $state<string | null>(null);
    let removing     = $state<string | null>(null); // patientAllergyCode being removed

    onMount(async () => {
        try {
            const [patient, lookups] = await Promise.all([
                patientApi.getByPersonCode(personCode),
                lookupsApi.getPatientLookups()
            ]);
            patientCode = patient.patientCode;
            allergies   = patient.allergies;
            severities  = lookups.allergySeverities;
        } catch (err) {
            loadError = err instanceof Error ? err.message : 'Error al cargar alergias.';
        } finally {
            loading = false;
        }
    });

    function handleInput(e: Event) {
        query = (e.currentTarget as HTMLInputElement).value;
        dropdownOpen = false;
        clearTimeout(timer);
        if (!query.trim()) { results = []; return; }
        timer = setTimeout(fetchResults, 350);
    }

    async function fetchResults() {
        searching = true;
        try {
            const page = await allergyApi.getPage(1, 10, query.trim());
            results = page.items.filter(
                a => a.isActive && !allergies.some(ex => ex.allergyCode === a.allergyCode)
            );
            dropdownOpen = results.length > 0;
        } catch {
            results = [];
        } finally {
            searching = false;
        }
    }

    function selectAllergy(allergy: AllergyResponse) {
        pending = {
            allergyCode:  allergy.allergyCode,
            allergyName:  allergy.name,
            severityCode: severities[0]?.code ?? '',
            notes:        ''
        };
        query        = '';
        results      = [];
        dropdownOpen = false;
        saveError    = null;
    }

    async function confirmAdd() {
        if (!pending || !patientCode) return;
        saving    = true;
        saveError = null;
        try {
            const added = await patientApi.addAllergy(patientCode, {
                AllergyCode:  pending.allergyCode,
                SeverityCode: pending.severityCode,
                Notes:        pending.notes.trim() || null
            });
            allergies = [...allergies, added];
            pending   = null;
        } catch (err) {
            saveError = err instanceof Error ? err.message : 'Error al agregar alergia.';
        } finally {
            saving = false;
        }
    }

    async function removeAllergy(patientAllergyCode: string) {
        if (!patientCode) return;
        removing = patientAllergyCode;
        try {
            await patientApi.removeAllergy(patientCode, patientAllergyCode);
            allergies = allergies.filter(a => a.patientAllergyCode !== patientAllergyCode);
        } catch {
            // silent — keep item in list
        } finally {
            removing = null;
        }
    }

    const inputCls = `w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm
        text-stone-900 placeholder:text-stone-400 transition-colors
        focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
        disabled:cursor-not-allowed disabled:opacity-50
        dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50
        dark:placeholder:text-stone-600 dark:focus:border-teal-600`;

    const selectCls = `w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs
        text-stone-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20
        disabled:cursor-not-allowed disabled:opacity-50
        dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300`;
</script>

{#if loading}
    <div class="flex items-center gap-2 py-2 text-xs text-stone-400 dark:text-stone-500">
        <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-300 border-t-teal-500
                     dark:border-stone-600 dark:border-t-teal-400" aria-hidden="true"></span>
        Cargando alergias…
    </div>
{:else if loadError}
    <p class="text-xs text-rose-600 dark:text-rose-400">{loadError}</p>
{:else}
    <div class="space-y-3">

        <!-- Current allergies -->
        {#if allergies.length > 0}
            <ul class="space-y-2">
                {#each allergies as a (a.patientAllergyCode)}
                    <li class="flex items-start justify-between gap-2 rounded-lg border border-stone-200
                               bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-800/50">
                        <div class="min-w-0">
                            <p class="text-sm font-medium text-stone-800 dark:text-stone-100">{a.allergyName}</p>
                            {#if a.severityName}
                                <p class="text-xs text-stone-500 dark:text-stone-400">{a.severityName}</p>
                            {/if}
                            {#if a.notes}
                                <p class="text-xs text-stone-400 dark:text-stone-500">{a.notes}</p>
                            {/if}
                        </div>
                        <button
                            type="button"
                            onclick={() => removeAllergy(a.patientAllergyCode)}
                            disabled={disabled || removing === a.patientAllergyCode}
                            class="cursor-pointer shrink-0 rounded p-0.5 text-stone-400 transition-colors
                                   hover:bg-rose-100 hover:text-rose-600
                                   disabled:cursor-not-allowed disabled:opacity-50
                                   dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                            aria-label="Quitar {a.allergyName}"
                        >
                            {#if removing === a.patientAllergyCode}
                                <span class="block h-3.5 w-3.5 animate-spin rounded-full border-2
                                             border-stone-300 border-t-rose-500" aria-hidden="true"></span>
                            {:else}
                                <IconX size={14} aria-hidden="true" />
                            {/if}
                        </button>
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="text-xs text-stone-400 dark:text-stone-500">Sin alergias registradas.</p>
        {/if}

        <!-- Add-allergy section -->
        {#if !pending}
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
                    disabled={disabled}
                    placeholder="Agregar alergia…"
                    autocomplete="off"
                    class={inputCls}
                />
                {#if dropdownOpen && results.length > 0}
                    <ul
                        role="listbox"
                        class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-stone-200
                               bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800"
                    >
                        {#each results as allergy (allergy.allergyCode)}
                            <li role="option" aria-selected="false">
                                <button
                                    type="button"
                                    onclick={() => selectAllergy(allergy)}
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
        {:else}
            <!-- Pending allergy row -->
            <div class="flex flex-col gap-1.5 rounded-lg border border-teal-200 bg-teal-50
                        px-3 py-2.5 dark:border-teal-800 dark:bg-teal-900/20">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-medium text-stone-800 dark:text-stone-100">
                        {pending.allergyName}
                    </span>
                    <button
                        type="button"
                        onclick={() => (pending = null)}
                        disabled={saving}
                        class="cursor-pointer shrink-0 rounded p-0.5 text-stone-400 transition-colors
                               hover:bg-stone-200 hover:text-stone-600
                               disabled:cursor-not-allowed disabled:opacity-50
                               dark:hover:bg-stone-700 dark:hover:text-stone-300"
                        aria-label="Cancelar"
                    >
                        <IconX size={14} aria-hidden="true" />
                    </button>
                </div>
                <select
                    value={pending.severityCode}
                    onchange={(e) => { if (pending) pending.severityCode = (e.currentTarget as HTMLSelectElement).value; }}
                    disabled={saving}
                    required
                    aria-label="Severidad de {pending.allergyName}"
                    class={selectCls}
                >
                    {#each severities as sev (sev.code)}
                        <option value={sev.code}>{sev.name}</option>
                    {/each}
                </select>
                <input
                    type="text"
                    value={pending.notes}
                    oninput={(e) => { if (pending) pending.notes = (e.currentTarget as HTMLInputElement).value; }}
                    disabled={saving}
                    placeholder="Nota (opcional)"
                    maxlength="500"
                    class="w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs
                           text-stone-700 placeholder:text-stone-400
                           focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300
                           dark:placeholder:text-stone-600"
                />
                {#if saveError}
                    <p class="text-xs text-rose-600 dark:text-rose-400">{saveError}</p>
                {/if}
                <button
                    type="button"
                    onclick={confirmAdd}
                    disabled={saving || !pending.severityCode}
                    class="mt-0.5 inline-flex cursor-pointer items-center gap-1.5 self-start
                           rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium text-white
                           transition-colors hover:bg-teal-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    {#if saving}
                        <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
                        Guardando…
                    {:else}
                        <IconPlus size={12} aria-hidden="true" />
                        Agregar
                    {/if}
                </button>
            </div>
        {/if}

    </div>
{/if}
