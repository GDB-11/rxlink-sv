// src/lib/features/nurse/stores/nurse.svelte.ts

import { patientApi, type PatientResponse } from '$lib/api/patientApi';

let _results    = $state<PatientResponse[]>([]);
let _search     = $state('');
let _page       = $state(1);
let _pageSize   = $state(20);
let _totalPages = $state(0);
let _totalCount = $state(0);
let _loading    = $state(false);
let _error      = $state<string | null>(null);

export const nurse = {
    get results():    PatientResponse[] { return _results; },
    get search():     string            { return _search; },
    get page():       number            { return _page; },
    get pageSize():   number            { return _pageSize; },
    get totalPages(): number            { return _totalPages; },
    get totalCount(): number            { return _totalCount; },
    get loading():    boolean           { return _loading; },
    get error():      string | null     { return _error; },

    async searchPatients(query: string): Promise<void> {
        _search = query;
        _page   = 1;

        if (!query.trim()) {
            _results    = [];
            _totalCount = 0;
            _totalPages = 0;
            return;
        }

        _loading = true;
        _error   = null;
        try {
            const data  = await patientApi.getPage(1, _pageSize, query);
            _results    = data.items;
            _totalCount = data.totalCount;
            _totalPages = data.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al buscar pacientes.';
        } finally {
            _loading = false;
        }
    },

    async setPage(p: number): Promise<void> {
        _page    = p;
        _loading = true;
        _error   = null;
        try {
            const data  = await patientApi.getPage(p, _pageSize, _search);
            _results    = data.items;
            _totalCount = data.totalCount;
            _totalPages = data.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar pacientes.';
        } finally {
            _loading = false;
        }
    },

    reset(): void {
        _results    = [];
        _search     = '';
        _page       = 1;
        _totalPages = 0;
        _totalCount = 0;
        _loading    = false;
        _error      = null;
    }
};
