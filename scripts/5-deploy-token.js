import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        // Deploy a standard ERC-20 contract.
        const tokenAddress = await sdk.deployer.deployToken({
            // What's your token's name? Ex. "Ethereum"
            name: "WholeSaleDAO Governance Token",
            // What's your token's symbol? Ex. "Eth"
            symbol: "WSD",
            // This will be in case we want to sell our token,
            // because we don't, we set it to AddressZero again.
            primary_sale_recipient: AddressZero,
        });
        console.log(
            "Successfully deployed token module, address:",
            tokenAddress,
        );
    } catch (error) {
        console.error("Failed to deploy token module", error);
    }
})();