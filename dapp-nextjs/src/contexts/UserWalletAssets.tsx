import React, {useState, useContext, useEffect} from 'react';
import {PublicKey, TokenAmount} from "@solana/web3.js";
import {registry} from "@qpools/sdk";
import {getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {AllocData} from "../types/AllocData";
import {IRpcProvider, useRpc} from "./RpcProvider";
import {ISerpius, useSerpiusEndpoint} from "./SerpiusProvider";
import {BN} from "@project-serum/anchor";
import {getTokenAmount} from "../utils/utils";


export interface IUserWalletAssets {
    walletAssets: Map<string, AllocData>
}

const defaultValue: IUserWalletAssets = {
    walletAssets: new Map<string, AllocData>()
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
    const [walletAssets, setWalletAssets] = useState<Map<string, AllocData>>(new Map<string, AllocData>());

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

        let newAllocData: Map<string, AllocData> = new Map<string, AllocData>();

        if (!rpcProvider.userAccount || !rpcProvider.connection) {
            return
        }
        // Also return empty if the

        // (1) Get all token accounts owned that we get from the serpius API ...
        // .filter((item, index) => {return portfolioRatios.indexOf(item) === index})
        // TODO: Remove duplicates with this filter ...
        await Promise.all(Array.from(serpiusProvider.portfolioRatios.values()).map(async (fetchedPool: AllocData) => {
            console.log("Iterating through pool: ", fetchedPool)

            // Now we have the pool
            // When are the tokens not defined ...
            let tokens: registry.ExplicitToken[] = fetchedPool.pool.tokens;
            await Promise.all(tokens.map(async (token: registry.ExplicitToken) => {

                // Gotta get the input tokens ...

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
                    let solBalance: BN = new BN (await rpcProvider.connection!.getBalance(rpcProvider.userAccount!.publicKey));
                    console.log("solbalance before ", solBalance);
                    userBalance = getTokenAmount(solBalance, 9);
                    console.log("solbalance after ... ")
                } else {
                    console.log("Mint is: ", mint.toString(), ata.toString());
                    userBalance = (await rpcProvider.connection!.getTokenAccountBalance(ata)).value;
                    console.log("fetched successfully! ", userBalance);
                }
                let newPool: AllocData = {
                    ...fetchedPool,
                    userInputAmount: {mint: mint, ata: ata, amount: userBalance},
                    userWalletAmount: {mint: mint, ata: ata, amount: userBalance}
                }

                // TODO: Replace this with pyth price oracles !
                newPool.usdcAmount = registry.multiplyAmountByPythprice(newPool.userInputAmount!.amount.uiAmount!, newPool.userInputAmount!.mint);
                console.log("Pushing object: ", newPool);
                newAllocData.set(newPool.lp, newPool);
            }));
        }));

        setWalletAssets((_: Map<string, AllocData>) => {
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
