<!-- src/lib/features/communication-preferences/components/CommunicationPreferencesSection.svelte -->
<!-- Channel restrictions and alternative contact of one patient (45 CFR 164.522). -->
<script lang="ts">
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { communicationPreferences } from '../stores/communicationPreferences.svelte';
    import CommunicationPreferencesForm from './CommunicationPreferencesForm.svelte';

    interface Props {
        patientCode: string;
    }
    let { patientCode }: Props = $props();

    $effect(() => {
        communicationPreferences.load(patientCode);
    });

    const preference = $derived(communicationPreferences.preference);
</script>

<section class="space-y-4">
    <div>
        <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">Comunicaciones</h2>
        <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Canales que el paciente no quiere usar y contacto alternativo para los avisos (recordatorios y
            vencimiento de recetas). Un contacto alternativo reemplaza al de la ficha.
        </p>
    </div>

    <ErrorAlert message={communicationPreferences.error} />

    {#if preference}
        {#key `${preference.patientCode}-${preference.updatedAt ?? 'default'}`}
            <CommunicationPreferencesForm
                {preference}
                saving={communicationPreferences.saving}
                saveError={communicationPreferences.saveError}
                onsave={(body) => communicationPreferences.save(body)}
            />
        {/key}
    {:else if communicationPreferences.loading}
        <p class="text-sm text-stone-500 dark:text-stone-400">Cargando…</p>
    {/if}
</section>
