import React, {useState, useContext, useEffect} from 'react';
import {PublicKey, TokenAmount} from "@solana/web3.js";
import {AllocData, keyFromAllocData} from "../types/AllocData";
import {IRpcProvider, useRpc} from "./RpcProvider";
import {ISerpius, useSerpiusEndpoint} from "./SerpiusProvider";
import {BN} from "@project-serum/anchor";
import {lamportsReserversForLocalWallet} from "../const";
import {Registry, getWhitelistTokens, ExplicitToken, getAssociatedTokenAddressOffCurve, accountExists, getTokenAmount, getMarinadeSolMint, getWrappedSolMint, multiplyAmountByPythprice } from '@qpools/sdk';

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

// Add the registry here
// Set a new pubkey to the registry, if the user has connected his wallet ...
interface Props {
    registry: Registry
    children: any
}
export function UserWalletAssetsProvider(props: Props) {

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

        console.log("One of these doesn't work..");
        console.log(rpcProvider.userAccount);
        console.log(rpcProvider.userAccount?.publicKey);
        if (!rpcProvider.userAccount || !rpcProvider.userAccount?.publicKey) {
            console.log("One of these doesn't work (2)..");
            console.log(rpcProvider.userAccount);
            console.log(rpcProvider.userAccount?.publicKey)
            return;
        }
        // Also return empty if the

        // Set the newly selected pubkey into the registry ...
        props.registry.setNewPubkey(rpcProvider.userAccount!.publicKey);

        // (1) Get all token accounts owned that we get from the serpius API ...
        // .filter((item, index) => {return portfolioRatios.indexOf(item) === index})
        // TODO: Remove duplicates with this filter ...
        console.log("Serpius portfolio ratios are: ", serpiusProvider.portfolioRatios);
        await Promise.all(Array.from(serpiusProvider.portfolioRatios.values()).map(async (fetchedPool: AllocData) => {
            console.log("Iterating through pool: ", fetchedPool)

            // Now we have the pool
            // When are the tokens not defined ...
            let tokens: ExplicitToken[] = fetchedPool.pool.tokens;
            await Promise.all(tokens.map(async (token: ExplicitToken) => {

                // Gotta get the input tokens ...

                // Do a whitelist here which assets we accept ...
                if (getWhitelistTokens().filter((x: string) => x === token.address).length === 0) {
                    return
                }

                console.log("Iterating through token: ", token);
                let mint: PublicKey = new PublicKey(token.address);
                let ata = await getAssociatedTokenAddressOffCurve(mint, rpcProvider.userAccount!.publicKey);
                // Finally get the users' balance
                // Let's assume that if the token is wrapped solana, that we can also include the pure solana into this.
                let userBalance: TokenAmount;
                // Set the starting balance always at 0
                let startingBalance: TokenAmount;
                // TODO: Let's assume that 10% of the user's assets is currently put into each pool ...
                if (mint.equals(getWrappedSolMint())) {
                    // In the case of wrapped sol, combine the balance from the native SOL,
                    // as well as the balance from the wrapped SOL
                    let solBalance: BN = new BN (await rpcProvider.connection!.getBalance(rpcProvider.userAccount!.publicKey));

                    // Skip the wrapped SOL calclulation, if this token account does not exist ...
                    let wrappedSolBalance: BN = new BN(0);
                    if (await accountExists(rpcProvider.connection!, ata)) {
                        wrappedSolBalance = new BN((await rpcProvider.connection!.getTokenAccountBalance(ata)).value.amount);
                    }
                    let totalBalance: BN = wrappedSolBalance.add(solBalance);
                    console.log("solbalance before ", solBalance);

                    userBalance = getTokenAmount(totalBalance.sub(lamportsReserversForLocalWallet), new BN(9));

                    console.log("String and marinade sol mint is: ");
                    console.log("1111");
                    console.log(fetchedPool?.pool.lpToken.address?.toString());
                    console.log("2222");
                    console.log(getMarinadeSolMint().toString());
                    // Could also divide this by the number of input assets or sth ...
                    if (fetchedPool?.pool.lpToken.address?.toString() === getMarinadeSolMint().toString()) {
                        startingBalance = getTokenAmount(new BN(0), new BN(userBalance.decimals));
                    } else {
                        // If division by number of protocols is less than 1, make it zero ...
                        startingBalance = getTokenAmount(new BN(userBalance.amount).div(new BN(10)), new BN(userBalance.decimals));
                    }
                    console.log("solbalance after ... ");
                } else {
                    console.log("Mint is: ", mint.toString(), ata.toString());
                    if (await accountExists(rpcProvider.connection!, ata)) {
                        userBalance = (await rpcProvider.connection!.getTokenAccountBalance(ata)).value;
                    } else {
                        // I guess in this case it doesn't matter what the decimals are, because the user needs to buy some more sutff nonetheless
                        userBalance = getTokenAmount(new BN(0), new BN(9));
                    }
                    startingBalance = getTokenAmount(new BN(userBalance.amount).div(new BN(10)), new BN(userBalance.decimals));
                    console.log("fetched successfully! ", userBalance);
                }

                // TODO: For each token, also bootstrap the logos here ...
                let newPool: AllocData = {
                    ...fetchedPool,
                    userInputAmount: {mint: mint, ata: ata, amount: startingBalance},
                    userWalletAmount: {mint: mint, ata: ata, amount: userBalance}
                }

                newPool.usdcAmount = await multiplyAmountByPythprice(
                    newPool.userInputAmount!.amount.uiAmount!,
                    newPool.userInputAmount!.mint
                );
                console.log("Pushing object: ", newPool);
                newAllocData.set(keyFromAllocData(newPool), newPool);
            }));
        }));

        setWalletAssets((_: Map<string, AllocData>) => {
            return newAllocData;
        });
        console.log("##updateUserAssetsAndRatiosAfterConnecting()");
    }

    // Again, don't do this by the user-account (?)
    useEffect(() => {
        updateUserAssetsAndRatiosAfterConnecting();
    }, [
        rpcProvider.reloadPriceSentinel,
        rpcProvider.userAccount?.publicKey,
        rpcProvider.portfolioObject,
        rpcProvider.provider,
        serpiusProvider.portfolioRatios
    ]);

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
