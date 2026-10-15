// src/lib/api/privacyApi.ts
// HIPAA patient rights: amendment requests (164.526), accounting of disclosures (164.528) and
// restrictions / confidential communications (164.522), Notice of Privacy Practices (164.520) and consents
// / authorizations (164.508).

import { api } from './api';

export type AmendmentStatus = 'Pendiente' | 'Aceptada' | 'Denegada';

export interface AmendmentResponse {
    amendmentRequestCode: string;
    patientCode: string;
    patientName: string;
    medicalRecordNumber: string;
    targetArea: string;
    requestedChange: string;
    status: AmendmentStatus;
    requestedAt: string;
    reviewedByName: string | null;
    reviewedAt: string | null;
    decisionReason: string | null;
    amendmentText: string | null;
}

export interface AmendmentPageResponse {
    items: AmendmentResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface DecideAmendmentBody {
    Accepted: boolean;
    Reason: string;
    AmendmentText: string | null;
}

export interface DisclosureResponse {
    disclosureCode: string;
    patientCode: string;
    disclosedAt: string;
    recipientName: string;
    recipientType: string;
    purpose: string;
    description: string;
    recordedByName: string;
    recordedAt: string;
}

export interface DisclosurePageResponse {
    items: DisclosureResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateDisclosureBody {
    DisclosedAt: string;
    RecipientName: string;
    RecipientType: string;
    Purpose: string;
    Description: string;
}

export interface CommunicationPreferenceResponse {
    patientCode: string;
    allowEmail: boolean;
    allowSms: boolean;
    alternativeEmail: string | null;
    alternativePhone: string | null;
    updatedAt: string | null;
}

export interface UpdateCommunicationPreferenceBody {
    AllowEmail: boolean;
    AllowSms: boolean;
    AlternativeEmail: string | null;
    AlternativePhone: string | null;
}

export interface PrivacyNoticeResponse {
    privacyNoticeCode: string;
    version: number;
    title: string;
    body: string;
    effectiveFrom: string;
    publishedAt: string;
}

export interface PrivacyNoticePageResponse {
    items: PrivacyNoticeResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PublishPrivacyNoticeBody {
    Title: string;
    Body: string;
    EffectiveFrom: string;
}

export interface PrivacyNoticeAcknowledgmentResponse {
    privacyNoticeCode: string;
    version: number;
    title: string;
    acknowledgedAt: string;
    recordedByName: string | null;
}

export interface PatientPrivacyNoticeStatusResponse {
    current: PrivacyNoticeResponse | null;
    currentAcknowledged: boolean;
    acknowledgments: PrivacyNoticeAcknowledgmentResponse[];
}

export interface ConsentResponse {
    consentCode: string;
    patientCode: string;
    consentType: string;
    description: string;
    grantedAt: string;
    recordedByName: string;
    recordedAt: string;
    revokedAt: string | null;
    revokedByName: string | null;
    revokedReason: string | null;
}

export interface ConsentPageResponse {
    items: ConsentResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateConsentBody {
    ConsentType: string;
    Description: string;
    GrantedAt: string;
}

export const privacyApi = {
    getAmendments(status: AmendmentStatus | null, page: number, pageSize: number): Promise<AmendmentPageResponse> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (status) params.set('status', status);
        return api.get<AmendmentPageResponse>(`/api/amendment-requests?${params}`);
    },

    decideAmendment(code: string, body: DecideAmendmentBody): Promise<AmendmentResponse> {
        return api.post<AmendmentResponse>(`/api/amendment-requests/${code}/decision`, body);
    },

    getDisclosures(patientCode: string, page: number, pageSize: number): Promise<DisclosurePageResponse> {
        return api.get<DisclosurePageResponse>(
            `/api/patient/${patientCode}/disclosures?page=${page}&pageSize=${pageSize}`
        );
    },

    createDisclosure(patientCode: string, body: CreateDisclosureBody): Promise<DisclosureResponse> {
        return api.post<DisclosureResponse>(`/api/patient/${patientCode}/disclosures`, body);
    },

    getCommunicationPreferences(patientCode: string): Promise<CommunicationPreferenceResponse> {
        return api.get<CommunicationPreferenceResponse>(`/api/patient/${patientCode}/communication-preferences`);
    },

    updateCommunicationPreferences(
        patientCode: string,
        body: UpdateCommunicationPreferenceBody
    ): Promise<CommunicationPreferenceResponse> {
        return api.put<CommunicationPreferenceResponse>(
            `/api/patient/${patientCode}/communication-preferences`,
            body
        );
    },

    getPrivacyNoticeVersions(page: number, pageSize: number): Promise<PrivacyNoticePageResponse> {
        return api.get<PrivacyNoticePageResponse>(`/api/privacy-notice?page=${page}&pageSize=${pageSize}`);
    },

    publishPrivacyNotice(body: PublishPrivacyNoticeBody): Promise<PrivacyNoticeResponse> {
        return api.post<PrivacyNoticeResponse>('/api/privacy-notice', body);
    },

    getPatientPrivacyNotice(patientCode: string): Promise<PatientPrivacyNoticeStatusResponse> {
        return api.get<PatientPrivacyNoticeStatusResponse>(`/api/patient/${patientCode}/privacy-notice`);
    },

    acknowledgePrivacyNotice(patientCode: string): Promise<PatientPrivacyNoticeStatusResponse> {
        return api.post<PatientPrivacyNoticeStatusResponse>(
            `/api/patient/${patientCode}/privacy-notice/acknowledgment`,
            {}
        );
    },

    getConsents(patientCode: string, page: number, pageSize: number): Promise<ConsentPageResponse> {
        return api.get<ConsentPageResponse>(`/api/patient/${patientCode}/consents?page=${page}&pageSize=${pageSize}`);
    },

    createConsent(patientCode: string, body: CreateConsentBody): Promise<ConsentResponse> {
        return api.post<ConsentResponse>(`/api/patient/${patientCode}/consents`, body);
    },

    revokeConsent(patientCode: string, consentCode: string, reason: string): Promise<ConsentResponse> {
        return api.post<ConsentResponse>(`/api/patient/${patientCode}/consents/${consentCode}/revoke`, {
            Reason: reason
        });
    }
};
