// src/lib/features/disclosures/labels.ts

export const RECIPIENT_TYPE_LABELS: Record<string, string> = {
    Authority: 'Autoridad',
    Court: 'Juzgado',
    PublicHealth: 'Salud pública',
    Insurer: 'Aseguradora',
    Family: 'Familiar',
    Researcher: 'Investigación',
    Other: 'Otro'
};

export function recipientTypeLabel(type: string): string {
    return RECIPIENT_TYPE_LABELS[type] ?? type;
}
