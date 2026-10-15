// src/lib/features/privacy-notice/stores/privacyNoticeVersions.svelte.ts
// Published versions of the partner's Notice of Privacy Practices (administrator page).

import {
    privacyApi,
    type PrivacyNoticeResponse,
    type PublishPrivacyNoticeBody
} from '$lib/api/privacyApi';

const PAGE_SIZE = 10;

let _items       = $state<PrivacyNoticeResponse[]>([]);
let _page        = $state(1);
let _totalPages  = $state(0);
let _totalCount  = $state(0);
let _loading     = $state(false);
let _error       = $state<string | null>(null);
let _submitting  = $state(false);
let _submitError = $state<string | null>(null);

async function fetchPage(page: number): Promise<void> {
    _loading = true;
    _error   = null;
    try {
        const res = await privacyApi.getPrivacyNoticeVersions(page, PAGE_SIZE);
        _items      = res.items;
        _page       = res.page;
        _totalPages = res.totalPages;
        _totalCount = res.totalCount;
    } catch (err) {
        _error = err instanceof Error ? err.message : 'Error al cargar los avisos de privacidad.';
    } finally {
        _loading = false;
    }
}

export const privacyNoticeVersions = {
    get items():       PrivacyNoticeResponse[] { return _items; },
    get page():        number                  { return _page; },
    get pageSize():    number                  { return PAGE_SIZE; },
    get totalPages():  number                  { return _totalPages; },
    get totalCount():  number                  { return _totalCount; },
    get loading():     boolean                 { return _loading; },
    get error():       string | null           { return _error; },
    get submitting():  boolean                 { return _submitting; },
    get submitError(): string | null           { return _submitError; },

    load(page = 1): Promise<void> {
        return fetchPage(page);
    },

    /** Returns true when the new version was published; the list goes back to page 1 (newest first). */
    async publish(body: PublishPrivacyNoticeBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await privacyApi.publishPrivacyNotice(body);
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al publicar el aviso de privacidad.';
            _submitting  = false;
            return false;
        }
        _submitting = false;
        await fetchPage(1);
        return true;
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
