<script lang="ts">
	import { cn } from '$lib/utils';

	let className = '';
	export { className as class };
</script>

<div class={cn('bg-muted animate-pulse rounded-sm', className)} {...$$restProps} />
