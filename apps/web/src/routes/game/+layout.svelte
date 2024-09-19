<script lang="ts">
	import { Wallet } from "$lib/stores/wallet";

    
</script>
{#if $Wallet.address}
<slot/>
{/if}