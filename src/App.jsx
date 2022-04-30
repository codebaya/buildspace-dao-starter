import { useAddress, useMetamask } from "@thirdweb-dev/react";


const App = () => {
    // Use the hooks thirdweb give us.
    const address = useAddress();
    const connectWithMetamask = useMetamask();
    console.log("Address : ", address);

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
    return (
        <div className="landing">
            <h1> 👀 You're Connected to WholesaleDAO</h1>
        </div>
    );
};

export default App;
