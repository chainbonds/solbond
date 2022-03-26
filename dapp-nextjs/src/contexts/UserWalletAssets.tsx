import React, {useState, useContext, useEffect} from 'react';
import {PublicKey, TokenAmount} from "@solana/web3.js";
import {registry} from "@qpools/sdk";
import {getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {AllocData} from "../types/AllocData";
import {IRpcProvider, useRpc} from "./RpcProvider";
import {ISerpius, useSerpiusEndpoint} from "./SerpiusProvider";
import {BN} from "@project-serum/anchor";


export interface IUserWalletAssets {
    walletAssets: AllocData[] | undefined
}

const defaultValue: IUserWalletAssets = {
    walletAssets: undefined
}

const UserWalletAssetsContext = React.createContext<IUserWalletAssets>(defaultValue);

export function useUserWalletAssets() {
    return useContext(UserWalletAssetsContext);
}

export function UserWalletAssetsProvider(props: any) {

    const rpcProvider: IRpcProvider = useRpc();
    const serpiusProvider: ISerpius = useSerpiusEndpoint();

    /**
     * Generic state for RPC Calls
     */
    const [walletAssets, setWalletAssets] = useState<AllocData[]>([]);

    // TODO: We should both set the portfolio ratio's here
    // We should also set the user's walet ratio's here ...
    // Can be all stored in the AllocData object ... (this object is weird ...)

    /**
     * Fetch the Serpius Endpoint
     * Fetch all Serpius Assets
     * For each Asset
     *      Fetch All the underlying Tokens
     *      For each Underlying Token
     *          Fetch the User Balance
     *          Push to the Table Object of Items
     */
    const updateUserAssetsAndRatiosAfterConnecting = async () => {
        console.log("#updateUserAssetsAndRatiosAfterConnecting()");

        let newAllocData: AllocData[] = [];

        if (!rpcProvider.userAccount || !rpcProvider.connection) {
            return
        }
        // Also return empty if the

        // (1) Get all token accounts owned that we get from the serpius API ...
        // .filter((item, index) => {return portfolioRatios.indexOf(item) === index})
        // TODO: Remove duplicates with this filter ...
        await Promise.all(serpiusProvider.portfolioRatios.map(async (fetchedPool: AllocData) => {
            console.log("Iterating through pool: ", fetchedPool)

            // Now we have the pool
            // When are the tokens not defined ...
            let tokens: registry.ExplicitToken[] | undefined = fetchedPool.pool?.tokens;
            if (!tokens) {
                return;
            }
            await Promise.all(tokens.map(async (token: registry.ExplicitToken) => {

                // Do a whitelist here which assets we accept ...
                if (registry.getWhitelistTokens().filter((x: string) => x === token.address).length === 0) {
                    return
                }

                console.log("Iterating through token: ", token);
                let mint: PublicKey = new PublicKey(token.address);
                let ata = await getAssociatedTokenAddressOffCurve(mint, rpcProvider.userAccount!.publicKey);
                // Finally get the users' balance
                // Let's assume that if the token is wrapped solana, that we can also include the pure solana into this .
                let userBalance: TokenAmount;
                if (mint.equals(registry.getNativeSolMint())) {
                    // TODO: refactor this into a util function or so ...
                    // This is quite hacky. How do we treat the wrapping / unrapping for this?
                    // Probably something like a transformer function would be nice for different protocols,
                    // i.e. for marinade it could turn the unwrapped SOL into wrapped SOL or so .. and then unwrap it again.
                    // the user would have to sign for this so it's not entirely feasible
                    let solBalance: BN = new BN (await rpcProvider.connection!.getBalance(rpcProvider.userAccount!.publicKey));
                    userBalance = {
                        amount: solBalance.toString(),
                        decimals: 9,
                        uiAmount: (solBalance.toNumber() / (10 ** 9)),
                        uiAmountString: ((solBalance.toNumber() / (10 ** 9))).toString()
                    };
                } else {
                    console.log("Mint is: ", mint.toString(), ata.toString());
                    userBalance = (await rpcProvider.connection!.getTokenAccountBalance(ata)).value;
                    console.log("fetched successfully! ", userBalance);
                }
                let newPool: AllocData = {
                    ...fetchedPool,
                    userInputAmount: {
                        mint: mint,
                        ata: ata,
                        amount: userBalance
                    },
                    userWalletAmount: {
                        mint: mint,
                        ata: ata,
                        amount: {...userBalance}
                    }
                }

                // also overwrite the weight to be the user's estimated USDC balance for this token ...
                // convert by pyth price, maybe
                // Convert by pyth price,
                // for now, hardcoding is enough, because we haven't started converting by the pyth price yet ...
                if (newPool.userInputAmount!.mint.equals(new PublicKey("So11111111111111111111111111111111111111112"))) {
                    newPool.weight = newPool.userInputAmount!.amount.uiAmount! * 93.;
                } else {
                    console.log("Assuming USDC...");
                    newPool.weight = newPool.userInputAmount!.amount.uiAmount!;
                }
                console.log("Pushing object: ", newPool);
                newAllocData.push(newPool);
            }));
        }));

        setWalletAssets((_: AllocData[]) => {
            return newAllocData;
        });
        console.log("##updateUserAssetsAndRatiosAfterConnecting()");
    }

    useEffect(() => {
        updateUserAssetsAndRatiosAfterConnecting();
    }, [rpcProvider.reloadPriceSentinel, rpcProvider.userAccount, rpcProvider.connection]);

    const value: IUserWalletAssets = {
        walletAssets
    };

    return (
        <>
            <UserWalletAssetsContext.Provider value={value}>
                {props.children}
            </UserWalletAssetsContext.Provider>
        </>
    );
}
