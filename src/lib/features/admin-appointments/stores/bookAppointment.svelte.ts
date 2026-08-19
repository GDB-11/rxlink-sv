// src/lib/features/admin-appointments/stores/bookAppointment.svelte.ts

import { appointmentApi, type AppointmentResponse } from '$lib/api/appointmentApi';
import {
    lookupsApi,
    type GuidLookupItemResponse,
    type InsuranceLookupItemResponse,
    type SpecialtyPricingLookupItemResponse
} from '$lib/api/lookupsApi';
import type { PatientResponse } from '$lib/api/patientApi';
import type { AvailabilityResponse } from '$lib/api/availabilityApi';

type PaymentMode = 'insurance' | 'particular' | 'later';

let _step                         = $state<1 | 2 | 3>(1);
let _selectedPatient              = $state<PatientResponse | null>(null);
let _selectedDoctorCode           = $state('');
let _selectedDoctorName           = $state('');
let _selectedDoctorSpecialtyCode  = $state<string | null>(null);
let _selectedSlot                 = $state<AvailabilityResponse | null>(null);
let _consultationTypes            = $state<GuidLookupItemResponse[]>([]);
let _selectedConsultationTypeCode = $state('');
let _insurances                   = $state<InsuranceLookupItemResponse[]>([]);
let _specialtyPricing             = $state<SpecialtyPricingLookupItemResponse[]>([]);
let _paymentMode                  = $state<PaymentMode>('later');
let _selectedInsuranceCode        = $state<string | null>(null);
let _submitting                   = $state(false);
let _error                        = $state<string | null>(null);

export const bookAppointment = {
    get step()                         { return _step; },
    get selectedPatient()              { return _selectedPatient; },
    get selectedDoctorCode()           { return _selectedDoctorCode; },
    get selectedDoctorName()           { return _selectedDoctorName; },
    get selectedSlot()                 { return _selectedSlot; },
    get consultationTypes()            { return _consultationTypes; },
    get selectedConsultationTypeCode() { return _selectedConsultationTypeCode; },
    get insurances()                   { return _insurances; },
    get paymentMode()                  { return _paymentMode; },
    set paymentMode(value: PaymentMode) { _paymentMode = value; },
    get selectedInsuranceCode()        { return _selectedInsuranceCode; },
    set selectedInsuranceCode(value: string | null) { _selectedInsuranceCode = value; },
    get submitting()                   { return _submitting; },
    get error()                        { return _error; },

    get basePrice(): number | null {
        if (!_selectedDoctorSpecialtyCode || !_selectedConsultationTypeCode) return null;
        const pricing = _specialtyPricing.find(s => s.code === _selectedDoctorSpecialtyCode);
        if (!pricing) return null;
        const consultationType = _consultationTypes.find(
            ct => ct.code === _selectedConsultationTypeCode
        );
        return consultationType?.name === 'Presencial' ? pricing.priceInPerson : pricing.priceVirtual;
    },

    async init(): Promise<void> {
        try {
            const data = await lookupsApi.getAppointmentLookups();
            _consultationTypes = data.consultationTypes;
            _insurances = data.insurances;
            _specialtyPricing = data.specialties;
            if (_consultationTypes.length > 0) {
                _selectedConsultationTypeCode = _consultationTypes[0].code;
            }
        } catch {
            // non-fatal — form will show empty select
        }
    },

    selectPatient(patient: PatientResponse): void {
        _selectedPatient = patient;
        _step = 2;
    },

    selectDoctor(code: string, name: string, specialtyCode: string | null = null): void {
        _selectedDoctorCode = code;
        _selectedDoctorName = name;
        _selectedDoctorSpecialtyCode = specialtyCode;
    },

    selectSlot(slot: AvailabilityResponse): void {
        _selectedSlot = slot;
        _step = 3;
    },

    setConsultationType(code: string): void {
        _selectedConsultationTypeCode = code;
    },

    goBack(): void {
        if (_step === 3) { _step = 2; return; }
        if (_step === 2) { _selectedPatient = null; _step = 1; }
    },

    async submit(): Promise<AppointmentResponse | null> {
        if (!_selectedPatient || !_selectedSlot || !_selectedConsultationTypeCode) return null;
        _submitting = true;
        _error      = null;
        try {
            const result = await appointmentApi.adminCreate({
                patientCode:          _selectedPatient.patientCode,
                availabilityCode:     _selectedSlot.availabilityCode,
                consultationTypeCode: _selectedConsultationTypeCode,
                payNow:               _paymentMode !== 'later',
                insuranceCode:        _paymentMode === 'insurance' ? _selectedInsuranceCode : null
            });
            return result;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al registrar la cita.';
            return null;
        } finally {
            _submitting = false;
        }
    },

    reset(): void {
        _step                         = 1;
        _selectedPatient              = null;
        _selectedDoctorCode           = '';
        _selectedDoctorName           = '';
        _selectedDoctorSpecialtyCode  = null;
        _selectedSlot                 = null;
        _selectedConsultationTypeCode = _consultationTypes[0]?.code ?? '';
        _paymentMode                  = 'later';
        _selectedInsuranceCode        = null;
        _submitting                   = false;
        _error                        = null;
    }
};
