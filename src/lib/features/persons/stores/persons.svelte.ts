// src/lib/features/persons/stores/persons.svelte.ts

import { personApi, type PersonResponse, type PersonRequestBody } from '$lib/api/personApi';
import { lookupsApi, type GuidLookupItemResponse } from '$lib/api/lookupsApi';

export interface PersonLookups {
    sexes: GuidLookupItemResponse[];
    documentTypes: GuidLookupItemResponse[];
}

let _items       = $state<PersonResponse[]>([]);
let _totalCount  = $state(0);
let _page        = $state(1);
let _pageSize    = $state(20);
let _totalPages  = $state(0);
let _search      = $state('');
let _loading     = $state(false);
let _error       = $state<string | null>(null);
let _submitting  = $state(false);
let _submitError = $state<string | null>(null);

let _lookups: PersonLookups = $state({ sexes: [], documentTypes: [] });
let _lookupsLoaded = false;

export const persons = {
    get items()       { return _items; },
    get totalCount()  { return _totalCount; },
    get page()        { return _page; },
    get pageSize()    { return _pageSize; },
    get totalPages()  { return _totalPages; },
    get search()      { return _search; },
    get loading()     { return _loading; },
    get error()       { return _error; },
    get submitting()  { return _submitting; },
    get submitError() { return _submitError; },
    get lookups()     { return _lookups; },

    async loadPage(): Promise<void> {
        _loading = true;
        _error   = null;

        const lookupsPromise = _lookupsLoaded ? Promise.resolve() : this._loadLookups();

        try {
            const [pageData] = await Promise.all([
                personApi.getPage(_page, _pageSize, _search || undefined),
                lookupsPromise
            ]);
            _items      = pageData.items;
            _totalCount = pageData.totalCount;
            _totalPages = pageData.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar personas.';
        } finally {
            _loading = false;
        }
    },

    async _loadLookups(): Promise<void> {
        try {
            const data = await lookupsApi.getUserLookups();
            _lookups = { sexes: data.sexes, documentTypes: data.documentTypes };
            _lookupsLoaded = true;
        } catch {
            // Non-fatal: form will show empty select if this fails
        }
    },

    async setSearch(value: string): Promise<void> {
        _search = value;
        _page   = 1;
        await this.loadPage();
    },

    async setPage(p: number): Promise<void> {
        _page = p;
        await this.loadPage();
    },

    async create(body: PersonRequestBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await personApi.create(body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al crear persona.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async update(code: string, body: PersonRequestBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await personApi.update(code, body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al actualizar persona.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
