<!-- src/lib/components/ui/PasswordStrengthField.svelte -->
<script lang="ts">
    import { IconLock, IconEye, IconEyeOff, IconCheck, IconX } from '@tabler/icons-svelte';

    interface Props {
        value?: string;
        id?: string;
        placeholder?: string;
        disabled?: boolean;
        /** Minimum number of characters required. */
        minLength?: number;
        /** When true, at least one uppercase letter is required. */
        requireUppercase?: boolean;
        /** When true, at least one digit is required. */
        requireNumbers?: boolean;
        /** When true, at least one special character is required. */
        requireSpecial?: boolean;
        class?: string;
    }

    let {
        value            = $bindable(''),
        id,
        placeholder      = 'Contraseña',
        disabled         = false,
        minLength        = 8,
        requireUppercase = false,
        requireNumbers   = false,
        requireSpecial   = false,
        class: className = ''
    }: Props = $props();

    let showPassword = $state(false);

    // ── Per-rule checks ────────────────────────────────────────────────────────
    const hasLength  = $derived(value.length >= minLength);
    const hasLower   = $derived(/[a-z]/.test(value));
    const hasUpper   = $derived(/[A-Z]/.test(value));
    const hasNumber  = $derived(/[0-9]/.test(value));
    const hasSpecial = $derived(/[^a-zA-Z0-9]/.test(value));

    // ── Strength score 0-4 ────────────────────────────────────────────────────
    // 0 = empty  |  1 = muy débil  |  2 = débil  |  3 = regular  |  4 = fuerte
    const strength = $derived.by((): 0 | 1 | 2 | 3 | 4 => {
        if (!value) return 0;

        let score = 0;
        if (hasLower)            score++;
        if (hasUpper)            score++;
        if (hasNumber)           score++;
        if (hasSpecial)          score++;
        if (value.length >= 12)  score++;
        if (value.length >= 16)  score++;

        if (value.length < 4)         return 1;
        if (value.length < minLength) return Math.min(2, Math.max(1, score)) as 1 | 2;

        return Math.max(1, Math.min(4, score)) as 1 | 2 | 3 | 4;
    });

    const STRENGTH_META: Record<1 | 2 | 3 | 4, { label: string; color: string; bar: string }> = {
        1: { label: 'Muy débil', color: 'text-rose-600 dark:text-rose-400',     bar: 'bg-rose-500' },
        2: { label: 'Débil',     color: 'text-orange-500 dark:text-orange-400', bar: 'bg-orange-400' },
        3: { label: 'Regular',   color: 'text-amber-600 dark:text-amber-400',   bar: 'bg-amber-400' },
        4: { label: 'Fuerte',    color: 'text-teal-600 dark:text-teal-400',     bar: 'bg-teal-500' },
    };

    function segmentClass(seg: number): string {
        if (!strength || seg > strength) return 'bg-stone-200 dark:bg-stone-700';
        return STRENGTH_META[strength as 1 | 2 | 3 | 4].bar;
    }

    // ── Requirements list (only shows configured rules) ────────────────────────
    const requirements = $derived.by(() => {
        const list: { label: string; met: boolean }[] = [
            { label: `Mínimo ${minLength} caracteres`, met: hasLength },
            { label: 'Letras minúsculas',              met: hasLower  },
        ];
        if (requireUppercase) list.push({ label: 'Letras mayúsculas',       met: hasUpper   });
        if (requireNumbers)   list.push({ label: 'Números',                 met: hasNumber  });
        if (requireSpecial)   list.push({ label: 'Caracteres especiales',   met: hasSpecial });
        return list;
    });
</script>

<!-- Input row -->
<div
    class="flex w-full items-center overflow-hidden rounded-lg border text-sm transition-colors
           focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20
           dark:focus-within:border-teal-600
           {className || 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900'}"
>
    <span class="pointer-events-none shrink-0 pl-3 pr-3 text-stone-400" aria-hidden="true">
        <IconLock size={14} />
    </span>

    <input
        {id}
        type={showPassword ? 'text' : 'password'}
        bind:value
        {placeholder}
        autocomplete="new-password"
        {disabled}
        class="min-w-0 flex-1 bg-transparent px-3 py-2
               text-stone-900 placeholder:text-stone-400
               focus:outline-none
               disabled:cursor-not-allowed disabled:opacity-50
               dark:text-stone-50 dark:placeholder:text-stone-600"
    />

    <button
        type="button"
        onclick={() => (showPassword = !showPassword)}
        {disabled}
        tabindex={-1}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        class="flex shrink-0 cursor-pointer items-center px-3 text-stone-400
               transition-colors hover:text-stone-600
               disabled:cursor-not-allowed disabled:opacity-50
               dark:text-stone-500 dark:hover:text-stone-300"
    >
        {#if showPassword}
            <IconEyeOff size={15} aria-hidden="true" />
        {:else}
            <IconEye size={15} aria-hidden="true" />
        {/if}
    </button>
</div>

<!-- Strength bar + requirements (shown only when field has content) -->
{#if value}
    <div class="mt-2 space-y-2">

        <!-- 4-segment bar -->
        <div class="flex items-center gap-2">
            <div class="flex flex-1 gap-1">
                {#each [1, 2, 3, 4] as seg (seg)}
                    <div
                        class="h-1.5 flex-1 rounded-full transition-colors duration-300
                               {segmentClass(seg)}"
                    ></div>
                {/each}
            </div>
            {#if strength > 0}
                <span class="w-16 text-right text-xs font-medium {STRENGTH_META[strength as 1|2|3|4].color}">
                    {STRENGTH_META[strength as 1|2|3|4].label}
                </span>
            {/if}
        </div>

        <!-- Per-rule checklist -->
        <ul class="space-y-0.5">
            {#each requirements as req (req.label)}
                <li
                    class="flex items-center gap-1.5 text-xs
                           {req.met
                             ? 'text-teal-600 dark:text-teal-400'
                             : 'text-stone-500 dark:text-stone-400'}"
                >
                    {#if req.met}
                        <IconCheck size={11} class="shrink-0" aria-hidden="true" />
                    {:else}
                        <IconX size={11} class="shrink-0" aria-hidden="true" />
                    {/if}
                    {req.label}
                </li>
            {/each}
        </ul>

    </div>
{/if}
