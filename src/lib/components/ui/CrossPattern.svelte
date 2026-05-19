<!-- src/lib/components/ui/CrossPattern.svelte -->
<svg
	class="absolute inset-0 w-full h-full"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<defs>
		<pattern id="plus-grid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
			<line
				x1="18" y1="11" x2="18" y2="25"
				stroke="rgba(255,255,255,0.07)"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
			<line
				x1="11" y1="18" x2="25" y2="18"
				stroke="rgba(255,255,255,0.07)"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		</pattern>
	</defs>
	<rect width="100%" height="100%" fill="url(#plus-grid)" />
</svg>