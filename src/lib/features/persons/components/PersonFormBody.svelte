<!-- src/lib/features/persons/components/PersonFormBody.svelte -->
<!-- Mounted fresh on every open via {#key} in PersonForm — no $effect needed. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import type { PersonResponse, PersonRequestBody } from '$lib/api/personApi';
    import type { PersonLookups } from '../stores/persons.svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';
    import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
    import SearchSelect from '$lib/components/ui/SearchSelect.svelte';
    import TextInput from '$lib/components/ui/TextInput.svelte';

    interface Props {
        mode: 'create' | 'edit';
        initial: PersonResponse | null;
        lookups: PersonLookups;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: PersonRequestBody) => void;
        oncancel: () => void;
    }
    let { mode, initial, lookups, submitting, error, onsubmit, oncancel }: Props = $props();

    let names                 = $state(untrack(() => initial?.names ?? ''));
    let surnames              = $state(untrack(() => initial?.surnames ?? ''));
    let birthDate             = $state(untrack(() => initial?.birthDate ?? ''));
    let sexCode               = $state(untrack(() => initial?.sexCode ?? ''));
    let phone                 = $state(untrack(() => initial?.phone ?? ''));
    let alternativePhone      = $state(untrack(() => initial?.alternativePhone ?? ''));
    let email                 = $state(untrack(() => initial?.email ?? ''));
    let address               = $state(untrack(() => initial?.address ?? ''));
    let emergencyContactName  = $state(untrack(() => initial?.emergencyContactName ?? ''));
    let emergencyContactPhone = $state(untrack(() => initial?.emergencyContactPhone ?? ''));

    let fieldErrors = $state<Record<string, string>>({});

    const TODAY = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!names.trim())       e.names    = 'Los nombres son requeridos.';
        if (!surnames.trim())    e.surnames  = 'Los apellidos son requeridos.';
        if (!birthDate)          e.birthDate = 'La fecha de nacimiento es requerida.';
        if (!sexCode)            e.sexCode   = 'Seleccione el sexo.';
        if (!phone.trim())       e.phone     = 'El teléfono es requerido.';
        if (!email.trim())       e.email     = 'El correo es requerido.';
        else if (!emailRe.test(email.trim())) e.email = 'Ingrese un correo válido.';
        fieldErrors = e;
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!validate()) return;

        onsubmit({
            Names:                names.trim(),
            Surnames:             surnames.trim(),
            BirthDate:            birthDate,
            SexCode:              sexCode,
            Phone:                phone.trim(),
            AlternativePhone:     alternativePhone.trim() || null,
            Email:                email.trim(),
            Address:              address.trim() || null,
            EmergencyContactName:  emergencyContactName.trim() || null,
            EmergencyContactPhone: emergencyContactPhone.trim() || null
        });
    }

    const dpNormal = 'border-stone-200 bg-white focus:border-teal-500 dark:border-stone-700 dark:bg-stone-900';
    const dpErr    = 'border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/30';

    function dpCls(field: string) {
        return fieldErrors[field] ? dpErr : dpNormal;
    }

    const optionalLabel = 'ml-1 text-xs font-normal text-stone-400';
    const sectionTitle  = 'mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400';
    const fieldLabel    = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300';
    const fieldError    = 'mt-1 text-xs text-rose-600 dark:text-rose-400';
    const required      = 'text-rose-500';
</script>

<form onsubmit={handleSubmit} novalidate>
    <div class="max-h-[70vh] overflow-y-auto px-6 py-5">

        {#if error}
            <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                       text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                {error}
            </div>
        {/if}

        <!-- Personal data -->
        <p class={sectionTitle}>Datos personales</p>
        <div class="space-y-4">

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="p-names" class={fieldLabel}>
                        Nombres <span class={required} aria-hidden="true">*</span>
                    </label>
                    <TextInput id="p-names" bind:value={names} filter="names" maxLength={200} disabled={submitting} class={dpCls('names')} />
                    {#if fieldErrors.names}<p class={fieldError}>{fieldErrors.names}</p>{/if}
                </div>
                <div>
                    <label for="p-surnames" class={fieldLabel}>
                        Apellidos <span class={required} aria-hidden="true">*</span>
                    </label>
                    <TextInput id="p-surnames" bind:value={surnames} filter="names" maxLength={150} disabled={submitting} class={dpCls('surnames')} />
                    {#if fieldErrors.surnames}<p class={fieldError}>{fieldErrors.surnames}</p>{/if}
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="p-birthDate" class={fieldLabel}>
                        Fecha de nacimiento <span class={required} aria-hidden="true">*</span>
                    </label>
                    <DatePicker id="p-birthDate" bind:value={birthDate} disabled={submitting} maxDate={TODAY} class={dpCls('birthDate')} />
                    {#if fieldErrors.birthDate}<p class={fieldError}>{fieldErrors.birthDate}</p>{/if}
                </div>
                <div>
                    <label for="p-sex" class={fieldLabel}>
                        Sexo <span class={required} aria-hidden="true">*</span>
                    </label>
                    <SearchSelect
                        id="p-sex"
                        bind:value={sexCode}
                        options={lookups.sexes.map(s => ({ value: s.code, label: s.name }))}
                        disabled={submitting}
                        class={dpCls('sexCode')}
                    />
                    {#if fieldErrors.sexCode}<p class={fieldError}>{fieldErrors.sexCode}</p>{/if}
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="p-phone" class={fieldLabel}>
                        Teléfono <span class={required} aria-hidden="true">*</span>
                    </label>
                    <PhoneInput id="p-phone" bind:value={phone} disabled={submitting} class={dpCls('phone')} format="### ### ###" />
                    {#if fieldErrors.phone}<p class={fieldError}>{fieldErrors.phone}</p>{/if}
                </div>
                <div>
                    <label for="p-altPhone" class={fieldLabel}>
                        Teléfono alternativo <span class={optionalLabel}>(opcional)</span>
                    </label>
                    <PhoneInput id="p-altPhone" bind:value={alternativePhone} disabled={submitting} format="### ### ###" />
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="p-email" class={fieldLabel}>
                        Correo <span class={required} aria-hidden="true">*</span>
                    </label>
                    <TextInput id="p-email" type="email" bind:value={email} maxLength={254} autocomplete="email" disabled={submitting} class={dpCls('email')} />
                    {#if fieldErrors.email}<p class={fieldError}>{fieldErrors.email}</p>{/if}
                </div>
                <div>
                    <label for="p-address" class={fieldLabel}>
                        Dirección <span class={optionalLabel}>(opcional)</span>
                    </label>
                    <TextInput id="p-address" bind:value={address} disabled={submitting} class={dpNormal} />
                </div>
            </div>

        </div>

        <!-- Emergency contact -->
        <div class="mt-6">
            <p class={sectionTitle}>Contacto de emergencia <span class={optionalLabel}>(opcional)</span></p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="p-ecName" class={fieldLabel}>Nombre</label>
                    <TextInput id="p-ecName" bind:value={emergencyContactName} filter="names" maxLength={200} disabled={submitting} class={dpNormal} />
                </div>
                <div>
                    <label for="p-ecPhone" class={fieldLabel}>Teléfono</label>
                    <PhoneInput id="p-ecPhone" bind:value={emergencyContactPhone} disabled={submitting} format="### ### ###" />
                </div>
            </div>
        </div>

    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
        <button
            type="button"
            onclick={oncancel}
            disabled={submitting}
            class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                   text-stone-600 transition-colors
                   hover:bg-stone-50 hover:text-stone-900
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-stone-700 dark:text-stone-400
                   dark:hover:bg-stone-700 dark:hover:text-stone-50"
        >
            Cancelar
        </button>
        <button
            type="submit"
            disabled={submitting}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                   text-white transition-colors
                   hover:bg-teal-600
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            {submitting ? 'Guardando…' : mode === 'create' ? 'Crear persona' : 'Guardar cambios'}
        </button>
    </div>
</form>
