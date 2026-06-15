// src/lib/features/doctor-availability/stores/availability.svelte.ts

import { userApi, type UserResponse } from '$lib/api/userApi';
import { availabilityApi, type AvailabilityResponse, type CreateAvailabilityRequest } from '$lib/api/availabilityApi';

let _doctor      = $state<UserResponse | null>(null);
let _slots       = $state<AvailabilityResponse[]>([]);
let _month       = $state<string>('');
let _loading     = $state(false);
let _error       = $state<string | null>(null);
let _submitting  = $state(false);
let _submitError = $state<string | null>(null);

let _doctorCode  = '';

export const availability = {
    get doctor():      UserResponse | null    { return _doctor; },
    get slots():       AvailabilityResponse[] { return _slots; },
    get month():       string                 { return _month; },
    get loading():     boolean                { return _loading; },
    get error():       string | null          { return _error; },
    get submitting():  boolean                { return _submitting; },
    get submitError(): string | null          { return _submitError; },

    async load(doctorCode: string, month?: string): Promise<void> {
        _doctorCode = doctorCode;
        _month      = month ?? new Date().toISOString().slice(0, 7);
        _loading    = true;
        _error      = null;
        try {
            const [doctor, slots] = await Promise.all([
                userApi.getByCode(doctorCode),
                availabilityApi.getSlots(doctorCode, _month)
            ]);
            _doctor = doctor;
            _slots  = slots;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar la disponibilidad.';
        } finally {
            _loading = false;
        }
    },

    async setMonth(month: string): Promise<void> {
        _month   = month;
        _loading = true;
        _error   = null;
        try {
            _slots = await availabilityApi.getSlots(_doctorCode, month);
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar los slots.';
        } finally {
            _loading = false;
        }
    },

    async addSlots(body: CreateAvailabilityRequest): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await availabilityApi.createSlots(_doctorCode, body);
            _slots = await availabilityApi.getSlots(_doctorCode, _month);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al crear los slots.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async removeSlot(availabilityCode: string): Promise<boolean> {
        const idx  = _slots.findIndex(s => s.availabilityCode === availabilityCode);
        const slot = _slots[idx];
        if (!slot) return false;

        _slots = _slots.filter(s => s.availabilityCode !== availabilityCode);
        try {
            await availabilityApi.deleteSlot(availabilityCode);
            return true;
        } catch (err) {
            _slots = [..._slots.slice(0, idx), slot, ..._slots.slice(idx)];
            _submitError = err instanceof Error ? err.message : 'Error al eliminar el slot.';
            return false;
        }
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
