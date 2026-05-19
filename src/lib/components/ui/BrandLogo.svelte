<!-- src/lib/components/ui/BrandLogo.svelte -->
<script lang="ts">
	type Variant = 'light' | 'color';
	type Size    = 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		size?:    Size;
	}

	let { variant = 'light', size = 'md' }: Props = $props();

	const sizeClass: Record<Size, string> = {
		sm: 'text-3xl',
		md: 'text-4xl',
		lg: 'text-5xl'
	};

	const rxColor: Record<Variant, string> = {
		light: 'text-teal-300',
		color: 'text-teal-600 dark:text-teal-400'
	};

	const linkColor: Record<Variant, string> = {
		light: 'text-white',
		color: 'text-stone-900 dark:text-stone-50'
	};
</script>

<div class="flex items-baseline gap-1">
	<span
		style="font-family: 'Instrument Serif', serif;"
		class="italic tracking-tight leading-none {sizeClass[size]} {rxColor[variant]}"
	>
		Rx
	</span>
	<span
		style="font-family: 'Instrument Serif', serif;"
		class="tracking-tight leading-none {sizeClass[size]} {linkColor[variant]}"
	>
		Link
	</span>
</div>