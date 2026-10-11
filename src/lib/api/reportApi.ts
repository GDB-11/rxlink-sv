// src/lib/api/reportApi.ts

import { api } from './api';

export interface ActivityByUserItem {
    userCode: string | null;
    username: string | null;
    eventType: string;
    eventCount: number;
    lastOccurredAt: string;
}

export interface UnattributedWriteItem {
    tableName: string;
    action: string;
    writeCount: number;
    lastOccurredAt: string;
}

export interface BreakGlassItem {
    grantCode: string;
    userCode: string;
    username: string;
    patientCode: string;
    medicalRecordNumber: string;
    reason: string;
    grantedAt: string;
    expiresAt: string;
}

/** All reports take an inclusive UTC day range (max 366 days); Administrador only. */
function range(from: string, to: string): string {
    return `?from=${from}&to=${to}`;
}

export const reportApi = {
    /** GET /api/report/activity-by-user */
    activityByUser(from: string, to: string): Promise<ActivityByUserItem[]> {
        return api.get<ActivityByUserItem[]>(`/api/report/activity-by-user${range(from, to)}`);
    },

    /** GET /api/report/unattributed-writes */
    unattributedWrites(from: string, to: string): Promise<UnattributedWriteItem[]> {
        return api.get<UnattributedWriteItem[]>(`/api/report/unattributed-writes${range(from, to)}`);
    },

    /** GET /api/report/break-glass */
    breakGlass(from: string, to: string): Promise<BreakGlassItem[]> {
        return api.get<BreakGlassItem[]>(`/api/report/break-glass${range(from, to)}`);
    }
};
