// src/lib/api/appointmentApi.ts

import { api } from './api';

export interface AppointmentResponse {
    appointmentCode: string;
    patientCode: string;
    patientNames: string;
    patientSurnames: string;
    doctorCode: string;
    doctorNames: string;
    doctorSurnames: string;
    specialtyName: string;
    consultationTypeName: string;
    statusName: string;
    statusCode: string;
    scheduledAt: string;
    date: string;
    time: string;
    createdAt: string;
    insuranceName: string | null;
    coveragePercentage: number | null;
    baseAmount: number | null;
    patientAmount: number | null;
}

export interface AppointmentPageResponse {
    items: AppointmentResponse[];
    total: number;
    page: number;
    pageSize: number;
}

export interface DoctorAppointmentPageParams {
    page?: number;
    pageSize?: number;
    date?: string;
    statusName?: string;
}

export const appointmentApi = {
    getDoctorAppointments(params: DoctorAppointmentPageParams = {}): Promise<AppointmentPageResponse> {
        const p = new URLSearchParams();
        if (params.page)       p.set('page',       String(params.page));
        if (params.pageSize)   p.set('pageSize',   String(params.pageSize));
        if (params.date)       p.set('date',       params.date);
        if (params.statusName) p.set('statusName', params.statusName);
        const qs = p.toString();
        return api.get<AppointmentPageResponse>(`/api/doctor/appointments${qs ? `?${qs}` : ''}`);
    },

    getAppointment(code: string): Promise<AppointmentResponse> {
        return api.get<AppointmentResponse>(`/api/appointment/${code}`);
    },

    completeAppointment(code: string): Promise<void> {
        return api.patch<void>(`/api/appointment/${code}/complete`, {});
    },

    noShow(code: string): Promise<void> {
        return api.patch<void>(`/api/appointment/${code}/no-show`, {});
    },

    adminCreate(body: {
        patientCode: string;
        availabilityCode: string;
        consultationTypeCode: string;
        payNow: boolean;
        insuranceCode: string | null;
    }): Promise<AppointmentResponse> {
        return api.post<AppointmentResponse>('/api/admin/appointment', {
            PatientCode: body.patientCode,
            AvailabilityCode: body.availabilityCode,
            ConsultationTypeCode: body.consultationTypeCode,
            PayNow: body.payNow,
            InsuranceCode: body.insuranceCode
        });
    },

    adminConfirmPayment(code: string, insuranceCode: string | null): Promise<void> {
        return api.patch<void>(`/api/appointment/${code}/admin-confirm-payment`, {
            InsuranceCode: insuranceCode
        });
    },

    adminRevertPayment(code: string): Promise<void> {
        return api.patch<void>(`/api/appointment/${code}/admin-revert-payment`, {});
    },

    getAdminAppointments(params: {
        page?: number;
        pageSize?: number;
        patientSearch?: string;
        date?: string;
        statusName?: string;
    }): Promise<AppointmentPageResponse> {
        const p = new URLSearchParams({ page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 10) });
        if (params.patientSearch?.trim()) p.set('patientSearch', params.patientSearch.trim());
        if (params.date) p.set('date', params.date);
        if (params.statusName) p.set('statusName', params.statusName);
        return api.get<AppointmentPageResponse>(`/api/admin/appointments?${p}`);
    },
};
