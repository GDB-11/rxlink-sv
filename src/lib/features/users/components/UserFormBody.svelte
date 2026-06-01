<!-- src/lib/features/users/components/UserFormBody.svelte -->
<!-- Mounted fresh on every open via {#key} in UserForm — no $effect needed. -->
<script lang="ts">
    import { untrack } from 'svelte';
    import { IconUser } from '@tabler/icons-svelte';
    import type { UserResponse, CreateUserBody, UpdateUserBody } from '$lib/api/userApi';
    import type { PersonResponse } from '$lib/api/personApi';
    import type { UserLookups } from '../stores/users.svelte';
    import PersonPicker from '$lib/components/ui/PersonPicker.svelte';
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

    // Person selection (create mode only)
    let selectedPerson = $state<PersonResponse | null>(null);

    // Account fields
    let roleName      = $state(untrack(() => initial?.roleName ?? ''));
    let specialtyCode = $state(untrack(() => initial?.specialtyCode ?? ''));
    let username      = $state(untrack(() => initial?.username ?? ''));
    let email         = $state(untrack(() => initial?.email ?? ''));
    let password      = $state('');
    let licenseNumber = $state(untrack(() => initial?.licenseNumber ?? ''));

    let fieldErrors = $state<Record<string, string>>({});

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (mode === 'create' && !selectedPerson) e.person = 'Seleccione una persona para continuar.';
        if (!roleName)        e.roleName  = 'Seleccione el rol.';
        if (!username.trim()) e.username  = 'El nombre de usuario es requerido.';
        if (!email.trim())    e.email     = 'El correo de cuenta es requerido.';
        else if (!emailRe.test(email.trim())) e.email = 'Ingrese un correo válido.';
        if (mode === 'create' && !password.trim()) e.password = 'La contraseña es requerida.';
        fieldErrors = e;
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!validate()) return;

        const common = {
            RoleName:     roleName,
            SpecialtyCode: specialtyCode || null,
            Username:     username.trim(),
            Email:        email.trim(),
            LicenseNumber: licenseNumber.trim() || null
        };

        if (mode === 'create') {
            onsubmit({ ...common, PersonCode: selectedPerson!.personCode, Password: password });
        } else {
            onsubmit(common);
        }
    }

    function docSummary(u: UserResponse): string {
        if (!u.documentTypeName || !u.documentNumber) return 'Sin documento registrado';
        return `${u.documentTypeName} ${u.documentNumber}`;
    }

    const dpNormal = 'border-stone-200 bg-white focus:border-teal-500 dark:border-stone-700 dark:bg-stone-900';
    const dpErr    = 'border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/30';
    function dpCls(field: string) { return fieldErrors[field] ? dpErr : dpNormal; }

    const sectionTitle = 'mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400';
    const fieldLabel   = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300';
    const fieldError   = 'mt-1 text-xs text-rose-600 dark:text-rose-400';
    const required     = 'text-rose-500';
    const optionalLabel = 'ml-1 text-xs font-normal text-stone-400';
</script>

<form onsubmit={handleSubmit} novalidate>
    <div class="max-h-[70vh] overflow-y-auto px-6 py-5">

        {#if error}
            <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                       text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                {error}
            </div>
        {/if}

        <!-- Person section -->
        <p class={sectionTitle}>Persona</p>
        {#if mode === 'create'}
            <div class="mb-1">
                <PersonPicker
                    onselect={(p) => (selectedPerson = p)}
                    disabled={submitting}
                    error={!!fieldErrors.person}
                    excludeLinkedUsers={true}
                />
            </div>
            {#if fieldErrors.person}
                <p class={fieldError}>{fieldErrors.person}</p>
            {/if}
        {:else if initial}
            <!-- Locked person summary in edit mode -->
            <div class="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50
                        px-4 py-3 dark:border-stone-700 dark:bg-stone-800/50">
                <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                            bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400">
                    <IconUser size={16} aria-hidden="true" />
                </div>
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                        {initial.surnames}, {initial.names}
                    </p>
                    <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                        {docSummary(initial)}
                    </p>
                </div>
            </div>
        {/if}

        <!-- Account section -->
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
