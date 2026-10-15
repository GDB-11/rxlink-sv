// src/lib/features/amendments/stores/amendments.svelte.ts

import {
    privacyApi,
    type AmendmentResponse,
    type AmendmentStatus,
    type DecideAmendmentBody
} from '$lib/api/privacyApi';

const PAGE_SIZE = 10;

let _items         = $state<AmendmentResponse[]>([]);
let _status        = $state<AmendmentStatus | null>('Pendiente');
let _page          = $state(1);
let _totalPages    = $state(0);
let _totalCount    = $state(0);
let _loading       = $state(false);
let _error         = $state<string | null>(null);
let _submitting    = $state(false);
let _submitError   = $state<string | null>(null);

async function fetchPage(page: number): Promise<void> {
    _loading = true;
    _error   = null;
    try {
        const res = await privacyApi.getAmendments(_status, page, PAGE_SIZE);
        _items      = res.items;
        _page       = res.page;
        _totalPages = res.totalPages;
        _totalCount = res.totalCount;
    } catch (err) {
        _error = err instanceof Error ? err.message : 'Error al cargar las solicitudes de enmienda.';
    } finally {
        _loading = false;
    }
}

export const amendments = {
    get items():       AmendmentResponse[]       { return _items; },
    get status():      AmendmentStatus | null    { return _status; },
    get page():        number                    { return _page; },
    get pageSize():    number                    { return PAGE_SIZE; },
    get totalPages():  number                    { return _totalPages; },
    get totalCount():  number                    { return _totalCount; },
    get loading():     boolean                   { return _loading; },
    get error():       string | null             { return _error; },
    get submitting():  boolean                   { return _submitting; },
    get submitError(): string | null             { return _submitError; },

    load(page = 1): Promise<void> {
        return fetchPage(page);
    },

    setStatus(status: AmendmentStatus | null): Promise<void> {
        _status = status;
        return fetchPage(1);
    },

    /** Returns true when the decision was saved; the list is refreshed afterwards. */
    async decide(code: string, body: DecideAmendmentBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await privacyApi.decideAmendment(code, body);
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al registrar la decisión.';
            _submitting  = false;
            return false;
        }
        _submitting = false;
        await fetchPage(_page);
        return true;
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
