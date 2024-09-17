<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import { Chain } from '$lib/stores/chain';
	import { Toaster } from 'svelte-french-toast';

	Chain.startPolling();
</script>

<Header />
<Toaster />
<slot />
