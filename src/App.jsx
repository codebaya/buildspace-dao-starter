import {useAddress, useEditionDrop, useMetamask, useToken } from "@thirdweb-dev/react";
import { useState, useEffect, useMemo } from "react";

const App = () => {

    // Use the hooks thirdweb give us.
    const address = useAddress();
    const connectWithMetamask = useMetamask();
    console.log("Address : ", address);

    // Initialize our token contract
    const token = useToken("0xe2d6AF4C35Ad7B1fc76f84746D3b936E361bC962");
    // Initialize our editionDrop contract
    const editionDrop = useEditionDrop("0xB84Eb3D9FF6Aad0994DDFC93c6CC12fCB0d3aC97")
    // State variable for us to know if user has our NFT
    const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
    // isClaiming lets us easily keep a loading state while the NFT is minting
    const [isClaiming, setIsClaiming] = useState(false);

    // Holds the amount of token each member has in state
    const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
    // the array holding all of our members addresses.
    const [memberAddresses, setMemberAddresses] = useState([]);

    // A fancy function to shorten someone's wallet address, no need to show the whole thing
    const shortenAddress = (str) => {
        return str.substring(0, 6) + "..." + str.substring(str.length - 4);
    };

    // This useEffect grabs all the addresses of our member's holding our NFT.
    useEffect(() => {
        if(!hasClaimedNFT) {
            return;
        }

        // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
        // with tokenId 0.
        const getAllAddresses = async () => {
            try {
                const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
                setMemberAddresses(memberAddresses);
                console.log("Members addresses", memberAddresses);
            } catch (error) {
                console.error("Failed to get member's list", error);
            }
        };
        getAllAddresses();
    }, [hasClaimedNFT, editionDrop.history]);

    // This useEffect grabs the # of token each member holds.
    useEffect(() => {
        if(!hasClaimedNFT) {
            return;
        }

        const getAllBalances = async () => {
            try {
                const amounts = await token.history.getAllHolderBalances();
                setMemberTokenAmounts(amounts);
                console.log("amount", amounts);

            } catch (error) {
                console.error("Failed to get member balances", error);
            }
        };
        getAllBalances();
    }, [hasClaimedNFT, token.history]);

    // Now, we combine the memberAddresses and memberTokenAmounts into a single array
    const memberList = useMemo(() => {
        return memberAddresses.map((address) => {
            // We're checking if we're finding the address in the memberTokenAmounts array.
            // If we are, we'll return the amount of token the user has.
            // otherwise, return 0.
            const member = memberTokenAmounts?.find(({holder}) => holder === address);

            return {
                address, tokenAmount: member?.balance.displayValue || "0",
            }
        });
    }, [memberAddresses, memberTokenAmounts]);





    useEffect(() => {
        // if they don't have a connected wallet, exit!
        if(!address) {
            return;
        }

        const checkBalance = async () => {
            try {
                const balance = await editionDrop.balanceOf(address, 0);
                if (balance.gt(0)) {
                    setHasClaimedNFT(true);
                    console.log("This user has a membership NFT");
                } else {
                    setHasClaimedNFT(false);
                    console.log("this user doesn't have a membership NFT!");
                }
            } catch (error) {
                setHasClaimedNFT(false);
                console.log("Failed to get balance", error);
            }
        };
        checkBalance();

    }, [address, editionDrop]);

    const mintNFT = async () => {
        try {
            setIsClaiming(true);
            await editionDrop.claim("0", 1);
            console.log(`Successfully minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);
            setHasClaimedNFT(true);
        } catch (error) {
            setHasClaimedNFT(false);
            console.error("Failed to mint NFT", error);
        } finally {
            setIsClaiming(false);
        }
    };

    // This is the case where the user hasn't connected their wallet
    // to your web app. Let them call connectWallet.
    if (!address) {
        return (
            <div className="landing">
                <h1>Welcome to WholeSaleDAO</h1>
                <button onClick={connectWithMetamask} className="btn-hero">
                    Connect your wallet
                </button>
            </div>
        );
    }

    // Add this little piece!
    if (hasClaimedNFT) {
        return (
            <div className="member-page">
                <h1>🍪WS-DAO Member Dashboard</h1>
                <p>Congratulations on being a member</p>
                <div>
                    <div>
                        <h2>Member List</h2>
                        <table className="card">
                            <thead>
                            <tr>
                                <th>Address</th>
                                <th>Token Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            {memberList.map((member) => {
                                return (
                                    <tr key={member.address}>
                                        <td>{shortenAddress(member.address)}</td>
                                        <td>{member.tokenAmount}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="mint-nft">
            <h1> Mint your FREE WSDAO membership NFT</h1>
            <button
                disabled={isClaiming}
                onClick={mintNFT}
            >
                {isClaiming ? "Minting..." : "Mint your NFT (FREE)"}
            </button>
        </div>
    );
};

export default App;
