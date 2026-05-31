// src/lib/api/personApi.ts

import { api } from './api';

export interface PersonResponse {
    personCode: string;
    names: string;
    surnames: string;
    birthDate: string;
    sexCode: string;
    sexName: string;
    phone: string;
    alternativePhone: string | null;
    email: string;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    documentTypeCode: string | null;
    documentTypeName: string | null;
    documentNumber: string | null;
}

export interface PersonPageResponse {
    items: PersonResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PersonRequestBody {
    Names: string;
    Surnames: string;
    BirthDate: string;
    SexCode: string;
    Phone: string;
    AlternativePhone?: string | null;
    Email: string;
    Address?: string | null;
    EmergencyContactName?: string | null;
    EmergencyContactPhone?: string | null;
    DocumentTypeCode: string;
    DocumentNumber: string;
}

export const personApi = {
    getPage(page: number, pageSize: number, search?: string): Promise<PersonPageResponse> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize)
        });
        if (search?.trim()) params.set('search', search.trim());
        return api.get<PersonPageResponse>(`/api/person?${params}`);
    },

    create(body: PersonRequestBody): Promise<PersonResponse> {
        return api.post<PersonResponse>('/api/person', body);
    },

    update(code: string, body: PersonRequestBody): Promise<PersonResponse> {
        return api.put<PersonResponse>(`/api/person/${code}`, body);
    }
};
