<!-- src/lib/features/medical-profile/components/PrescriptionSafetyWarningList.svelte -->
<!-- Renders allergy / drug-interaction warnings returned by the safety check. -->
<script lang="ts">
    import { IconAlertTriangle, IconAlertOctagon } from '@tabler/icons-svelte';
    import type { PrescriptionSafetyWarning } from '$lib/api/prescriptionApi';

    interface Props {
        warnings: PrescriptionSafetyWarning[];
    }
    let { warnings }: Props = $props();

    const SEVERITY_LABEL: Record<string, string> = {
        Minor:           'Leve',
        Moderate:        'Moderada',
        Major:           'Grave',
        Contraindicated: 'Contraindicada'
    };

    function isCritical(w: PrescriptionSafetyWarning): boolean {
        return w.kind === 'Allergy' || w.severity === 'Major' || w.severity === 'Contraindicated';
    }

    function title(w: PrescriptionSafetyWarning): string {
        if (w.kind === 'Allergy') return 'Alergia del paciente';
        return `Interacción ${SEVERITY_LABEL[w.severity ?? ''] ?? ''}`.trim();
    }
</script>

<ul class="space-y-2" aria-label="Advertencias de seguridad">
    {#each warnings as w (w.kind + w.ruleCode + w.medicationCodes.join())}
        <li
            class="flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm
                   {isCritical(w)
                       ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                       : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}"
        >
            {#if isCritical(w)}
                <IconAlertOctagon size={16} class="mt-0.5 shrink-0" aria-hidden="true" />
            {:else}
                <IconAlertTriangle size={16} class="mt-0.5 shrink-0" aria-hidden="true" />
            {/if}
            <div>
                <p class="font-medium">
                    {title(w)}{#if w.kind === 'Allergy' && w.severity} · {w.severity}{/if}
                </p>
                <p>{w.message}</p>
                {#if w.otherPrescriptionCode}
                    <p class="mt-0.5 text-xs opacity-80">Con un medicamento de otra receta activa del paciente.</p>
                {/if}
            </div>
        </li>
    {/each}
</ul>
