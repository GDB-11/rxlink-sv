<!-- src/lib/features/communication-preferences/components/CommunicationPreferencesForm.svelte -->
<!-- Remounted by the section ({#key}) each time the saved preference changes, so the fields snapshot it. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import type { CommunicationPreferenceResponse, UpdateCommunicationPreferenceBody } from '$lib/api/privacyApi';
    import TextInput from '$lib/components/ui/TextInput.svelte';
    import ToggleSwitch from '$lib/components/ui/ToggleSwitch.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';

    interface Props {
        preference: CommunicationPreferenceResponse;
        saving: boolean;
        saveError: string | null;
        onsave: (body: UpdateCommunicationPreferenceBody) => void;
    }
    let { preference, saving, saveError, onsave }: Props = $props();

    let allowEmail       = $state(untrack(() => preference.allowEmail));
    let allowSms         = $state(untrack(() => preference.allowSms));
    let alternativeEmail = $state(untrack(() => preference.alternativeEmail ?? ''));
    let alternativePhone = $state(untrack(() => preference.alternativePhone ?? ''));
    let validation       = $state<string | null>(null);

    const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const PHONE_RE = /^\+?[0-9 ]{6,19}$/;

    function handleSubmit(e: SubmitEvent): void {
        e.preventDefault();
        if (saving) return;

        const email = alternativeEmail.trim();
        const phone = alternativePhone.trim();
        if (email && !EMAIL_RE.test(email)) {
            validation = 'El correo alternativo no es válido.';
            return;
        }
        if (phone && !PHONE_RE.test(phone)) {
            validation = 'El teléfono alternativo no es válido (solo dígitos, espacios y un "+" inicial).';
            return;
        }

        validation = null;
        onsave({
            AllowEmail: allowEmail,
            AllowSms: allowSms,
            AlternativeEmail: email || null,
            AlternativePhone: phone || null
        });
    }
</script>

<form onsubmit={handleSubmit} class="space-y-4" novalidate>
    <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-stone-700 dark:text-stone-300">Permitir avisos por correo</span>
            <ToggleSwitch checked={allowEmail} label="Permitir avisos por correo" disabled={saving}
                          onchange={(v) => (allowEmail = v)} />
        </div>
        <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-stone-700 dark:text-stone-300">Permitir avisos por SMS</span>
            <ToggleSwitch checked={allowSms} label="Permitir avisos por SMS" disabled={saving}
                          onchange={(v) => (allowSms = v)} />
        </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
        <div class="space-y-1.5">
            <label for="pref-alt-email" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Correo alternativo
            </label>
            <TextInput id="pref-alt-email" type="email" bind:value={alternativeEmail} maxLength={254}
                       disabled={saving} placeholder="Usa el de la ficha si está vacío" />
        </div>
        <div class="space-y-1.5">
            <label for="pref-alt-phone" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Teléfono alternativo
            </label>
            <TextInput id="pref-alt-phone" bind:value={alternativePhone} maxLength={20}
                       disabled={saving} placeholder="Usa el de la ficha si está vacío" />
        </div>
    </div>

    <ErrorAlert message={validation ?? saveError} />

    <div class="flex justify-end">
        <button
            type="submit"
            disabled={saving}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white
                   hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60
                   dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            {saving ? 'Guardando…' : 'Guardar preferencias'}
        </button>
    </div>
</form>
