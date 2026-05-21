// src/lib/features/navigation/stores/navigation.svelte.ts

import { navigationApi, type NavigationModule } from '$lib/api/navigationApi';

let _modules = $state<NavigationModule[]>([]);
let _activeModuleCode = $state<string | null>(null);
let _loading = $state(false);
let _error = $state<string | null>(null);

export const navigation = {
    get modules(): NavigationModule[] { return _modules; },
    get activeModuleCode(): string | null { return _activeModuleCode; },
    get loading(): boolean { return _loading; },
    get error(): string | null { return _error; },

    get activeModule(): NavigationModule | null {
        return _modules.find(m => m.moduleCode === _activeModuleCode) ?? null;
    },

    setActiveModule(moduleCode: string) {
        _activeModuleCode = moduleCode;
    },

    /**
     * Resolves the active module from the current pathname.
     * Falls back to the first module if no match is found.
     */
    resolveActiveModule(pathname: string) {
        if (_modules.length === 0) return;

        const match = _modules.find(m =>
            m.items.some(item =>
                item.path === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.path)
            )
        );

        _activeModuleCode = (match ?? _modules[0]).moduleCode;
    },

    async load() {
        if (_loading) return;
        _loading = true;
        _error = null;
        try {
            const data = await navigationApi.getNavigation();
            _modules = [...data.modules].sort((a, b) => a.order - b.order);
            if (_modules.length > 0 && _activeModuleCode === null) {
                _activeModuleCode = _modules[0].moduleCode;
            }
        } catch {
            _error = 'No se pudo cargar la navegación.';
        } finally {
            _loading = false;
        }
    },

    reset() {
        _modules = [];
        _activeModuleCode = null;
        _error = null;
        _loading = false;
    }
};
