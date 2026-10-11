// src/lib/features/reports/reportDefinitions.ts

import { reportApi } from '$lib/api/reportApi';

export type ReportKind = 'activity' | 'unattributed' | 'breakGlass';

export interface ReportColumn {
    key: string;
    label: string;
    /** 'datetime' values are ISO strings rendered in the browser's locale. */
    type?: 'text' | 'number' | 'datetime';
}

export interface ReportDefinition {
    kind: ReportKind;
    label: string;
    description: string;
    columns: ReportColumn[];
    fetch: (from: string, to: string) => Promise<object[]>;
}

export const reportDefinitions: ReportDefinition[] = [
    {
        kind: 'activity',
        label: 'Actividad por usuario',
        description: 'Eventos por usuario y tipo, incluido el registro de accesos a historias clínicas (Record.Accessed).',
        columns: [
            { key: 'username',       label: 'Usuario' },
            { key: 'eventType',      label: 'Evento' },
            { key: 'eventCount',     label: 'Cantidad', type: 'number' },
            { key: 'lastOccurredAt', label: 'Último', type: 'datetime' }
        ],
        fetch: reportApi.activityByUser
    },
    {
        kind: 'unattributed',
        label: 'Escrituras sin actor',
        description: 'Escrituras auditadas sin usuario: señal de una ruta de escritura que omitió el contexto de auditoría.',
        columns: [
            { key: 'tableName',      label: 'Tabla' },
            { key: 'action',         label: 'Acción' },
            { key: 'writeCount',     label: 'Cantidad', type: 'number' },
            { key: 'lastOccurredAt', label: 'Última', type: 'datetime' }
        ],
        fetch: reportApi.unattributedWrites
    },
    {
        kind: 'breakGlass',
        label: 'Accesos de emergencia',
        description: 'Accesos break-glass: quién abrió qué paciente fuera de su equipo de cuidado, por qué y hasta cuándo.',
        columns: [
            { key: 'grantedAt',           label: 'Fecha', type: 'datetime' },
            { key: 'username',            label: 'Enfermero' },
            { key: 'medicalRecordNumber', label: 'Historia clínica' },
            { key: 'reason',              label: 'Motivo' },
            { key: 'expiresAt',           label: 'Vence', type: 'datetime' }
        ],
        fetch: reportApi.breakGlass
    }
];
