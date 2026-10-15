<!-- src/lib/features/privacy-notice/components/PrivacyNoticeVersionCard.svelte -->
<script lang="ts">
    import type { PrivacyNoticeResponse } from '$lib/api/privacyApi';

    interface Props {
        notice: PrivacyNoticeResponse;
    }
    let { notice }: Props = $props();

    const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
    // EffectiveFrom is a calendar date: parse it as local so it never shifts a day.
    const effectiveFrom = $derived(
        new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(
            new Date(`${notice.effectiveFrom}T00:00:00`)
        )
    );
</script>

<article class="space-y-2 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
    <header class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 class="text-sm font-semibold text-stone-900 dark:text-stone-50">
            Versión {notice.version} · {notice.title}
        </h2>
        <p class="text-xs text-stone-500 dark:text-stone-400">Vigente desde {effectiveFrom}</p>
    </header>
    <p class="text-xs text-stone-400 dark:text-stone-500">
        Publicado el {dateFormat.format(new Date(notice.publishedAt))}
    </p>
    <details class="text-sm text-stone-700 dark:text-stone-300">
        <summary class="cursor-pointer text-teal-700 dark:text-teal-400">Ver texto</summary>
        <p class="mt-2 whitespace-pre-line">{notice.body}</p>
    </details>
</article>
