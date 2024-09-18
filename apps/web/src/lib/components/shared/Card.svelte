<script lang="ts">
	import { cn } from '$lib/utils';

	let className = '';
	export { className as class };

	export let header = false;
	export let footer = false;
</script>

<div
	class={cn('bg-card text-card-foreground rounded-lg border shadow-sm', className)}
	{...$$restProps}
>
	{#if header}
		<div class="flex flex-col space-y-1.5 p-6">
			<slot name="header" />
		</div>
	{/if}
	<div class={cn('p-6', { 'pt-0': header })}>
		<slot />
	</div>
	{#if footer}
		<div class="flex items-center p-6 pt-0">
			<slot name="footer" />
		</div>
	{/if}
</div>
