import sdk from "./1-initialize-sdk.js";

// This is the address to our ERC-1155 membership NFT Contract
const editionDrop = sdk.getEditionDrop("0xB84Eb3D9FF6Aad0994DDFC93c6CC12fCB0d3aC97");

// This is the address to our ERC-20 token contract.
const token = sdk.getToken("0xe2d6AF4C35Ad7B1fc76f84746D3b936E361bC962");

(async () => {
    try {
        // Grab all the addresses of people who own our membership NFT,
        // which has a tokenId of 0.
        const walletAddresses = await editionDrop.history.getAllClaimerAddresses(0);

        if (walletAddresses.length === 0) {
            console.log(
                "No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!"
            );
            process.exit(0);
        }

        // Loop through the array of addresses.
        const airdropTargets = walletAddresses.map((address) => {
            // Pick a random # between 1000 and 10000.
            const randomAmount = Math.floor(Math.random() * (10000 -1000 + 1) + 1000);

            // Set up the target.
            const airdropTarget = {
                toAddress: address,
                amount: randomAmount,
            };

            return airdropTarget;
        });

        // Call transferBatch on all our airdrop targets.
        console.log("Starting airdrop...");
        await token.transferBatch(airdropTargets);
        console.log("Successfully airdropped tokens to all the holders of the NFTs");
    } catch (error) {
        console.error("Failed to airdrop tokens", error);
    }
})();