<!-- src/lib/features/admin-appointments/components/BookAppointmentForm.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { IconSearch, IconUser, IconStethoscope, IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';
    import { patientApi, type PatientResponse } from '$lib/api/patientApi';
    import { userApi, type UserResponse } from '$lib/api/userApi';
    import { availabilityApi, type AvailabilityResponse } from '$lib/api/availabilityApi';
    import { bookAppointment } from '../stores/bookAppointment.svelte';
    import { adminAppointments } from '../stores/adminAppointments.svelte';
    import PaymentMethodPicker from '$lib/components/ui/PaymentMethodPicker.svelte';

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
        bookAppointment.selectDoctor(u.userCode, `${u.surnames}, ${u.names}`, u.specialtyCode);
        doctorResults = [];
        doctorSearch  = '';
        await loadSlots();
    }

    function deselectDoctor(): void {
        bookAppointment.selectDoctor('', '');
        doctorSearch  = '';
        doctorResults = [];
        slots         = [];
        slotsError    = null;
    }

    function isFutureSlot(date: string, startTime: string): boolean {
        return new Date(`${date}T${startTime}:00`) > new Date();
    }

    async function loadSlots(): Promise<void> {
        if (!bookAppointment.selectedDoctorCode) return;
        slotsLoading = true;
        slotsError   = null;
        try {
            const all = await availabilityApi.getSlots(bookAppointment.selectedDoctorCode, currentMonth);
            slots = all.filter(s => !s.isBooked && isFutureSlot(s.date, s.startTime));
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
        if (!s) return '';
        return new Date(s + 'T00:00:00').toLocaleDateString('es-PE', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    function fmtMonth(ym: string): string {
        const [y, m] = ym.split('-').map(Number);
        const s = new Date(y, m - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // ── Step 3: Submit ─────────────────────────────────────────────────────
    async function submit(): Promise<void> {
        const result = await bookAppointment.submit();
        if (result) {
            adminAppointments.load();
            goto('/citas');
        }
    }

    const STEPS = [
        { n: 1 as const, label: 'Paciente' },
        { n: 2 as const, label: 'Médico y horario' },
        { n: 3 as const, label: 'Tipo y pago' }
    ];
</script>

<div class="mx-auto max-w-2xl space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
        <a
            href="/citas"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500
                   transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700
                   dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label="Volver a citas"
        >
            <IconChevronLeft size={16} aria-hidden="true" />
        </a>
        <h1 class="text-xl font-semibold text-stone-900 dark:text-stone-50">Nueva cita</h1>
    </div>

    <!-- Step indicator -->
    <div class="flex items-center">
        {#each STEPS as s (s.n)}
            {@const active = bookAppointment.step === s.n}
            {@const done   = bookAppointment.step > s.n}
            <div class="flex items-center gap-2">
                <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                           {active ? 'bg-teal-500 text-white'
                            : done  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
                            : 'bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500'}"
                >
                    {done ? '✓' : s.n}
                </span>
                <span
                    class="text-sm
                           {active ? 'font-semibold text-stone-900 dark:text-stone-50'
                            : done  ? 'text-teal-600 dark:text-teal-400'
                            : 'text-stone-400 dark:text-stone-500'}"
                >
                    {s.label}
                </span>
            </div>
            {#if s.n < 3}
                <div class="mx-3 h-px flex-1 bg-stone-200 dark:bg-stone-700"></div>
            {/if}
        {/each}
    </div>

    <!-- ── Step 1: Patient ── -->
    {#if bookAppointment.step === 1}
        <div class="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
            <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">Buscar paciente</h2>

            <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {#if patientLoading}
                        <span class="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-teal-500
                                     dark:border-stone-600 dark:border-t-teal-400" aria-hidden="true"></span>
                    {:else}
                        <IconSearch size={16} class="text-stone-400" aria-hidden="true" />
                    {/if}
                </div>
                <input
                    type="text"
                    bind:value={patientSearch}
                    oninput={onPatientInput}
                    placeholder="Nombre o apellido del paciente…"
                    autocomplete="off"
                    class="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm
                           text-stone-900 placeholder-stone-400
                           focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                           dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
                />
            </div>

            {#if patientResults.length > 0}
                <ul class="overflow-hidden rounded-lg border border-stone-200 divide-y divide-stone-100
                           dark:border-stone-700 dark:divide-stone-800">
                    {#each patientResults as p (p.patientCode)}
                        <li>
                            <button
                                type="button"
                                onclick={() => selectPatient(p)}
                                class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm
                                       transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20"
                            >
                                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                                             bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                                    <IconUser size={14} aria-hidden="true" />
                                </span>
                                <span class="min-w-0 flex-1">
                                    <span class="block font-medium text-stone-900 dark:text-stone-50">
                                        {p.surnames}, {p.names}
                                    </span>
                                    <span class="block text-xs text-stone-400">{p.medicalRecordNumber}</span>
                                </span>
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else if patientSearch.trim() && !patientLoading}
                <p class="text-sm text-stone-400">Sin resultados para "{patientSearch}".</p>
            {/if}
        </div>
    {/if}

    <!-- ── Step 2: Doctor & Slot ── -->
    {#if bookAppointment.step === 2}
        <div class="space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
            <!-- Selected patient chip -->
            <div class="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50/60 px-4 py-3
                        dark:border-teal-800 dark:bg-teal-900/20">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                             bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400">
                    <IconUser size={15} aria-hidden="true" />
                </span>
                <div class="min-w-0 flex-1">
                    <p class="text-xs text-teal-600 dark:text-teal-400">Paciente</p>
                    <p class="text-sm font-medium text-stone-900 dark:text-stone-50">
                        {bookAppointment.selectedPatient?.surnames}, {bookAppointment.selectedPatient?.names}
                    </p>
                </div>
                <button
                    type="button"
                    onclick={() => bookAppointment.goBack()}
                    class="cursor-pointer shrink-0 rounded p-1 text-stone-400 transition-colors
                           hover:bg-teal-100 hover:text-stone-600
                           dark:hover:bg-teal-800 dark:hover:text-stone-300"
                    aria-label="Cambiar paciente"
                >
                    <IconX size={14} aria-hidden="true" />
                </button>
            </div>

            <div class="border-t border-stone-100 pt-4 dark:border-stone-800">
                <h2 class="mb-3 text-base font-semibold text-stone-900 dark:text-stone-50">Buscar médico</h2>

                <!-- Doctor selected chip OR search input -->
                {#if bookAppointment.selectedDoctorCode}
                    <div class="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3
                                dark:border-stone-700 dark:bg-stone-800/50">
                        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                                     bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400">
                            <IconStethoscope size={15} aria-hidden="true" />
                        </span>
                        <div class="min-w-0 flex-1">
                            <p class="text-xs text-stone-500 dark:text-stone-400">Médico</p>
                            <p class="text-sm font-medium text-stone-900 dark:text-stone-50">
                                {bookAppointment.selectedDoctorName}
                            </p>
                        </div>
                        <button
                            type="button"
                            onclick={deselectDoctor}
                            class="cursor-pointer shrink-0 rounded p-1 text-stone-400 transition-colors
                                   hover:bg-stone-200 hover:text-stone-600
                                   dark:hover:bg-stone-700 dark:hover:text-stone-300"
                            aria-label="Cambiar médico"
                        >
                            <IconX size={14} aria-hidden="true" />
                        </button>
                    </div>
                {:else}
                    <div class="relative">
                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            {#if doctorLoading}
                                <span class="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-teal-500
                                             dark:border-stone-600 dark:border-t-teal-400" aria-hidden="true"></span>
                            {:else}
                                <IconSearch size={16} class="text-stone-400" aria-hidden="true" />
                            {/if}
                        </div>
                        <input
                            type="text"
                            bind:value={doctorSearch}
                            oninput={onDoctorInput}
                            placeholder="Nombre o apellido del médico…"
                            autocomplete="off"
                            class="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm
                                   text-stone-900 placeholder-stone-400
                                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                                   dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
                        />
                    </div>

                    {#if doctorResults.length > 0}
                        <ul class="mt-2 overflow-hidden rounded-lg border border-stone-200 divide-y divide-stone-100
                                   dark:border-stone-700 dark:divide-stone-800">
                            {#each doctorResults as u (u.userCode)}
                                <li>
                                    <button
                                        type="button"
                                        onclick={() => selectDoctor(u)}
                                        class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm
                                               transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20"
                                    >
                                        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                                                     bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                                            <IconStethoscope size={14} aria-hidden="true" />
                                        </span>
                                        <span class="min-w-0 flex-1">
                                            <span class="block font-medium text-stone-900 dark:text-stone-50">
                                                {u.surnames}, {u.names}
                                            </span>
                                            {#if u.specialtyName}
                                                <span class="block text-xs text-stone-400">{u.specialtyName}</span>
                                            {/if}
                                        </span>
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {:else if doctorSearch.trim() && !doctorLoading}
                        <p class="mt-2 text-sm text-stone-400">Sin resultados para "{doctorSearch}".</p>
                    {/if}
                {/if}
            </div>

            <!-- Availability slots -->
            {#if bookAppointment.selectedDoctorCode}
                <div class="space-y-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-semibold text-stone-700 dark:text-stone-300">Horarios disponibles</p>
                        <div class="flex items-center gap-1">
                            <button
                                type="button"
                                onclick={prevMonth}
                                aria-label="Mes anterior"
                                class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-stone-200
                                       text-stone-500 transition-colors hover:bg-stone-50
                                       dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                            >
                                <IconChevronLeft size={14} aria-hidden="true" />
                            </button>
                            <span class="min-w-[110px] text-center text-sm font-medium text-stone-700 dark:text-stone-300">
                                {fmtMonth(currentMonth)}
                            </span>
                            <button
                                type="button"
                                onclick={nextMonth}
                                aria-label="Mes siguiente"
                                class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-stone-200
                                       text-stone-500 transition-colors hover:bg-stone-50
                                       dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                            >
                                <IconChevronRight size={14} aria-hidden="true" />
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
                        <p class="text-sm text-rose-600 dark:text-rose-400">{slotsError}</p>
                    {:else if sortedDates.length === 0}
                        <p class="text-sm text-stone-400">Sin horarios disponibles para {fmtMonth(currentMonth)}.</p>
                    {:else}
                        <div class="space-y-4">
                            {#each sortedDates as d (d)}
                                <div>
                                    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                                        {fmtDate(d)}
                                    </p>
                                    <div class="flex flex-wrap gap-2">
                                        {#each slotsByDate[d] as slot (slot.availabilityCode)}
                                            <button
                                                type="button"
                                                onclick={() => bookAppointment.selectSlot(slot)}
                                                class="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium
                                                       text-teal-700 transition-colors hover:border-teal-500 hover:bg-teal-50
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
        </div>
    {/if}

    <!-- ── Step 3: Type & Payment ── -->
    {#if bookAppointment.step === 3}
        <div class="space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
            <!-- Summary -->
            <div class="space-y-2 rounded-lg bg-stone-50 p-4 dark:bg-stone-800/50">
                <p class="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">Resumen</p>
                <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                    <span class="font-medium text-stone-600 dark:text-stone-400">Paciente</span>
                    <span class="text-stone-900 dark:text-stone-50">
                        {bookAppointment.selectedPatient?.surnames}, {bookAppointment.selectedPatient?.names}
                    </span>
                    <span class="font-medium text-stone-600 dark:text-stone-400">Médico</span>
                    <span class="text-stone-900 dark:text-stone-50">{bookAppointment.selectedDoctorName}</span>
                    <span class="font-medium text-stone-600 dark:text-stone-400">Fecha</span>
                    <span class="text-stone-900 dark:text-stone-50">
                        {fmtDate(bookAppointment.selectedSlot?.date ?? '')}
                    </span>
                    <span class="font-medium text-stone-600 dark:text-stone-400">Hora</span>
                    <span class="text-stone-900 dark:text-stone-50">{bookAppointment.selectedSlot?.startTime}</span>
                </div>
            </div>

            <!-- Consultation type -->
            <div>
                <p class="mb-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300">Tipo de consulta</p>
                <div class="flex flex-wrap gap-2">
                    {#each bookAppointment.consultationTypes as ct (ct.code)}
                        <button
                            type="button"
                            onclick={() => bookAppointment.setConsultationType(ct.code)}
                            class="rounded-lg border px-4 py-2 text-sm font-medium transition-colors
                                   {bookAppointment.selectedConsultationTypeCode === ct.code
                                       ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-600 dark:bg-teal-900/30 dark:text-teal-300'
                                       : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800'}"
                        >
                            {ct.name}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Payment method -->
            <div>
                <p class="mb-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300">Forma de pago</p>
                <PaymentMethodPicker
                    insurances={bookAppointment.insurances}
                    basePrice={bookAppointment.basePrice}
                    mode="booking"
                    bind:paymentMode={bookAppointment.paymentMode}
                    bind:insuranceCode={bookAppointment.selectedInsuranceCode}
                />
            </div>

            {#if bookAppointment.error}
                <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                            dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                    {bookAppointment.error}
                </div>
            {/if}

            <div class="flex items-center gap-3 pt-1">
                <button
                    type="button"
                    onclick={submit}
                    disabled={bookAppointment.submitting}
                    class="rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors
                           hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    {bookAppointment.submitting ? 'Registrando…' : 'Confirmar cita'}
                </button>
                <button
                    type="button"
                    onclick={() => bookAppointment.goBack()}
                    class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium
                           text-stone-600 transition-colors hover:bg-stone-50
                           dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                    ← Volver
                </button>
            </div>
        </div>
    {/if}
</div>
