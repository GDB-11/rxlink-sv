<!-- src/lib/features/auth/components/AuthSplitLayout.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		left: Snippet;
		right: Snippet;
	}

	let { left, right }: Props = $props();
</script>

<div class="flex min-h-screen" style="font-family: 'Outfit', sans-serif;">
	<!-- Left column: hidden on mobile, visible md+ -->
	<div class="hidden md:flex md:w-[46%] lg:w-[42%]">
		{@render left()}
	</div>

	<!-- Right column: full-width on mobile, flex-1 on md+ -->
	<div
		class="flex flex-1 flex-col items-center justify-center
               bg-stone-50 px-6
               py-16 sm:px-10 dark:bg-stone-900"
	>
		{@render right()}
	</div>
</div>
