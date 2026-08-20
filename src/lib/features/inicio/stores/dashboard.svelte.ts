// src/lib/features/inicio/stores/dashboard.svelte.ts

import { appointmentApi, type AppointmentResponse } from '$lib/api/appointmentApi';
import { prescriptionApi, type DoctorDraftPrescriptionResponse, type NurseDispensationResponse } from '$lib/api/prescriptionApi';
import { todayIso } from '$lib/utils/date';

// ── Admin ─────────────────────────────────────────────────────────────────────

let _adminAppointments   = $state<AppointmentResponse[]>([]);
let _adminLoadingAppts   = $state(false);
let _adminError          = $state<string | null>(null);

// ── Doctor ────────────────────────────────────────────────────────────────────

let _doctorAppointments  = $state<AppointmentResponse[]>([]);
let _doctorDrafts        = $state<DoctorDraftPrescriptionResponse[]>([]);
let _doctorLoadingAppts  = $state(false);
let _doctorLoadingDrafts = $state(false);
let _doctorError         = $state<string | null>(null);

// ── Nurse ─────────────────────────────────────────────────────────────────────

let _dispensations       = $state<NurseDispensationResponse[]>([]);
let _nurseLoading        = $state(false);
let _nurseError          = $state<string | null>(null);

// ── Public store ──────────────────────────────────────────────────────────────

export const dashboard = {
    // Admin
    get adminAppointments()  { return _adminAppointments; },
    get adminLoadingAppts()  { return _adminLoadingAppts; },
    get adminError()         { return _adminError; },

    // Doctor
    get doctorAppointments() { return _doctorAppointments; },
    get doctorDrafts()       { return _doctorDrafts; },
    get doctorLoadingAppts() { return _doctorLoadingAppts; },
    get doctorLoadingDrafts(){ return _doctorLoadingDrafts; },
    get doctorError()        { return _doctorError; },

    // Nurse
    get dispensations()      { return _dispensations; },
    get nurseLoading()       { return _nurseLoading; },
    get nurseError()         { return _nurseError; },

    async loadAdmin(): Promise<void> {
        _adminLoadingAppts = true;
        _adminError = null;
        try {
            // Fetch today's appointments (all statuses, up to 50)
            const todayData = await appointmentApi.getAdminAppointments({
                date: todayIso(),
                pageSize: 50
            });
            let appts = todayData.items;

            // If confirmed slots < 5, fetch next upcoming confirmed ones
            const confirmedToday = appts.filter(a => a.statusName === 'Confirmado');
            if (confirmedToday.length < 5) {
                const upcoming = await appointmentApi.getAdminAppointments({
                    statusName: 'Confirmado',
                    pageSize: 5 - confirmedToday.length
                });
                const futureCodes = new Set(confirmedToday.map(a => a.appointmentCode));
                const extras = upcoming.items.filter(a => !futureCodes.has(a.appointmentCode));
                appts = [...appts, ...extras];
            }

            _adminAppointments = appts;
        } catch (err) {
            _adminError = err instanceof Error ? err.message : 'Error al cargar las citas.';
        } finally {
            _adminLoadingAppts = false;
        }
    },

    async loadDoctor(): Promise<void> {
        _doctorError = null;

        _doctorLoadingAppts = true;
        _doctorLoadingDrafts = true;

        const [apptResult, draftResult] = await Promise.allSettled([
            appointmentApi.getDoctorAppointments({ date: todayIso(), pageSize: 50 }),
            prescriptionApi.getDoctorDraftPrescriptions()
        ]);

        if (apptResult.status === 'fulfilled') {
            _doctorAppointments = apptResult.value.items;
        } else {
            _doctorError = 'Error al cargar las citas del día.';
        }
        _doctorLoadingAppts = false;

        if (draftResult.status === 'fulfilled') {
            _doctorDrafts = draftResult.value;
        } else {
            _doctorError = (_doctorError ? _doctorError + ' ' : '') + 'Error al cargar las recetas en borrador.';
        }
        _doctorLoadingDrafts = false;
    },

    async loadNurse(): Promise<void> {
        _nurseLoading = true;
        _nurseError = null;
        try {
            _dispensations = await prescriptionApi.getNurseDispensations(todayIso());
        } catch (err) {
            _nurseError = err instanceof Error ? err.message : 'Error al cargar las dispensaciones.';
        } finally {
            _nurseLoading = false;
        }
    },

    reset(): void {
        _adminAppointments   = [];
        _adminLoadingAppts   = false;
        _adminError          = null;
        _doctorAppointments  = [];
        _doctorDrafts        = [];
        _doctorLoadingAppts  = false;
        _doctorLoadingDrafts = false;
        _doctorError         = null;
        _dispensations       = [];
        _nurseLoading        = false;
        _nurseError          = null;
    }
};
