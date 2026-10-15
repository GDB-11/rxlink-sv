// src/lib/features/disclosures/stores/disclosures.svelte.ts

import {
    privacyApi,
    type CreateDisclosureBody,
    type DisclosureResponse
} from '$lib/api/privacyApi';

const PAGE_SIZE = 5;

let _patientCode = $state<string | null>(null);
let _items       = $state<DisclosureResponse[]>([]);
let _page        = $state(1);
let _totalPages  = $state(0);
let _totalCount  = $state(0);
let _loading     = $state(false);
let _error       = $state<string | null>(null);
let _submitting  = $state(false);
let _submitError = $state<string | null>(null);

async function fetchPage(patientCode: string, page: number): Promise<void> {
    _loading = true;
    _error   = null;
    try {
        const res = await privacyApi.getDisclosures(patientCode, page, PAGE_SIZE);
        // Ignore a response that arrives after the user moved to another patient.
        if (patientCode !== _patientCode) return;
        _items      = res.items;
        _page       = res.page;
        _totalPages = res.totalPages;
        _totalCount = res.totalCount;
    } catch (err) {
        if (patientCode === _patientCode) {
            _error = err instanceof Error ? err.message : 'Error al cargar las divulgaciones.';
        }
    } finally {
        _loading = false;
    }
}

export const disclosures = {
    get items():       DisclosureResponse[] { return _items; },
    get page():        number               { return _page; },
    get pageSize():    number               { return PAGE_SIZE; },
    get totalPages():  number               { return _totalPages; },
    get totalCount():  number               { return _totalCount; },
    get loading():     boolean              { return _loading; },
    get error():       string | null        { return _error; },
    get submitting():  boolean              { return _submitting; },
    get submitError(): string | null        { return _submitError; },

    load(patientCode: string, page = 1): Promise<void> {
        if (patientCode !== _patientCode) {
            _patientCode = patientCode;
            _items       = [];
            _totalCount  = 0;
            _totalPages  = 0;
        }
        return fetchPage(patientCode, page);
    },

    /** Returns true when the disclosure was recorded; the list goes back to page 1 (newest first). */
    async record(body: CreateDisclosureBody): Promise<boolean> {
        if (!_patientCode) return false;
        const patientCode = _patientCode;
        _submitting  = true;
        _submitError = null;
        try {
            await privacyApi.createDisclosure(patientCode, body);
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al registrar la divulgación.';
            _submitting  = false;
            return false;
        }
        _submitting = false;
        await fetchPage(patientCode, 1);
        return true;
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
