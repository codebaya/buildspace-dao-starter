import {useAddress, useEditionDrop, useMetamask} from "@thirdweb-dev/react";
import { useState, useEffect } from "react";

const App = () => {

    // Use the hooks thirdweb give us.
    const address = useAddress();
    const connectWithMetamask = useMetamask();
    console.log("Address : ", address);

    // Initialize our editionDrop contract
    const editionDrop = useEditionDrop("0xB84Eb3D9FF6Aad0994DDFC93c6CC12fCB0d3aC97")
    // State variable for us to know if user has our NFT
    const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
    // isClaiming lets us easily keep a loading state while the NFT is minting
    const [isClaiming, setIsClaiming] = useState(false);

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
                <h1>WSDAO Membership Page</h1>
                <p>Congratulations on Being a member</p>
                <a href={`https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`} >Check it out on OpenSea</a>
            </div>
        )
    }
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
