// src/lib/api/partnerApi.ts

import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { api } from './api';

/** Unauthenticated, PHI-free identity of this deployment (owned by the partner registry). */
export interface PublicPartnerConfigResponse {
    partnerCode: string;
    slug: string;
    displayName: string;
    /** Relative URL carrying the logo hash as `v`; null when no logo was uploaded. */
    logoUrl: string | null;
    brandPrimaryColor: string | null;
    brandAccentColor: string | null;
    country: string;
    timezone: string;
    currency: string;
    locale: string;
    clinicName: string | null;
}

export const partnerApi = {
    getPublicConfig(): Promise<PublicPartnerConfigResponse> {
        return api.get<PublicPartnerConfigResponse>('/api/partner/config/public');
    },

    /** The API returns a relative logo path; the image is served by the API, not by this app. */
    resolveLogoUrl(logoUrl: string | null): string | null {
        return logoUrl ? `${PUBLIC_API_BASE_URL}${logoUrl}` : null;
    }
};
