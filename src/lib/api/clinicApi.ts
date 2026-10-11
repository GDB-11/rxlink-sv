// src/lib/api/clinicApi.ts

import { api } from './api';

export interface ClinicResponse {
    clinicCode: string;
    name: string;
    address: string | null;
    district: string | null;
    province: string | null;
    department: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    facilityRegistrationCode: string | null;
    updatedAt: string;
}

/** Operational fields only: identity (name, logo) is owned by the partner registry. */
export interface ClinicRequestBody {
    Address: string | null;
    District: string | null;
    Province: string | null;
    Department: string | null;
    Phone: string | null;
    Email: string | null;
    Website: string | null;
    FacilityRegistrationCode: string | null;
}

export const clinicApi = {
    get(): Promise<ClinicResponse> {
        return api.get<ClinicResponse>('/api/partner/clinic');
    },

    update(body: ClinicRequestBody): Promise<ClinicResponse> {
        return api.put<ClinicResponse>('/api/partner/clinic', body);
    }
};
