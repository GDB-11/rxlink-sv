// src/lib/features/partner/stores/partner.svelte.ts

import { partnerApi, type PublicPartnerConfigResponse } from '$lib/api/partnerApi';

let _data    = $state<PublicPartnerConfigResponse | null>(null);
let _loading = $state(false);
let _failed  = $state(false);

export const partner = {
    get data():        PublicPartnerConfigResponse | null { return _data; },
    get loading():     boolean                            { return _loading; },
    get failed():      boolean                            { return _failed; },
    get displayName(): string | null                      { return _data?.displayName ?? null; },
    get logoSrc():     string | null                      { return partnerApi.resolveLogoUrl(_data?.logoUrl ?? null); },

    /** Loads once per page load; branding is decoration, so a failure just leaves the defaults. */
    async load(): Promise<void> {
        if (_data || _loading) return;
        _loading = true;
        _failed  = false;
        try {
            _data = await partnerApi.getPublicConfig();
        } catch {
            _failed = true;
        } finally {
            _loading = false;
        }
    }
};
