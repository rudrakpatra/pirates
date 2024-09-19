<script lang="ts">
	import Button from "$lib/components/shared/Button.svelte";
	import { GameInstance } from "$lib/game/three/GameInstance";
	import { Chain } from "$lib/stores/chain";
    import { Wallet } from "$lib/stores/wallet";
	import { filterTxn } from "$lib/utils";

    const gameInstance=new GameInstance();
    $:if($Wallet.address) gameInstance.playerPubKeyBase58=$Wallet.address;
    const canvas = (node: HTMLDivElement) => {
        node.appendChild(gameInstance.canvas);
    }
    // setup Chain.on 
    Chain.on((tx)=>filterTxn.byMethodName(tx,"Logic","spawn"), () => {
        //read and spawn sender

    })
    Chain.on((tx)=>filterTxn.byMethodName(tx,"Logic","leave"), () => {
        //remove the sender
        
    })
    Chain.on((tx)=>filterTxn.byMethodName(tx,"Logic","changeTurnRate"), () => {
        //change the turn rate of the sender
        
    })
    Chain.on((tx)=>filterTxn.byMethodName(tx,"Logic","shoot"), () => {
        //show the target mark
        
    })
    Chain.on((tx)=>filterTxn.byMethodName(tx,"Logic","hit"), () => {
        //show the target mark
        
    })
    Chain.on((tx)=>filterTxn.byMethodName(tx,"Logic","pickupLoot"), () => {
        //remove the loot
        
    })
</script>
<svelte:head>
    <title>Game</title>
</svelte:head>
<div>
    {#if $Wallet.address}
        <div use:canvas class="fixed inset-0 bg-black h-[100vh] overflow-hidden"/>
    {:else}
        <div class="flex h-full w-full items-center justify-center pt-16">
            <div class="m-6 flex basis-4/12 flex-col items-center justify-center 2xl:basis-3/12">
                <div class="mb-2">
                    <h2 class="text-xl font-bold">Wallet Required</h2>
                    <p class="mt-1 text-sm text-zinc-500">You must connect to play this game</p>
                </div>
                <Button on:click={() => Wallet.connect()} size="lg" class="mt-6">Connect Wallet</Button>
            </div>
        </div>
    {/if}
</div>
<style>

</style>