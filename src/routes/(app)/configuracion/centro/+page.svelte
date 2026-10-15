<!-- src/routes/(app)/configuracion/centro/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { clinic, ClinicForm } from '$lib/features/clinic';
    import { partner, PartnerIdentityCard } from '$lib/features/partner';

    onMount(() => {
        clinic.clearFeedback();
        clinic.load();
        partner.load();
    });
</script>

<svelte:head>
    <title>Centro — RxLink</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Centro
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Dirección y datos de contacto del centro de atención
        </p>
    </div>

    {#if partner.data}
        <PartnerIdentityCard identity={partner.data} />
    {/if}

    {#if clinic.loading && !clinic.data}
        <div class="h-96 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-700"></div>
    {:else if clinic.error}
        <div
            class="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800
                   dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
            role="alert"
        >
            {clinic.error}
        </div>
    {:else if clinic.data}
        <section
            class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900"
        >
            <p class="mb-5 text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-stone-400">
                {clinic.data.name}
            </p>

            {#key clinic.data.clinicCode}
                <ClinicForm
                    initial={clinic.data}
                    submitting={clinic.submitting}
                    submitError={clinic.submitError}
                    submitSuccess={clinic.submitSuccess}
                    onsubmit={(body) => clinic.save(body)}
                    onedit={() => clinic.clearFeedback()}
                />
            {/key}
        </section>
    {/if}
</div>
