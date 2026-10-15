// src/lib/features/communication-preferences/stores/communicationPreferences.svelte.ts

import {
    privacyApi,
    type CommunicationPreferenceResponse,
    type UpdateCommunicationPreferenceBody
} from '$lib/api/privacyApi';

let _patientCode = $state<string | null>(null);
let _preference  = $state<CommunicationPreferenceResponse | null>(null);
let _loading     = $state(false);
let _error       = $state<string | null>(null);
let _saving      = $state(false);
let _saveError   = $state<string | null>(null);

export const communicationPreferences = {
    get preference():  CommunicationPreferenceResponse | null { return _preference; },
    get loading():     boolean       { return _loading; },
    get error():       string | null { return _error; },
    get saving():      boolean       { return _saving; },
    get saveError():   string | null { return _saveError; },

    async load(patientCode: string): Promise<void> {
        if (patientCode !== _patientCode) {
            _patientCode = patientCode;
            _preference  = null;
            _saveError   = null;
        }
        _loading = true;
        _error   = null;
        try {
            const res = await privacyApi.getCommunicationPreferences(patientCode);
            // Ignore a response that arrives after the user moved to another patient.
            if (patientCode === _patientCode) _preference = res;
        } catch (err) {
            if (patientCode === _patientCode) {
                _error = err instanceof Error ? err.message : 'Error al cargar las preferencias de comunicación.';
            }
        } finally {
            _loading = false;
        }
    },

    /** Returns true when saved; the stored preference is replaced by the server's copy. */
    async save(body: UpdateCommunicationPreferenceBody): Promise<boolean> {
        if (!_patientCode) return false;
        const patientCode = _patientCode;
        _saving    = true;
        _saveError = null;
        try {
            const res = await privacyApi.updateCommunicationPreferences(patientCode, body);
            if (patientCode === _patientCode) _preference = res;
            return true;
        } catch (err) {
            _saveError = err instanceof Error ? err.message : 'Error al guardar las preferencias.';
            return false;
        } finally {
            _saving = false;
        }
    }
};
