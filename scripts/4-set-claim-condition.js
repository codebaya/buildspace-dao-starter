import sdk from "./1-initialize-sdk.js";
import { MaxInt256 } from "@ethersproject/constants";

const editionDrop = sdk.getEditionDrop("0xB84Eb3D9FF6Aad0994DDFC93c6CC12fCB0d3aC97");

(async () => {
    try {
        // We define our claim conditions, this is an array of objects because
        // We can have multiple phases starting at different times if we want to
        const claimConditions = [{
            // When people are gonna be able to start claim the NFTs(now)
            startTime: new Date(),
            // The maximum number of NFTs that can be claimed.
            maxQuantity: 50_000,
            // The price of our NFT (free)
            price: 0,
            // the amount of NFTs people can claim in one transaction.
            quantityLimitPerTransaction: 1,
            // We set the wait between transactions to MaxUint256, which means
            // people are only allowed to claim once.
            waitInSeconds: MaxInt256,
        }]

        await editionDrop.claimConditions.set("0", claimConditions);
        console.log("Successfully set claim conditions!");
    } catch (error) {
        console.error("Failed to set claim condition", error);
    }
})();