// src/lib/features/profile/stores/profile.svelte.ts

import { profileApi, type UserResponse } from '$lib/api/profileApi';

let _data          = $state<UserResponse | null>(null);
let _loading       = $state(false);
let _error         = $state<string | null>(null);
let _submitting    = $state(false);
let _submitError   = $state<string | null>(null);
let _submitSuccess = $state(false);

export const profile = {
    get data():          UserResponse | null { return _data; },
    get loading():       boolean             { return _loading; },
    get error():         string | null       { return _error; },
    get submitting():    boolean             { return _submitting; },
    get submitError():   string | null       { return _submitError; },
    get submitSuccess(): boolean             { return _submitSuccess; },

    async load(): Promise<void> {
        if (_loading) return;
        _loading = true;
        _error   = null;
        try {
            _data = await profileApi.getMyProfile();
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar el perfil.';
        } finally {
            _loading = false;
        }
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
        _submitting    = true;
        _submitError   = null;
        _submitSuccess = false;
        try {
            await profileApi.changePassword({
                CurrentPassword: currentPassword,
                NewPassword: newPassword
            });
            _submitSuccess = true;
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al cambiar la contraseña.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    resetSubmit(): void {
        _submitError   = null;
        _submitSuccess = false;
    }
};
