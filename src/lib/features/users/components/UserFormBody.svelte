<!-- src/lib/features/users/components/UserFormBody.svelte -->
<!-- Mounted fresh on every open via {#key} in UserForm — no $effect needed. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import type { UserResponse, CreateUserBody, UpdateUserBody } from '$lib/api/userApi';
    import type { UserLookups } from '../stores/users.svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';
    import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
    import SearchSelect from '$lib/components/ui/SearchSelect.svelte';
    import PasswordStrengthField from '$lib/components/ui/PasswordStrengthField.svelte';
    import TextInput from '$lib/components/ui/TextInput.svelte';

    interface Props {
        mode: 'create' | 'edit';
        initial: UserResponse | null;
        lookups: UserLookups;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: CreateUserBody | UpdateUserBody) => void;
        oncancel: () => void;
    }
    let { mode, initial, lookups, submitting, error, onsubmit, oncancel }: Props = $props();

    // Personal data
    let names                 = $state(untrack(() => initial?.names ?? ''));
    let surnames              = $state(untrack(() => initial?.surnames ?? ''));
    let birthDate             = $state(untrack(() => initial?.birthDate ?? ''));
    let sexCode               = $state(untrack(() => initial?.sexCode ?? ''));
    let phone                 = $state(untrack(() => initial?.phone ?? ''));
    let alternativePhone      = $state(untrack(() => initial?.alternativePhone ?? ''));
    let personEmail           = $state(untrack(() => initial?.personEmail ?? ''));
    let address               = $state(untrack(() => initial?.address ?? ''));

    // Emergency contact
    let emergencyContactName  = $state(untrack(() => initial?.emergencyContactName ?? ''));
    let emergencyContactPhone = $state(untrack(() => initial?.emergencyContactPhone ?? ''));

    // Document
    let documentTypeCode      = $state(untrack(() => initial?.documentTypeCode ?? ''));
    let documentNumber        = $state(untrack(() => initial?.documentNumber ?? ''));
    let documentIssueDate     = $state(untrack(() => initial?.documentIssueDate ?? ''));
    let documentExpDate       = $state(untrack(() => initial?.documentExpirationDate ?? ''));

    // Account
    let roleName              = $state(untrack(() => initial?.roleName ?? ''));
    let specialtyCode         = $state(untrack(() => initial?.specialtyCode ?? ''));
    let username              = $state(untrack(() => initial?.username ?? ''));
    let email                 = $state(untrack(() => initial?.email ?? ''));
    let password              = $state('');
    let licenseNumber         = $state(untrack(() => initial?.licenseNumber ?? ''));

    let fieldErrors = $state<Record<string, string>>({});

    const TODAY = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!names.trim())        e.names           = 'Los nombres son requeridos.';
        if (!surnames.trim())     e.surnames         = 'Los apellidos son requeridos.';
        if (!birthDate)           e.birthDate        = 'La fecha de nacimiento es requerida.';
        if (!sexCode)             e.sexCode          = 'Seleccione el sexo.';
        if (!phone.trim())        e.phone            = 'El teléfono es requerido.';
        if (!personEmail.trim())  e.personEmail      = 'El correo personal es requerido.';
        else if (!emailRe.test(personEmail.trim())) e.personEmail = 'Ingrese un correo válido.';
        if (!documentTypeCode)    e.documentTypeCode = 'Seleccione el tipo de documento.';
        if (!documentNumber.trim()) e.documentNumber = 'El número de documento es requerido.';
        if (!roleName)            e.roleName         = 'Seleccione el rol.';
        if (!username.trim())     e.username         = 'El nombre de usuario es requerido.';
        if (!email.trim())        e.email            = 'El correo de cuenta es requerido.';
        else if (!emailRe.test(email.trim())) e.email = 'Ingrese un correo válido.';
        if (mode === 'create' && !password.trim()) e.password = 'La contraseña es requerida.';
        fieldErrors = e;
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!validate()) return;

        const common = {
            Names:                names.trim(),
            Surnames:             surnames.trim(),
            BirthDate:            birthDate,
            SexCode:              sexCode,
            Phone:                phone.trim(),
            AlternativePhone:     alternativePhone.trim() || null,
            PersonEmail:          personEmail.trim(),
            Address:              address.trim() || null,
            EmergencyContactName:  emergencyContactName.trim() || null,
            EmergencyContactPhone: emergencyContactPhone.trim() || null,
            DocumentTypeCode:     documentTypeCode,
            DocumentNumber:       documentNumber.trim(),
            DocumentIssueDate:    documentIssueDate || null,
            DocumentExpirationDate: documentExpDate || null,
            RoleName:             roleName,
            SpecialtyCode:        specialtyCode || null,
            Username:             username.trim(),
            Email:                email.trim(),
            LicenseNumber:        licenseNumber.trim() || null
        };

        if (mode === 'create') {
            onsubmit({ ...common, Password: password });
        } else {
            onsubmit(common);
        }
    }

    // TextInput, DatePicker, PhoneInput, SearchSelect all take border/bg only — focus styles are built in.
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
                    <label for="u-names" class={fieldLabel}>
                        Nombres <span class={required} aria-hidden="true">*</span>
                    </label>
                    <TextInput id="u-names" bind:value={names} filter="names" maxLength={200} disabled={submitting} class={dpCls('names')} />
                    {#if fieldErrors.names}<p class={fieldError}>{fieldErrors.names}</p>{/if}
                </div>
                <div>
                    <label for="u-surnames" class={fieldLabel}>
                        Apellidos <span class={required} aria-hidden="true">*</span>
                    </label>
                    <TextInput id="u-surnames" bind:value={surnames} filter="names" maxLength={150} disabled={submitting} class={dpCls('surnames')} />
                    {#if fieldErrors.surnames}<p class={fieldError}>{fieldErrors.surnames}</p>{/if}
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="u-birthDate" class={fieldLabel}>
                        Fecha de nacimiento <span class={required} aria-hidden="true">*</span>
                    </label>
                    <DatePicker id="u-birthDate" bind:value={birthDate} disabled={submitting} maxDate={TODAY} class={dpCls('birthDate')} />
                    {#if fieldErrors.birthDate}<p class={fieldError}>{fieldErrors.birthDate}</p>{/if}
                </div>
                <div>
                    <label for="u-sex" class={fieldLabel}>
                        Sexo <span class={required} aria-hidden="true">*</span>
                    </label>
                    <SearchSelect
                        id="u-sex"
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
                    <label for="u-phone" class={fieldLabel}>
                        Teléfono <span class={required} aria-hidden="true">*</span>
                    </label>
                    <PhoneInput id="u-phone" bind:value={phone} disabled={submitting} class={dpCls('phone')} format="### ### ###" />
                    {#if fieldErrors.phone}<p class={fieldError}>{fieldErrors.phone}</p>{/if}
                </div>
                <div>
                    <label for="u-altPhone" class={fieldLabel}>
                        Teléfono alternativo <span class={optionalLabel}>(opcional)</span>
                    </label>
                    <PhoneInput id="u-altPhone" bind:value={alternativePhone} disabled={submitting} format="### ### ###" />
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="u-personEmail" class={fieldLabel}>
                        Correo personal <span class={required} aria-hidden="true">*</span>
                    </label>
                    <TextInput id="u-personEmail" type="email" bind:value={personEmail} maxLength={254} autocomplete="email" disabled={submitting} class={dpCls('personEmail')} />
                    {#if fieldErrors.personEmail}<p class={fieldError}>{fieldErrors.personEmail}</p>{/if}
                </div>
                <div>
                    <label for="u-address" class={fieldLabel}>
                        Dirección <span class={optionalLabel}>(opcional)</span>
                    </label>
                    <TextInput id="u-address" bind:value={address} disabled={submitting} class={dpNormal} />
                </div>
            </div>

        </div>

        <!-- Emergency contact -->
        <div class="mt-6">
            <p class={sectionTitle}>Contacto de emergencia <span class={optionalLabel}>(opcional)</span></p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="u-ecName" class={fieldLabel}>Nombre</label>
                    <TextInput id="u-ecName" bind:value={emergencyContactName} filter="names" maxLength={200} disabled={submitting} class={dpNormal} />
                </div>
                <div>
                    <label for="u-ecPhone" class={fieldLabel}>Teléfono</label>
                    <PhoneInput id="u-ecPhone" bind:value={emergencyContactPhone} disabled={submitting} format="### ### ###" />
                </div>
            </div>
        </div>

        <!-- Identity document -->
        <div class="mt-6">
            <p class={sectionTitle}>Documento de identidad</p>
            <div class="space-y-4">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label for="u-docType" class={fieldLabel}>
                            Tipo de documento <span class={required} aria-hidden="true">*</span>
                        </label>
                        <SearchSelect
                            id="u-docType"
                            bind:value={documentTypeCode}
                            options={lookups.documentTypes.map(dt => ({ value: dt.code, label: dt.name }))}
                            disabled={submitting}
                            class={dpCls('documentTypeCode')}
                        />
                        {#if fieldErrors.documentTypeCode}<p class={fieldError}>{fieldErrors.documentTypeCode}</p>{/if}
                    </div>
                    <div>
                        <label for="u-docNumber" class={fieldLabel}>
                            Número <span class={required} aria-hidden="true">*</span>
                        </label>
                        <TextInput id="u-docNumber" bind:value={documentNumber} filter="digits" maxLength={50} disabled={submitting} class={dpCls('documentNumber')} />
                        {#if fieldErrors.documentNumber}<p class={fieldError}>{fieldErrors.documentNumber}</p>{/if}
                    </div>
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label for="u-docIssue" class={fieldLabel}>
                            Fecha de emisión <span class={optionalLabel}>(opcional)</span>
                        </label>
                        <DatePicker id="u-docIssue" bind:value={documentIssueDate} disabled={submitting} maxDate={TODAY} class={dpNormal} />
                    </div>
                    <div>
                        <label for="u-docExp" class={fieldLabel}>
                            Fecha de vencimiento <span class={optionalLabel}>(opcional)</span>
                        </label>
                        <DatePicker id="u-docExp" bind:value={documentExpDate} disabled={submitting} class={dpNormal} />
                    </div>
                </div>
            </div>
        </div>

        <!-- Account data -->
        <div class="mt-6">
            <p class={sectionTitle}>Cuenta</p>
            <div class="space-y-4">

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label for="u-role" class={fieldLabel}>
                            Rol <span class={required} aria-hidden="true">*</span>
                        </label>
                        <SearchSelect
                            id="u-role"
                            bind:value={roleName}
                            options={lookups.roles.map(r => ({ value: r.name, label: r.name }))}
                            disabled={submitting}
                            class={dpCls('roleName')}
                        />
                        {#if fieldErrors.roleName}<p class={fieldError}>{fieldErrors.roleName}</p>{/if}
                    </div>
                    <div>
                        <label for="u-specialty" class={fieldLabel}>
                            Especialidad <span class={optionalLabel}>(opcional)</span>
                        </label>
                        <SearchSelect
                            id="u-specialty"
                            bind:value={specialtyCode}
                            options={lookups.specialties.map(sp => ({ value: sp.code, label: sp.name }))}
                            placeholder="— Ninguna —"
                            disabled={submitting}
                            class={dpNormal}
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label for="u-username" class={fieldLabel}>
                            Nombre de usuario <span class={required} aria-hidden="true">*</span>
                        </label>
                        <TextInput id="u-username" bind:value={username} filter="username" maxLength={100} autocomplete="username" disabled={submitting} class={dpCls('username')} />
                        {#if fieldErrors.username}<p class={fieldError}>{fieldErrors.username}</p>{/if}
                    </div>
                    <div>
                        <label for="u-email" class={fieldLabel}>
                            Correo de cuenta <span class={required} aria-hidden="true">*</span>
                        </label>
                        <TextInput id="u-email" type="email" bind:value={email} maxLength={254} autocomplete="email" disabled={submitting} class={dpCls('email')} />
                        {#if fieldErrors.email}<p class={fieldError}>{fieldErrors.email}</p>{/if}
                    </div>
                </div>

                {#if mode === 'create'}
                    <div>
                        <label for="u-password" class={fieldLabel}>
                            Contraseña <span class={required} aria-hidden="true">*</span>
                        </label>
                        <PasswordStrengthField
                            id="u-password"
                            bind:value={password}
                            disabled={submitting}
                            minLength={8}
                            requireNumbers
                            requireUppercase
                            requireSpecial={true}
                            class={dpCls('password')}
                        />
                        {#if fieldErrors.password}<p class={fieldError}>{fieldErrors.password}</p>{/if}
                    </div>
                {/if}

                <div>
                    <label for="u-license" class={fieldLabel}>
                        Número de licencia <span class={optionalLabel}>(opcional)</span>
                    </label>
                    <TextInput id="u-license" bind:value={licenseNumber} maxLength={100} disabled={submitting} class={dpNormal} />
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
            {submitting ? 'Guardando…' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
        </button>
    </div>
</form>
