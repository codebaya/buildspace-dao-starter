import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";
import {isArgumentsObject} from "util/support/types.js";

// This is our governance contract.
const vote = sdk.getVote("0x6673F0Eed03E7aCeF60118CD6183E583fEF82Ce9");
// This is our ERC-20 contract.
const token = sdk.getToken("0xe2d6AF4C35Ad7B1fc76f84746D3b936E361bC962");

(async () => {
    try {
        // Create proposal to mint 420,000 new token to the treasury.
        const amount = 420_000;
        const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
        const executions = [
            {
                // Our token contract that actually executes the mint.
                toAddress: token.getAddress(),
                // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
                // to send in this proposal. In this case, we're sending 0 ETH.
                // We're just minting new tokens to the treasury to the treasury. So, set to 0.
                nativeTokenValue: 0,
                // We're doing a mint! and. we're minting to the vote, which is
                // acting as our treasury.
                // in this case, we need to use ethers.js to convert the amount
                // to the correct format. This is because the amount it requires is in WEI.
                transactionData: token.encoder.encode(
                    "mintTo", [
                        vote.getAddress(),
                        ethers.utils.parseUnits(amount.toString(), 18),
                    ]
                ),
            }
        ];

        await vote.propose(description, executions);

        console.log("Successfully created proposal to mint tokens");

    } catch (error) {
        console.error("Failed to create first proposal", error);
        process.exit(1);
    };

    try {
        // Create proposal to transfer ourselves 6,900 tokens for being awesome.
        const amount = 6_900;
        const description = "Should the DAO transfer " + amount + " tokens from the treasury to " + process.env.WALLET_ADDRESS + " for being Awesome?";
        const executions = [
            {
                // Again, we're sending ourselves 0 ETH. just sending our own token.
                nativeTokenValue: 0,
                transactionData: token.encoder.encode(
                    // We're doing a transfer from the treasury to our wallet.
                    "transfer",
                    [
                        process.env.WALLET_ADDRESS,
                        ethers.utils.parseUnits(amount.toString(), 18),
                    ]
                ),
                toAddress: token.getAddress(),
            },
        ];

        await vote.propose(description, executions);

        console.log("Successfully created proposal to reward ourselves from the treasury, let's home people vote for it");

    } catch (error) {
        console.error("Failed to create sencond proposal", error);
    }

})();
