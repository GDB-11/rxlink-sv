<!-- src/lib/features/admin-appointments/components/BookAppointmentForm.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { patientApi, type PatientResponse } from '$lib/api/patientApi';
    import { userApi, type UserResponse } from '$lib/api/userApi';
    import { availabilityApi, type AvailabilityResponse } from '$lib/api/availabilityApi';
    import { bookAppointment } from '../stores/bookAppointment.svelte';
    import { adminAppointments } from '../stores/adminAppointments.svelte';

    onMount(async () => {
        bookAppointment.reset();
        await bookAppointment.init();
    });

    // ── Step 1: Patient search ──────────────────────────────────────────────
    let patientSearch  = $state('');
    let patientResults = $state<PatientResponse[]>([]);
    let patientLoading = $state(false);
    let patientTimer: ReturnType<typeof setTimeout> | null = null;

    function onPatientInput(): void {
        if (patientTimer) clearTimeout(patientTimer);
        patientTimer = setTimeout(async () => {
            if (!patientSearch.trim()) { patientResults = []; return; }
            patientLoading = true;
            try {
                const data = await patientApi.getPage(1, 8, patientSearch.trim());
                patientResults = data.items;
            } catch { patientResults = []; }
            finally { patientLoading = false; }
        }, 300);
    }

    function selectPatient(p: PatientResponse): void {
        bookAppointment.selectPatient(p);
        patientResults = [];
        patientSearch  = '';
    }

    // ── Step 2: Doctor search + slot picker ────────────────────────────────
    let doctorSearch  = $state('');
    let doctorResults = $state<UserResponse[]>([]);
    let doctorLoading = $state(false);
    let doctorTimer: ReturnType<typeof setTimeout> | null = null;

    let slots        = $state<AvailabilityResponse[]>([]);
    let slotsLoading = $state(false);
    let slotsError   = $state<string | null>(null);
    let currentMonth = $state(new Date().toISOString().slice(0, 7));

    function onDoctorInput(): void {
        if (doctorTimer) clearTimeout(doctorTimer);
        doctorTimer = setTimeout(async () => {
            if (!doctorSearch.trim()) { doctorResults = []; return; }
            doctorLoading = true;
            try {
                const data = await userApi.getPage(1, 8, doctorSearch.trim(), 'Doctor');
                doctorResults = data.items;
            } catch { doctorResults = []; }
            finally { doctorLoading = false; }
        }, 300);
    }

    async function selectDoctor(u: UserResponse): Promise<void> {
        bookAppointment.selectDoctor(u.userCode, `${u.names} ${u.surnames}`);
        doctorResults = [];
        doctorSearch  = '';
        await loadSlots();
    }

    async function loadSlots(): Promise<void> {
        if (!bookAppointment.selectedDoctorCode) return;
        slotsLoading = true;
        slotsError   = null;
        try {
            const all = await availabilityApi.getSlots(bookAppointment.selectedDoctorCode, currentMonth);
            slots = all.filter(s => !s.isBooked);
        } catch (err) {
            slotsError = err instanceof Error ? err.message : 'Error al cargar los horarios.';
        } finally {
            slotsLoading = false;
        }
    }

    async function prevMonth(): Promise<void> {
        const [y, m] = currentMonth.split('-').map(Number);
        const d = new Date(y, m - 2, 1);
        currentMonth = d.toISOString().slice(0, 7);
        await loadSlots();
    }

    async function nextMonth(): Promise<void> {
        const [y, m] = currentMonth.split('-').map(Number);
        const d = new Date(y, m, 1);
        currentMonth = d.toISOString().slice(0, 7);
        await loadSlots();
    }

    const slotsByDate = $derived(
        slots.reduce<Record<string, AvailabilityResponse[]>>((acc, s) => {
            (acc[s.date] ??= []).push(s);
            return acc;
        }, {})
    );

    const sortedDates = $derived(Object.keys(slotsByDate).sort());

    function fmtDate(s: string): string {
        return new Date(s + 'T00:00:00').toLocaleDateString('es-PE', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    // ── Step 3: Submit ─────────────────────────────────────────────────────
    async function submit(): Promise<void> {
        const result = await bookAppointment.submit();
        if (result) {
            adminAppointments.load();
            goto('/citas');
        }
    }
</script>

<div class="mx-auto max-w-2xl space-y-6">
    <div class="flex items-center gap-4">
        <a
            href="/citas"
            class="text-sm text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
        >
            ← Volver
        </a>
        <h1 class="text-xl font-semibold text-stone-900 dark:text-stone-50">Nueva cita</h1>
    </div>

    <!-- Step indicator -->
    <div class="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
        {#each [{ n: 1, label: 'Paciente' }, { n: 2, label: 'Médico y horario' }, { n: 3, label: 'Tipo y pago' }] as s (s.n)}
            <span class="flex items-center gap-1">
                <span class="flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold
                             {bookAppointment.step === s.n
                                 ? 'bg-teal-500 text-white'
                                 : bookAppointment.step > s.n
                                     ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
                                     : 'bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-600'}">
                    {s.n}
                </span>
                <span class="{bookAppointment.step === s.n ? 'text-stone-700 dark:text-stone-200' : ''}">{s.label}</span>
            </span>
            {#if s.n < 3}<span>›</span>{/if}
        {/each}
    </div>

    <!-- ── Step 1: Patient ── -->
    {#if bookAppointment.step === 1}
        <div class="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
            <h2 class="text-base font-medium text-stone-900 dark:text-stone-50">Buscar paciente</h2>
            <input
                type="text"
                bind:value={patientSearch}
                oninput={onPatientInput}
                placeholder="Nombre o apellido del paciente…"
                class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
                       placeholder-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                       dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
            {#if patientLoading}
                <p class="text-xs text-stone-400">Buscando…</p>
            {:else if patientResults.length > 0}
                <ul class="divide-y divide-stone-100 rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-700">
                    {#each patientResults as p (p.patientCode)}
                        <li>
                            <button
                                type="button"
                                onclick={() => selectPatient(p)}
                                class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm
                                       hover:bg-stone-50 dark:hover:bg-stone-800/50"
                            >
                                <span class="font-medium text-stone-900 dark:text-stone-50">
                                    {p.surnames}, {p.names}
                                </span>
                                <span class="text-xs text-stone-400">{p.medicalRecordNumber}</span>
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else if patientSearch.trim() && !patientLoading}
                <p class="text-xs text-stone-400">Sin resultados.</p>
            {/if}
        </div>
    {/if}

    <!-- ── Step 2: Doctor & Slot ── -->
    {#if bookAppointment.step === 2}
        <div class="space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
            <div>
                <p class="text-xs text-stone-500 dark:text-stone-400">Paciente seleccionado</p>
                <p class="text-sm font-medium text-stone-900 dark:text-stone-50">
                    {bookAppointment.selectedPatient?.surnames}, {bookAppointment.selectedPatient?.names}
                </p>
            </div>

            <h2 class="text-base font-medium text-stone-900 dark:text-stone-50">Buscar médico</h2>
            <input
                type="text"
                bind:value={doctorSearch}
                oninput={onDoctorInput}
                placeholder="Nombre o apellido del médico…"
                class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
                       placeholder-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                       dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
            {#if doctorLoading}
                <p class="text-xs text-stone-400">Buscando…</p>
            {:else if doctorResults.length > 0}
                <ul class="divide-y divide-stone-100 rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-700">
                    {#each doctorResults as u (u.userCode)}
                        <li>
                            <button
                                type="button"
                                onclick={() => selectDoctor(u)}
                                class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm
                                       hover:bg-stone-50 dark:hover:bg-stone-800/50"
                            >
                                <span class="font-medium text-stone-900 dark:text-stone-50">
                                    {u.surnames}, {u.names}
                                </span>
                                <span class="text-xs text-stone-400">{u.specialtyName ?? ''}</span>
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else if doctorSearch.trim() && !doctorLoading}
                <p class="text-xs text-stone-400">Sin resultados.</p>
            {/if}

            {#if bookAppointment.selectedDoctorCode}
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-stone-700 dark:text-stone-300">
                            Disponibilidad de {bookAppointment.selectedDoctorName}
                        </p>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick={prevMonth}
                                class="rounded-lg border border-stone-200 px-2 py-1 text-xs hover:bg-stone-50
                                       dark:border-stone-700 dark:hover:bg-stone-800">
                                ‹
                            </button>
                            <span class="text-xs font-medium text-stone-600 dark:text-stone-400">{currentMonth}</span>
                            <button type="button" onclick={nextMonth}
                                class="rounded-lg border border-stone-200 px-2 py-1 text-xs hover:bg-stone-50
                                       dark:border-stone-700 dark:hover:bg-stone-800">
                                ›
                            </button>
                        </div>
                    </div>
                    {#if slotsLoading}
                        <div class="space-y-2">
                            {#each [1, 2, 3] as n (n)}
                                <div class="h-10 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800"></div>
                            {/each}
                        </div>
                    {:else if slotsError}
                        <p class="text-xs text-rose-600 dark:text-rose-400">{slotsError}</p>
                    {:else if sortedDates.length === 0}
                        <p class="text-xs text-stone-400">Sin horarios disponibles para este mes.</p>
                    {:else}
                        <div class="space-y-3">
                            {#each sortedDates as d (d)}
                                <div>
                                    <p class="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                                        {fmtDate(d)}
                                    </p>
                                    <div class="flex flex-wrap gap-2">
                                        {#each slotsByDate[d] as slot (slot.availabilityCode)}
                                            <button
                                                type="button"
                                                onclick={() => bookAppointment.selectSlot(slot)}
                                                class="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium
                                                       text-teal-700 transition-colors hover:bg-teal-50
                                                       dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/20"
                                            >
                                                {slot.startTime}
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}

            <button type="button" onclick={() => bookAppointment.goBack()}
                class="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200">
                ← Cambiar paciente
            </button>
        </div>
    {/if}

    <!-- ── Step 3: Type & Payment ── -->
    {#if bookAppointment.step === 3}
        <div class="space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
            <!-- Summary -->
            <div class="space-y-1 rounded-lg bg-stone-50 p-4 text-sm dark:bg-stone-800/50">
                <p class="font-medium text-stone-700 dark:text-stone-300">Resumen</p>
                <p class="text-stone-600 dark:text-stone-400">
                    <span class="font-medium">Paciente:</span>
                    {bookAppointment.selectedPatient?.surnames}, {bookAppointment.selectedPatient?.names}
                </p>
                <p class="text-stone-600 dark:text-stone-400">
                    <span class="font-medium">Médico:</span> {bookAppointment.selectedDoctorName}
                </p>
                <p class="text-stone-600 dark:text-stone-400">
                    <span class="font-medium">Horario:</span>
                    {bookAppointment.selectedSlot?.date} — {bookAppointment.selectedSlot?.startTime}
                </p>
            </div>

            <!-- Consultation type -->
            <div>
                <p class="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">Tipo de consulta</p>
                <div class="flex gap-3">
                    {#each bookAppointment.consultationTypes as ct (ct.code)}
                        <label class="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="radio"
                                name="consultation-type"
                                value={ct.code}
                                checked={bookAppointment.selectedConsultationTypeCode === ct.code}
                                onchange={() => bookAppointment.setConsultationType(ct.code)}
                                class="accent-teal-500"
                            />
                            {ct.name}
                        </label>
                    {/each}
                </div>
            </div>

            <!-- Payment -->
            <div>
                <p class="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">Estado de pago</p>
                <div class="flex gap-4">
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                            type="radio"
                            name="payment-status"
                            value="false"
                            checked={!bookAppointment.isPaid}
                            onchange={() => bookAppointment.setIsPaid(false)}
                            class="accent-teal-500"
                        />
                        Pendiente de pago
                    </label>
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                            type="radio"
                            name="payment-status"
                            value="true"
                            checked={bookAppointment.isPaid}
                            onchange={() => bookAppointment.setIsPaid(true)}
                            class="accent-teal-500"
                        />
                        Pagado
                    </label>
                </div>
            </div>

            {#if bookAppointment.error}
                <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                            dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                    {bookAppointment.error}
                </div>
            {/if}

            <div class="flex items-center gap-3">
                <button
                    type="button"
                    onclick={submit}
                    disabled={bookAppointment.submitting}
                    class="rounded-lg bg-teal-500 px-6 py-2 text-sm font-medium text-white transition-colors
                           hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    {bookAppointment.submitting ? 'Registrando…' : 'Confirmar cita'}
                </button>
                <button
                    type="button"
                    onclick={() => bookAppointment.goBack()}
                    class="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                >
                    ← Volver
                </button>
            </div>
        </div>
    {/if}
</div>
