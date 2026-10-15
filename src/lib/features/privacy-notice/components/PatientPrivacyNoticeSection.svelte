<!-- src/lib/features/privacy-notice/components/PatientPrivacyNoticeSection.svelte -->
<!-- Notice of Privacy Practices of one patient: version in force, acknowledgment and history. -->
<script lang="ts">
    import { IconCircleCheck } from '@tabler/icons-svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { patientPrivacyNotice } from '../stores/patientPrivacyNotice.svelte';

    interface Props {
        patientCode: string;
    }
    let { patientCode }: Props = $props();

    const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
    const status = $derived(patientPrivacyNotice.status);

    $effect(() => {
        patientPrivacyNotice.load(patientCode);
    });
</script>

<section class="space-y-4">
    <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">Aviso de privacidad</h2>

    <ErrorAlert message={patientPrivacyNotice.error} />

    {#if status && !status.current}
        <p class="rounded-xl border border-dashed border-stone-300 px-5 py-6 text-center text-sm text-stone-500
                  dark:border-stone-700 dark:text-stone-400">
            Aún no hay un aviso de privacidad vigente. Un administrador debe publicarlo.
        </p>
    {:else if status?.current}
        <div class="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm font-semibold text-stone-900 dark:text-stone-50">
                    Versión {status.current.version} · {status.current.title}
                </p>
                {#if status.currentAcknowledged}
                    <span class="flex items-center gap-1.5 text-sm font-medium text-teal-700 dark:text-teal-400">
                        <IconCircleCheck size={16} aria-hidden="true" />
                        Confirmado
                    </span>
                {:else}
                    <button
                        type="button"
                        onclick={() => patientPrivacyNotice.acknowledge()}
                        disabled={patientPrivacyNotice.submitting}
                        class="cursor-pointer rounded-lg bg-teal-500 px-3 py-2 text-sm font-medium text-white
                               hover:bg-teal-600 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-700"
                    >
                        {patientPrivacyNotice.submitting ? 'Guardando…' : 'Registrar conformidad'}
                    </button>
                {/if}
            </div>

            <details class="text-sm text-stone-700 dark:text-stone-300">
                <summary class="cursor-pointer text-teal-700 dark:text-teal-400">Ver texto del aviso</summary>
                <p class="mt-2 whitespace-pre-line">{status.current.body}</p>
            </details>

            <ErrorAlert message={patientPrivacyNotice.submitError} />

            {#if status.acknowledgments.length > 0}
                <ul class="space-y-1 border-t border-stone-100 pt-3 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                    {#each status.acknowledgments as ack (ack.privacyNoticeCode)}
                        <li>
                            Versión {ack.version} confirmada el {dateFormat.format(new Date(ack.acknowledgedAt))}
                            {ack.recordedByName ? `· registrado por ${ack.recordedByName}` : '· por el propio paciente'}
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</section>
