// src/lib/api/availabilityApi.ts

import { api } from './api';

export interface AvailabilityResponse {
    availabilityCode: string;
    date:             string;   // "YYYY-MM-DD"
    startTime:        string;   // "HH:MM"
    isBooked:         boolean;
    canDelete:        boolean;
}

export interface SlotEntry {
    date:      string;   // "YYYY-MM-DD"
    startTime: string;   // "HH:MM"
}

export interface CreateAvailabilityRequest {
    slots: SlotEntry[];
}

export const availabilityApi = {
    getSlots(doctorCode: string, month: string): Promise<AvailabilityResponse[]> {
        return api.get<AvailabilityResponse[]>(`/api/doctor/${doctorCode}/availability?month=${month}`);
    },

    createSlots(doctorCode: string, body: CreateAvailabilityRequest): Promise<AvailabilityResponse[]> {
        return api.post<AvailabilityResponse[]>(`/api/doctor/${doctorCode}/availability`, body);
    },

    deleteSlot(availabilityCode: string): Promise<void> {
        return api.delete<void>(`/api/availability/${availabilityCode}`);
    }
};
