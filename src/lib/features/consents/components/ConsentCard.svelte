<!-- src/lib/features/consents/components/ConsentCard.svelte -->
<script lang="ts">
    import type { ConsentResponse } from '$lib/api/privacyApi';
    import { consentTypeLabel } from '../labels';

    interface Props {
        consent: ConsentResponse;
        onrevoke: (consent: ConsentResponse) => void;
    }
    let { consent, onrevoke }: Props = $props();

    const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
    const revoked = $derived(consent.revokedAt !== null);
</script>

<li class="space-y-1 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="text-sm font-semibold text-stone-900 dark:text-stone-50">
            {consentTypeLabel(consent.consentType)}
            <span
                class="ml-1.5 rounded-full px-2 py-0.5 text-xs font-medium
                       {revoked
                    ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    : 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'}"
            >
                {revoked ? 'Revocado' : 'Vigente'}
            </span>
        </p>
        <p class="text-xs text-stone-500 dark:text-stone-400">
            {dateFormat.format(new Date(consent.grantedAt))}
        </p>
    </div>
    <p class="text-sm text-stone-700 dark:text-stone-300">{consent.description}</p>
    <p class="text-xs text-stone-400 dark:text-stone-500">Registrado por {consent.recordedByName}</p>

    {#if revoked && consent.revokedAt}
        <p class="text-xs text-stone-500 dark:text-stone-400">
            Revocado el {dateFormat.format(new Date(consent.revokedAt))}
            {consent.revokedByName ? `por ${consent.revokedByName}` : 'por el propio paciente'}:
            {consent.revokedReason}
        </p>
    {:else}
        <button
            type="button"
            onclick={() => onrevoke(consent)}
            class="cursor-pointer text-xs font-medium text-red-600 hover:underline dark:text-red-400"
        >
            Revocar
        </button>
    {/if}
</li>
