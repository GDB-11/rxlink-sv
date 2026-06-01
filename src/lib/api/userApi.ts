// src/lib/api/userApi.ts

import { api } from './api';

export interface UserResponse {
    userCode: string;
    personCode: string;
    // Person (read-only — managed via /personas)
    names: string;
    surnames: string;
    birthDate: string;
    sexCode: string;
    sexName: string;
    phone: string;
    alternativePhone: string | null;
    personEmail: string;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    documentTypeCode: string | null;
    documentTypeName: string | null;
    documentNumber: string | null;
    documentIssueDate: string | null;
    documentExpirationDate: string | null;
    // Account
    roleCode: string;
    roleName: string;
    specialtyCode: string | null;
    specialtyName: string | null;
    username: string;
    email: string;
    licenseNumber: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface UserPageResponse {
    items: UserResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateUserBody {
    PersonCode: string;
    RoleName: string;
    SpecialtyCode?: string | null;
    Username: string;
    Email: string;
    Password: string;
    LicenseNumber?: string | null;
}

export interface UpdateUserBody {
    RoleName: string;
    SpecialtyCode?: string | null;
    Username: string;
    Email: string;
    LicenseNumber?: string | null;
}

export const userApi = {
    getPage(page: number, pageSize: number, search?: string): Promise<UserPageResponse> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize)
        });
        if (search?.trim()) params.set('search', search.trim());
        return api.get<UserPageResponse>(`/api/user?${params}`);
    },

    create(body: CreateUserBody): Promise<UserResponse> {
        return api.post<UserResponse>('/api/user', body);
    },

    update(code: string, body: UpdateUserBody): Promise<UserResponse> {
        return api.put<UserResponse>(`/api/user/${code}`, body);
    },

    deactivate(code: string): Promise<void> {
        return api.patch<void>(`/api/user/${code}/deactivate`, {});
    },

    activate(code: string): Promise<void> {
        return api.patch<void>(`/api/user/${code}/activate`, {});
    }
};
