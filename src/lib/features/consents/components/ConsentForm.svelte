<!-- src/lib/features/consents/components/ConsentForm.svelte -->
<!-- Mounted fresh each time it opens via {#if} in the section, so the fields start empty. -->
<script lang="ts">
    import type { CreateConsentBody } from '$lib/api/privacyApi';
    import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
    import TextArea from '$lib/components/ui/TextArea.svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';
    import TimePicker from '$lib/components/ui/TimePicker.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { todayIso } from '$lib/utils/date';
    import { CONSENT_TYPE_LABELS } from '../labels';

    interface Props {
        submitting: boolean;
        submitError: string | null;
        onsubmit: (body: CreateConsentBody) => void;
        onclose: () => void;
    }
    let { submitting, submitError, onsubmit, onclose }: Props = $props();

    let date        = $state(todayIso());
    let time        = $state('');
    let type        = $state('');
    let description = $state('');
    let validation  = $state<string | null>(null);

    const selectClass = `w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
        focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none
        disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50`;

    function handleSubmit(e: SubmitEvent): void {
        e.preventDefault();
        if (submitting) return;

        if (!date || !time) {
            validation = 'Indique la fecha y la hora en que el paciente dio su consentimiento.';
            return;
        }
        const grantedAt = new Date(`${date}T${time}:00`);
        if (grantedAt.getTime() > Date.now()) {
            validation = 'La fecha del consentimiento no puede ser futura.';
            return;
        }
        if (!type || !description.trim()) {
            validation = 'Complete el tipo y la descripción.';
            return;
        }

        validation = null;
        onsubmit({ ConsentType: type, Description: description.trim(), GrantedAt: grantedAt.toISOString() });
    }
</script>

<ModalDialog open={true} title="Registrar consentimiento" widthClass="max-w-lg" {onclose}>
    <form id="consent-form" onsubmit={handleSubmit} class="space-y-4" novalidate>
        <p class="text-xs text-stone-500 dark:text-stone-400">
            Para usos de la información fuera de atención, pago y operaciones. El registro no se edita: solo se puede
            revocar. Describa el alcance (para qué y con quién), no copie contenido clínico.
        </p>

        <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
                <label for="consent-date" class="block text-sm font-medium text-stone-700 dark:text-stone-300">Fecha</label>
                <DatePicker id="consent-date" bind:value={date} maxDate={todayIso()} disabled={submitting} />
            </div>
            <div class="space-y-1.5">
                <label for="consent-time" class="block text-sm font-medium text-stone-700 dark:text-stone-300">Hora</label>
                <TimePicker id="consent-time" bind:value={time} step={15} disabled={submitting} />
            </div>
        </div>

        <div class="space-y-1.5">
            <label for="consent-type" class="block text-sm font-medium text-stone-700 dark:text-stone-300">Tipo</label>
            <select id="consent-type" bind:value={type} disabled={submitting} class={selectClass}>
                <option value="">Seleccionar…</option>
                {#each Object.entries(CONSENT_TYPE_LABELS) as [value, label] (value)}
                    <option {value}>{label}</option>
                {/each}
            </select>
        </div>

        <div class="space-y-1.5">
            <label for="consent-description" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Alcance
            </label>
            <TextArea id="consent-description" bind:value={description} rows={3} maxLength={500} disabled={submitting} />
        </div>

        <ErrorAlert message={validation ?? submitError} />
    </form>

    {#snippet footer()}
        <button
            type="button"
            onclick={onclose}
            disabled={submitting}
            class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700
                   hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-700"
        >
            Cancelar
        </button>
        <button
            type="submit"
            form="consent-form"
            disabled={submitting}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white
                   hover:bg-teal-600 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            {submitting ? 'Guardando…' : 'Registrar'}
        </button>
    {/snippet}
</ModalDialog>
