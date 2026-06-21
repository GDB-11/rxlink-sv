<script lang="ts">
    interface Props {
        fullName: string;
        subtitle?: string;
    }

    let { fullName, subtitle }: Props = $props();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

    const today = new Intl.DateTimeFormat('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date());
</script>

<div class="flex flex-col gap-1">
    <h1 class="text-2xl font-semibold text-stone-900 dark:text-stone-50">
        {greeting}, {fullName}
    </h1>
    <p class="text-sm text-stone-500 dark:text-stone-400 capitalize">{today}{subtitle ? ` — ${subtitle}` : ''}</p>
</div>
