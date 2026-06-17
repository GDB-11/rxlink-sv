// src/lib/features/doctor-consultations/stores/consultationRoom.svelte.ts

import { appointmentApi, type AppointmentResponse } from '$lib/api/appointmentApi';
import { diagnosticApi, type DiagnosticResponse } from '$lib/api/diagnosticApi';

let _appointment = $state<AppointmentResponse | null>(null);
let _diagnostic  = $state<DiagnosticResponse | null>(null);
let _loading     = $state(false);
let _completing  = $state(false);
let _error       = $state<string | null>(null);

let _appointmentCode = '';

async function _fetchDiagnostic(patientCode: string, appointmentCode: string): Promise<void> {
    const data = await diagnosticApi.getDiagnostics(patientCode, 1, 100);
    _diagnostic = data.items.find(d => d.appointmentCode === appointmentCode) ?? null;
}

export const consultationRoom = {
    get appointment() { return _appointment; },
    get diagnostic()  { return _diagnostic; },
    get loading()     { return _loading; },
    get completing()  { return _completing; },
    get error()       { return _error; },

    async load(appointmentCode: string): Promise<void> {
        _appointmentCode = appointmentCode;
        _loading = true;
        _error   = null;
        try {
            const appt = await appointmentApi.getAppointment(appointmentCode);
            _appointment = appt;
            await _fetchDiagnostic(appt.patientCode, appointmentCode);
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar la consulta.';
        } finally {
            _loading = false;
        }
    },

    async reloadDiagnostic(): Promise<void> {
        if (!_appointment) return;
        try {
            await _fetchDiagnostic(_appointment.patientCode, _appointmentCode);
        } catch {
            // silently ignore — the UI will show stale data
        }
    },

    async complete(): Promise<boolean> {
        if (!_appointment) return false;
        _completing = true;
        _error      = null;
        try {
            await appointmentApi.completeAppointment(_appointmentCode);
            _appointment = { ..._appointment, statusName: 'Completado' };
            return true;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al completar la consulta.';
            return false;
        } finally {
            _completing = false;
        }
    },

    reset(): void {
        _appointment     = null;
        _diagnostic      = null;
        _loading         = false;
        _completing      = false;
        _error           = null;
        _appointmentCode = '';
    }
};
