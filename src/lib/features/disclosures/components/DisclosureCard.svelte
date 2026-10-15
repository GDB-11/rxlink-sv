<!-- src/lib/features/disclosures/components/DisclosureCard.svelte -->
<script lang="ts">
    import type { DisclosureResponse } from '$lib/api/privacyApi';
    import { recipientTypeLabel } from '../labels';

    interface Props {
        disclosure: DisclosureResponse;
    }
    let { disclosure }: Props = $props();

    const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<li class="space-y-1 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="text-sm font-semibold text-stone-900 dark:text-stone-50">
            {disclosure.recipientName}
            <span class="ml-1 text-xs font-normal text-stone-500 dark:text-stone-400">
                {recipientTypeLabel(disclosure.recipientType)}
            </span>
        </p>
        <p class="text-xs text-stone-500 dark:text-stone-400">
            {dateFormat.format(new Date(disclosure.disclosedAt))}
        </p>
    </div>
    <p class="text-sm text-stone-700 dark:text-stone-300">
        <span class="font-medium">Motivo:</span> {disclosure.purpose}
    </p>
    <p class="text-sm text-stone-700 dark:text-stone-300">
        <span class="font-medium">Información:</span> {disclosure.description}
    </p>
    <p class="text-xs text-stone-400 dark:text-stone-500">Registrado por {disclosure.recordedByName}</p>
</li>
