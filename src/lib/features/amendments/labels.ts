// src/lib/features/amendments/labels.ts

export const TARGET_AREA_LABELS: Record<string, string> = {
    Profile: 'Datos personales',
    Allergies: 'Alergias',
    Diagnostics: 'Diagnósticos',
    Prescriptions: 'Recetas',
    Appointments: 'Citas',
    Other: 'Otro'
};

export function targetAreaLabel(area: string): string {
    return TARGET_AREA_LABELS[area] ?? area;
}
