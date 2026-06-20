<!-- src/lib/features/profile/components/ProfileInfoCard.svelte -->
<script lang="ts">
    import type { UserResponse } from '$lib/api/profileApi';

    interface Props {
        data: UserResponse;
    }

    let { data }: Props = $props();

    function formatDate(value: string | null | undefined): string {
        if (!value) return '—';
        return new Date(value).toLocaleDateString('es', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function getInitials(fullName: string): string {
        return fullName
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase();
    }
</script>

<div class="space-y-6">

    <!-- Avatar + name header -->
    <div class="flex items-center gap-4">
        <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full
                   bg-teal-100 text-2xl font-semibold text-teal-700
                   dark:bg-teal-900 dark:text-teal-300"
            aria-hidden="true"
        >
            {getInitials(`${data.names} ${data.surnames}`)}
        </div>
        <div>
            <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-50">
                {data.names} {data.surnames}
            </h2>
            <p class="text-sm text-stone-500 dark:text-stone-400">{data.roleName}</p>
        </div>
    </div>

    <!-- Account info -->
    <section>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Cuenta
        </h3>
        <dl class="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-800">
            <div class="flex items-center gap-4 px-4 py-3">
                <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Usuario</dt>
                <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.username}</dd>
            </div>
            <div class="flex items-center gap-4 px-4 py-3">
                <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Correo</dt>
                <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.email}</dd>
            </div>
            <div class="flex items-center gap-4 px-4 py-3">
                <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Rol</dt>
                <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.roleName}</dd>
            </div>
            {#if data.specialtyName}
                <div class="flex items-center gap-4 px-4 py-3">
                    <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Especialidad</dt>
                    <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.specialtyName}</dd>
                </div>
            {/if}
            {#if data.licenseNumber}
                <div class="flex items-center gap-4 px-4 py-3">
                    <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">N.º licencia</dt>
                    <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.licenseNumber}</dd>
                </div>
            {/if}
            <div class="flex items-center gap-4 px-4 py-3">
                <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Miembro desde</dt>
                <dd class="text-sm text-stone-900 dark:text-stone-50">{formatDate(data.createdAt)}</dd>
            </div>
        </dl>
    </section>

    <!-- Personal info -->
    <section>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Datos personales
        </h3>
        <dl class="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-800">
            <div class="flex items-center gap-4 px-4 py-3">
                <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Sexo</dt>
                <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.sexName}</dd>
            </div>
            <div class="flex items-center gap-4 px-4 py-3">
                <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Teléfono</dt>
                <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.phone}</dd>
            </div>
            {#if data.alternativePhone}
                <div class="flex items-center gap-4 px-4 py-3">
                    <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Tel. alternativo</dt>
                    <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.alternativePhone}</dd>
                </div>
            {/if}
            <div class="flex items-center gap-4 px-4 py-3">
                <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Correo personal</dt>
                <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.personEmail}</dd>
            </div>
            {#if data.address}
                <div class="flex items-center gap-4 px-4 py-3">
                    <dt class="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">Dirección</dt>
                    <dd class="text-sm font-medium text-stone-900 dark:text-stone-50">{data.address}</dd>
                </div>
            {/if}
        </dl>
    </section>

</div>
