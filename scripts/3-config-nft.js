import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0xB84Eb3D9FF6Aad0994DDFC93c6CC12fCB0d3aC97");

(async () => {
    try {
        await editionDrop.createBatch([
            {
                name: "Leaf Village Headbank",
                description: "This NFT will give you access to WholesaleDAO",
                image: readFileSync("scripts/assets/wholesalelogo.jpg"),
            },
        ]);
        console.log("Successfully created a new NFT in the drop!");
    } catch (error) {
        console.error("failed to create the new NFT", error);
    }
})();