<!-- src/lib/features/disclosures/components/DisclosureForm.svelte -->
<!-- Mounted fresh each time it opens via {#if} in the section, so the fields start empty. -->
<script lang="ts">
    import type { CreateDisclosureBody } from '$lib/api/privacyApi';
    import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
    import TextInput from '$lib/components/ui/TextInput.svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';
    import TimePicker from '$lib/components/ui/TimePicker.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { todayIso } from '$lib/utils/date';
    import { RECIPIENT_TYPE_LABELS } from '../labels';

    interface Props {
        submitting: boolean;
        submitError: string | null;
        onsubmit: (body: CreateDisclosureBody) => void;
        onclose: () => void;
    }
    let { submitting, submitError, onsubmit, onclose }: Props = $props();

    let date          = $state(todayIso());
    let time          = $state('');
    let recipientName = $state('');
    let recipientType = $state('');
    let purpose       = $state('');
    let description   = $state('');
    let validation    = $state<string | null>(null);

    const selectClass = `w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
        focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none
        disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50`;

    function handleSubmit(e: SubmitEvent): void {
        e.preventDefault();
        if (submitting) return;

        if (!date || !time) {
            validation = 'Indique la fecha y la hora de la divulgación.';
            return;
        }
        const disclosedAt = new Date(`${date}T${time}:00`);
        if (disclosedAt.getTime() > Date.now()) {
            validation = 'La fecha de divulgación no puede ser futura.';
            return;
        }
        if (!recipientName.trim() || !recipientType || !purpose.trim() || !description.trim()) {
            validation = 'Complete destinatario, tipo, motivo y descripción.';
            return;
        }

        validation = null;
        onsubmit({
            DisclosedAt: disclosedAt.toISOString(),
            RecipientName: recipientName.trim(),
            RecipientType: recipientType,
            Purpose: purpose.trim(),
            Description: description.trim()
        });
    }
</script>

<ModalDialog open={true} title="Registrar divulgación" widthClass="max-w-lg" {onclose}>
    <form id="disclosure-form" onsubmit={handleSubmit} class="space-y-4" novalidate>
        <p class="text-xs text-stone-500 dark:text-stone-400">
            Solo para entregas de información fuera de atención, pago y operaciones. El registro no se puede
            editar ni borrar. Describa el tipo de información, no copie su contenido clínico.
        </p>

        <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
                <label for="disclosure-date" class="block text-sm font-medium text-stone-700 dark:text-stone-300">Fecha</label>
                <DatePicker id="disclosure-date" bind:value={date} maxDate={todayIso()} disabled={submitting} />
            </div>
            <div class="space-y-1.5">
                <label for="disclosure-time" class="block text-sm font-medium text-stone-700 dark:text-stone-300">Hora</label>
                <TimePicker id="disclosure-time" bind:value={time} step={15} disabled={submitting} />
            </div>
        </div>

        <div class="space-y-1.5">
            <label for="disclosure-recipient" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Destinatario
            </label>
            <TextInput id="disclosure-recipient" bind:value={recipientName} maxLength={200} disabled={submitting} />
        </div>

        <div class="space-y-1.5">
            <label for="disclosure-type" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Tipo de destinatario
            </label>
            <select id="disclosure-type" bind:value={recipientType} disabled={submitting} class={selectClass}>
                <option value="">Seleccionar…</option>
                {#each Object.entries(RECIPIENT_TYPE_LABELS) as [value, label] (value)}
                    <option {value}>{label}</option>
                {/each}
            </select>
        </div>

        <div class="space-y-1.5">
            <label for="disclosure-purpose" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Motivo
            </label>
            <TextInput id="disclosure-purpose" bind:value={purpose} maxLength={300} disabled={submitting} />
        </div>

        <div class="space-y-1.5">
            <label for="disclosure-description" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Información entregada
            </label>
            <TextInput id="disclosure-description" bind:value={description} maxLength={500} disabled={submitting} />
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
            form="disclosure-form"
            disabled={submitting}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white
                   hover:bg-teal-600 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            {submitting ? 'Guardando…' : 'Registrar'}
        </button>
    {/snippet}
</ModalDialog>
