<!-- src/lib/features/nurse/components/NurseBreakGlassPanel.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { nurse } from '../stores/nurse.svelte';
    import BreakGlassForm from './BreakGlassForm.svelte';

    let open = $state(false);

    async function handleSubmit(medicalRecordNumber: string, reason: string): Promise<void> {
        const patientCode = await nurse.requestBreakGlass(medicalRecordNumber, reason);
        if (patientCode) {
            await goto(resolve(`/enfermero/pacientes/${patientCode}`));
        }
    }

    function toggle(): void {
        open = !open;
        nurse.clearBreakGlassError();
    }
</script>

<section
    class="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-5
           dark:border-amber-800/60 dark:bg-amber-900/20"
    aria-labelledby="break-glass-title"
>
    <div class="flex items-start justify-between gap-4">
        <div>
            <h2 id="break-glass-title" class="text-sm font-semibold text-amber-900 dark:text-amber-200">
                ¿Necesita atender a un paciente que no aparece?
            </h2>
            <p class="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
                La búsqueda solo muestra pacientes con receta activa o cita de hoy. Para otros casos puede solicitar
                un acceso de emergencia de 4 horas; queda registrado y es revisado por el administrador.
            </p>
        </div>
        <button
            type="button"
            onclick={toggle}
            aria-expanded={open}
            class="shrink-0 cursor-pointer rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm
                   font-medium text-amber-900 transition-colors hover:bg-amber-100
                   dark:border-amber-700 dark:bg-stone-900 dark:text-amber-200 dark:hover:bg-stone-800"
        >
            {open ? 'Cancelar' : 'Acceso de emergencia'}
        </button>
    </div>

    {#if open}
        <div class="mt-4">
            <BreakGlassForm
                submitting={nurse.breakGlassSubmitting}
                error={nurse.breakGlassError}
                onsubmit={handleSubmit}
            />
        </div>
    {/if}
</section>
