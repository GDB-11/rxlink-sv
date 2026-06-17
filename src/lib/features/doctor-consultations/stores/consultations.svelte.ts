// src/lib/features/doctor-consultations/stores/consultations.svelte.ts

import { appointmentApi, type AppointmentResponse } from '$lib/api/appointmentApi';

let _items    = $state<AppointmentResponse[]>([]);
let _total    = $state(0);
let _page     = $state(1);
let _pageSize = $state(10);
let _date     = $state<string | null>(null);
let _status   = $state<string | null>(null);
let _loading  = $state(false);
let _error    = $state<string | null>(null);

export const consultations = {
    get items()    { return _items; },
    get total()    { return _total; },
    get page()     { return _page; },
    get pageSize() { return _pageSize; },
    get date()     { return _date; },
    get status()   { return _status; },
    get loading()  { return _loading; },
    get error()    { return _error; },
    get totalPages() { return Math.max(1, Math.ceil(_total / _pageSize)); },

    async load(): Promise<void> {
        _loading = true;
        _error   = null;
        try {
            const data = await appointmentApi.getDoctorAppointments({
                page:       _page,
                pageSize:   _pageSize,
                date:       _date ?? undefined,
                statusName: _status ?? undefined
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

    async setFilters(date: string | null, status: string | null): Promise<void> {
        _page   = 1;
        _date   = date;
        _status = status;
        await this.load();
    },

    reset(): void {
        _items    = [];
        _total    = 0;
        _page     = 1;
        _date     = null;
        _status   = null;
        _loading  = false;
        _error    = null;
    }
};
