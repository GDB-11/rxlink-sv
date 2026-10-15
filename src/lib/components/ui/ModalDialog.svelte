<!-- src/lib/components/ui/ModalDialog.svelte -->
<script lang="ts">
    import type { Snippet } from 'svelte';
    import { IconX } from '@tabler/icons-svelte';

    interface Props {
        open: boolean;
        title: string;
        /** Tailwind max-width class of the panel. */
        widthClass?: string;
        onclose: () => void;
        children: Snippet;
        footer?: Snippet;
    }
    let { open, title, widthClass = 'max-w-md', onclose, children, footer }: Props = $props();

    const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

    function handleKeydown(e: KeyboardEvent): void {
        if (e.key === 'Escape') onclose();
    }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
    >
        <div class="flex max-h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800 {widthClass}">
            <div class="flex items-start justify-between gap-4 px-6 pt-5">
                <h3 id={titleId} class="text-base font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
                <button
                    type="button"
                    onclick={onclose}
                    class="cursor-pointer rounded-lg p-1 text-stone-400 transition-colors
                           hover:bg-stone-100 hover:text-stone-700
                           dark:hover:bg-stone-700 dark:hover:text-stone-200"
                    aria-label="Cerrar"
                >
                    <IconX size={18} aria-hidden="true" />
                </button>
            </div>

            <div class="overflow-y-auto px-6 py-4">
                {@render children()}
            </div>

            {#if footer}
                <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
                    {@render footer()}
                </div>
            {/if}
        </div>
    </div>
{/if}
