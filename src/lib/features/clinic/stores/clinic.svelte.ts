// src/lib/features/clinic/stores/clinic.svelte.ts

import { clinicApi, type ClinicResponse, type ClinicRequestBody } from '$lib/api/clinicApi';

let _data          = $state<ClinicResponse | null>(null);
let _loading       = $state(false);
let _error         = $state<string | null>(null);
let _submitting    = $state(false);
let _submitError   = $state<string | null>(null);
let _submitSuccess = $state(false);

export const clinic = {
    get data():          ClinicResponse | null { return _data; },
    get loading():       boolean               { return _loading; },
    get error():         string | null         { return _error; },
    get submitting():    boolean               { return _submitting; },
    get submitError():   string | null         { return _submitError; },
    get submitSuccess(): boolean               { return _submitSuccess; },

    async load(): Promise<void> {
        if (_loading) return;
        _loading = true;
        _error   = null;
        try {
            _data = await clinicApi.get();
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar los datos del centro.';
        } finally {
            _loading = false;
        }
    },

    async save(body: ClinicRequestBody): Promise<boolean> {
        _submitting    = true;
        _submitError   = null;
        _submitSuccess = false;
        try {
            _data = await clinicApi.update(body);
            _submitSuccess = true;
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al guardar los datos del centro.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    clearFeedback(): void {
        _submitError   = null;
        _submitSuccess = false;
    }
};
