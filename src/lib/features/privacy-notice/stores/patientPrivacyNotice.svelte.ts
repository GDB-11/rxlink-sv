// src/lib/features/privacy-notice/stores/patientPrivacyNotice.svelte.ts
// Notice of Privacy Practices in force + the acknowledgments of the open patient.

import { privacyApi, type PatientPrivacyNoticeStatusResponse } from '$lib/api/privacyApi';

let _patientCode = $state<string | null>(null);
let _status      = $state<PatientPrivacyNoticeStatusResponse | null>(null);
let _loading     = $state(false);
let _error       = $state<string | null>(null);
let _submitting  = $state(false);
let _submitError = $state<string | null>(null);

export const patientPrivacyNotice = {
    get status():      PatientPrivacyNoticeStatusResponse | null { return _status; },
    get loading():     boolean                                   { return _loading; },
    get error():       string | null                             { return _error; },
    get submitting():  boolean                                   { return _submitting; },
    get submitError(): string | null                             { return _submitError; },

    async load(patientCode: string): Promise<void> {
        if (patientCode !== _patientCode) {
            _patientCode = patientCode;
            _status      = null;
        }
        _loading = true;
        _error   = null;
        try {
            const res = await privacyApi.getPatientPrivacyNotice(patientCode);
            // Ignore a response that arrives after the user moved to another patient.
            if (patientCode === _patientCode) _status = res;
        } catch (err) {
            if (patientCode === _patientCode) {
                _error = err instanceof Error ? err.message : 'Error al cargar el aviso de privacidad.';
            }
        } finally {
            _loading = false;
        }
    },

    /** Returns true when the acknowledgment was recorded (or already existed). */
    async acknowledge(): Promise<boolean> {
        if (!_patientCode) return false;
        const patientCode = _patientCode;
        _submitting  = true;
        _submitError = null;
        try {
            const res = await privacyApi.acknowledgePrivacyNotice(patientCode);
            if (patientCode === _patientCode) _status = res;
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al registrar la conformidad.';
            return false;
        } finally {
            _submitting = false;
        }
    }
};
