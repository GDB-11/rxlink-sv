<!-- src/lib/features/clinic/components/ClinicForm.svelte -->
<!-- Mounted fresh per loaded record via {#key} in the page — no $effect needed. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import type { ClinicResponse, ClinicRequestBody } from '$lib/api/clinicApi';
    import TextInput from '$lib/components/ui/TextInput.svelte';
    import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
    import SubmitButton from '$lib/components/ui/SubmitButton.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';

    interface Props {
        initial: ClinicResponse;
        submitting: boolean;
        submitError: string | null;
        submitSuccess: boolean;
        onsubmit: (data: ClinicRequestBody) => void;
        onedit: () => void;
    }

    let { initial, submitting, submitError, submitSuccess, onsubmit, onedit }: Props = $props();

    let address                  = $state(untrack(() => initial.address ?? ''));
    let district                 = $state(untrack(() => initial.district ?? ''));
    let province                 = $state(untrack(() => initial.province ?? ''));
    let department               = $state(untrack(() => initial.department ?? ''));
    let phone                    = $state(untrack(() => initial.phone ?? ''));
    let email                    = $state(untrack(() => initial.email ?? ''));
    let website                  = $state(untrack(() => initial.website ?? ''));
    let facilityRegistrationCode = $state(untrack(() => initial.facilityRegistrationCode ?? ''));

    let fieldErrors = $state<Record<string, string>>({});

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function orNull(v: string): string | null {
        const t = v.trim();
        return t === '' ? null : t;
    }

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (email.trim() && !emailRe.test(email.trim())) e.email = 'Ingrese un correo válido.';
        fieldErrors = e;
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (submitting || !validate()) return;
        onsubmit({
            Address: orNull(address),
            District: orNull(district),
            Province: orNull(province),
            Department: orNull(department),
            Phone: orNull(phone),
            Email: orNull(email),
            Website: orNull(website),
            FacilityRegistrationCode: orNull(facilityRegistrationCode)
        });
    }
</script>

<form onsubmit={handleSubmit} oninput={onedit} class="space-y-5" novalidate>
    {#if submitSuccess}
        <div
            class="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800
                   dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
            role="status"
        >
            Datos del centro actualizados correctamente.
        </div>
    {/if}

    <ErrorAlert message={submitError} />

    <div class="space-y-1.5">
        <label for="clinic-address" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Dirección
        </label>
        <TextInput id="clinic-address" bind:value={address} maxLength={250} disabled={submitting} />
    </div>

    <div class="grid gap-5 sm:grid-cols-3">
        <div class="space-y-1.5">
            <label for="clinic-district" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Distrito
            </label>
            <TextInput id="clinic-district" bind:value={district} maxLength={100} disabled={submitting} />
        </div>
        <div class="space-y-1.5">
            <label for="clinic-province" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Provincia
            </label>
            <TextInput id="clinic-province" bind:value={province} maxLength={100} disabled={submitting} />
        </div>
        <div class="space-y-1.5">
            <label for="clinic-department" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Departamento
            </label>
            <TextInput id="clinic-department" bind:value={department} maxLength={100} disabled={submitting} />
        </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
        <div class="space-y-1.5">
            <label for="clinic-phone" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Teléfono
            </label>
            <PhoneInput id="clinic-phone" bind:value={phone} disabled={submitting} />
        </div>
        <div class="space-y-1.5">
            <label for="clinic-email" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Correo electrónico
            </label>
            <TextInput
                id="clinic-email"
                type="email"
                bind:value={email}
                maxLength={150}
                autocomplete="off"
                disabled={submitting}
            />
            {#if fieldErrors.email}
                <p class="text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email}</p>
            {/if}
        </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
        <div class="space-y-1.5">
            <label for="clinic-website" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Sitio web
            </label>
            <TextInput
                id="clinic-website"
                bind:value={website}
                maxLength={250}
                placeholder="https://"
                disabled={submitting}
            />
        </div>
        <div class="space-y-1.5">
            <label for="clinic-facility-code" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Código de registro (IPRESS)
            </label>
            <TextInput
                id="clinic-facility-code"
                bind:value={facilityRegistrationCode}
                maxLength={50}
                disabled={submitting}
            />
        </div>
    </div>

    <div class="sm:max-w-xs">
        <SubmitButton
            isLoading={submitting}
            label="Guardar cambios"
            loadingLabel="Guardando…"
        />
    </div>
</form>
