import {useAddress, useEditionDrop, useMetamask, useToken, useVote } from "@thirdweb-dev/react";
import { useState, useEffect, useMemo } from "react";
import { AddressZero } from "@ethersproject/constants";

const App = () => {

    // Use the hooks thirdweb give us.
    const address = useAddress();
    const connectWithMetamask = useMetamask();
    console.log("Address : ", address);

    // Initialize our token contract
    const token = useToken("0xe2d6AF4C35Ad7B1fc76f84746D3b936E361bC962");
    const vote = useVote("0x6673F0Eed03E7aCeF60118CD6183E583fEF82Ce9");
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

    const [proposals, setProposals] = useState([]);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    // Retrieve all our existing proposals from the contract.
    useEffect(() => {
        if(!hasClaimedNFT) {
            return;
        }
        // A simple call to vote.getAll() to grab the proposals.
        const getAllProposals = async () => {
            try {
                const proposals = await vote.getAll();
                setProposals(proposals);
                console.log("Proposals:", proposals);
            } catch (error) {
                console.log("failed to get proposals", error);
            }
        };
        getAllProposals();
    }, [hasClaimedNFT, vote]);

    // We also need to check if the user already voted.
    useEffect(() => {
        if(!hasClaimedNFT) {
            return;
        }

        const checkIfUserHasVoted = async () => {
            try {
                const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
                setHasVoted(hasVoted);
                if(hasVoted) {
                    console.log("User has already voted");
                } else {
                    console.log("User has not voted yet");
                }
            } catch (error) {
                console.error("failed to check if wallet has voted", error);
            }
            checkIfUserHasVoted();
        }
    }, [hasClaimedNFT, proposals, address, vote]);



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
                <h1>🍪WholeSale-DAO Member Dashboard</h1>
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
                    <div>
                        <h2>Active Proposals</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                //before we do async things, we want to disable the button to prevent double clicks
                                setIsVoting(true);

                                // lets get the votes from the form for the values
                                const votes = proposals.map((proposal) => {
                                    const voteResult = {
                                        proposalId: proposal.proposalId,
                                        //abstain by default
                                        vote: 2,
                                    };
                                    proposal.votes.forEach((vote) => {
                                        const elem = document.getElementById(
                                            proposal.proposalId + "-" + vote.type
                                        );

                                        if (elem.checked) {
                                            voteResult.vote = vote.type;
                                            return;
                                        }
                                    });
                                    return voteResult;
                                });

                                // first we need to make sure the user delegates their token to vote
                                try {
                                    //we'll check if the wallet still needs to delegate their tokens before they can vote
                                    const delegation = await token.getDelegationOf(address);
                                    // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                                    if (delegation === AddressZero) {
                                        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                                        await token.delegateTo(address);
                                    }
                                    // then we need to vote on the proposals
                                    try {
                                        await Promise.all(
                                            votes.map(async ({ proposalId, vote: _vote }) => {
                                                // before voting we first need to check whether the proposal is open for voting
                                                // we first need to get the latest state of the proposal
                                                const proposal = await vote.get(proposalId);
                                                // then we check if the proposal is open for voting (state === 1 means it is open)
                                                if (proposal.state === 1) {
                                                    // if it is open for voting, we'll vote on it
                                                    return vote.vote(proposalId, _vote);
                                                }
                                                // if the proposal is not open for voting we just return nothing, letting us continue
                                                return;
                                            })
                                        );
                                        try {
                                            // if any of the propsals are ready to be executed we'll need to execute them
                                            // a proposal is ready to be executed if it is in state 4
                                            await Promise.all(
                                                votes.map(async ({ proposalId }) => {
                                                    // we'll first get the latest state of the proposal again, since we may have just voted before
                                                    const proposal = await vote.get(proposalId);

                                                    //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                                                    if (proposal.state === 4) {
                                                        return vote.execute(proposalId);
                                                    }
                                                })
                                            );
                                            // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                                            setHasVoted(true);
                                            // and log out a success message
                                            console.log("successfully voted");
                                        } catch (err) {
                                            console.error("failed to execute votes", err);
                                        }
                                    } catch (err) {
                                        console.error("failed to vote", err);
                                    }
                                } catch (err) {
                                    console.error("failed to delegate tokens");
                                } finally {
                                    // in *either* case we need to set the isVoting state to false to enable the button again
                                    setIsVoting(false);
                                }
                            }}
                        >
                            {proposals.map((proposal) => (
                                <div key={proposal.proposalId} className="card">
                                    <h5>{proposal.description}</h5>
                                    <div>
                                        {proposal.votes.map(({ type, label }) => (
                                            <div key={type}>
                                                <input
                                                    type="radio"
                                                    id={proposal.proposalId + "-" + type}
                                                    name={proposal.proposalId}
                                                    value={type}
                                                    //default the "abstain" vote to checked
                                                    defaultChecked={type === 2}
                                                />
                                                <label htmlFor={proposal.proposalId + "-" + type}>
                                                    {label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button disabled={isVoting || hasVoted} type="submit">
                                {isVoting
                                    ? "Voting..."
                                    : hasVoted
                                        ? "You Already Voted"
                                        : "Submit Votes"}
                            </button>
                            {!hasVoted && (
                                <small>
                                    This will trigger multiple transactions that you will need to
                                    sign.
                                </small>
                            )}
                        </form>
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
