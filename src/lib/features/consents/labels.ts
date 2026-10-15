// src/lib/features/consents/labels.ts

export const CONSENT_TYPE_LABELS: Record<string, string> = {
    Research: 'Investigación',
    Marketing: 'Comunicaciones comerciales',
    ThirdPartySharing: 'Compartir con terceros',
    Other: 'Otro'
};

export function consentTypeLabel(type: string): string {
    return CONSENT_TYPE_LABELS[type] ?? type;
}
