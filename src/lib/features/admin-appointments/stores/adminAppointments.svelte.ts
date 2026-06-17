// src/lib/features/admin-appointments/stores/adminAppointments.svelte.ts

import { appointmentApi, type AppointmentResponse } from '$lib/api/appointmentApi';

let _items         = $state<AppointmentResponse[]>([]);
let _total         = $state(0);
let _page          = $state(1);
let _pageSize      = $state(10);
let _patientSearch = $state('');
let _date          = $state('');
let _statusName    = $state('');
let _loading       = $state(false);
let _error         = $state<string | null>(null);

export const adminAppointments = {
    get items()         { return _items; },
    get total()         { return _total; },
    get page()          { return _page; },
    get pageSize()      { return _pageSize; },
    get patientSearch() { return _patientSearch; },
    get date()          { return _date; },
    get statusName()    { return _statusName; },
    get loading()       { return _loading; },
    get error()         { return _error; },
    get totalPages()    { return Math.max(1, Math.ceil(_total / _pageSize)); },

    async load(): Promise<void> {
        _loading = true;
        _error   = null;
        try {
            const data = await appointmentApi.getAdminAppointments({
                page:          _page,
                pageSize:      _pageSize,
                patientSearch: _patientSearch || undefined,
                date:          _date || undefined,
                statusName:    _statusName || undefined
            });
            _items = data.items;
            _total = data.total;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar las citas.';
        } finally {
            _loading = false;
        }
    },

    async setPage(p: number): Promise<void> {
        _page = p;
        await this.load();
    },

    async setFilters(patientSearch: string, date: string, statusName: string): Promise<void> {
        _page          = 1;
        _patientSearch = patientSearch;
        _date          = date;
        _statusName    = statusName;
        await this.load();
    },

    reset(): void {
        _items         = [];
        _total         = 0;
        _page          = 1;
        _patientSearch = '';
        _date          = '';
        _statusName    = '';
        _loading       = false;
        _error         = null;
    }
};
