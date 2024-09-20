<script lang="ts">
	import { cn } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';

	let className = '',
		knobClassName = '',
		trackClassName = '',
		trackPrimaryClassName = '';
	export {
		className as class,
		trackPrimaryClassName as trackPrimaryClass,
		trackClassName as trackClass,
		knobClassName as knobClass
	};
	export let variant: 'simple' | 'bicolored' = 'simple';
	export let min = 0;
	export let max = 100;
	export let step = 1;
	export let defaultValue = 0;

	const dispatch = createEventDispatcher<{ change: { value: number }; input: { value: number } }>();
	let ref: HTMLInputElement;
	let value = defaultValue;
	let trackWidth = 0;
	let knobWidth = 0;

	$: x = ((defaultValue - min) / (max - min)) * trackWidth;
	$: y = ((value - min) / (max - min)) * (trackWidth - knobWidth);
	$: leftPosition = Math.min(x, y + knobWidth / 2);
	$: rightPosition = Math.min(trackWidth - x, trackWidth - y - knobWidth / 2);

	function handleInput() {
		value = ref.valueAsNumber;
		dispatch('input', { value });
	}

	function handleChange() {
		dispatch('change', { value });
	}
</script>

<div class={cn('relative h-4 w-full rounded-full', className)}>
	<input
		tabindex="-1"
		class="absolute inset-0 cursor-grab outline-none"
		bind:this={ref}
		type="range"
		{min}
		{max}
		{step}
		bind:value
		on:change={handleChange}
		on:input={handleInput}
		{...$$restProps}
	/>
	<div class="pointer-events-none absolute inset-0">
		<div
			class={cn('absolute inset-0 rounded-full bg-gray-200', trackClassName)}
			bind:clientWidth={trackWidth}
		>
			{#if variant === 'bicolored'}
				<div
					class={cn('absolute bottom-0 top-0 bg-primary', trackPrimaryClassName)}
					style="left: {leftPosition}px; right: {rightPosition}px;"
				/>
			{/if}
		</div>
		<div
			class={cn(
				' absolute top-1/2 grid aspect-square h-8 -translate-y-1/2 place-items-center rounded-full bg-white shadow',
				knobClassName
			)}
			bind:clientWidth={knobWidth}
			style="left:{y}px"
		>
			<slot>
				{value}
			</slot>
		</div>
	</div>
</div>
