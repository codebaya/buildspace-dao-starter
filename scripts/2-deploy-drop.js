// import { AddressZero } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

(async () => {
    try {
        const editionDropAddress = await sdk.deployer.deployEditionDrop({
            // The collection's name, ex, WholesaleDAO
            name: "WholesaleDAO Membership",
            // A description for the collection.
            description: "A DAO for fans of WholesaleDAO",
            // the image that will be held on our NFT! the fun part :).
            image: readFileSync("scripts/assets/wholesaledao.png"),
            // we need to pass in the address of the person who will be receiving the proceeds from sale of nfts in the contract.
            // we're planning on not charging people for the drop, so we'll pass in the 0x0 address
            // you can set this to your own wallet address if you want to charge for the drop.
            primary_sale_recipient: AddressZero,
        });
        // this initialization returns the address of our contract
        // we use this to initialize the contract on the thirdweb sdk
        const editionDrop = sdk.getEditionDrop(editionDropAddress);

        // with this, we can get the metadata of our contract
        const metadata = await editionDrop.metadata.get();

        console.log(
            "Successfully deployed editionDrop contract, address:",
            editionDropAddress,
        );
        console.log("editionDrop metadata:", metadata);
    } catch (error) {
        console.log("Failed to deploy editionDrop contract", error);
    }
})();