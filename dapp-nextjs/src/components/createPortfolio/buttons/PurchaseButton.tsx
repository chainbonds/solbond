import React from "react";
import {BN} from "@project-serum/anchor";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import {PublicKey, Transaction} from "@solana/web3.js";
import {getInputTokens, sendAndConfirmTransaction} from "../../../utils/utils";
import {IItemsLoad, useItemsLoad} from "../../../contexts/ItemsLoadingContext";
import {ICrank, useCrank} from "../../../contexts/CrankProvider";
import {ILocalKeypair, useLocalKeypair} from "../../../contexts/LocalKeypairProvider";
import {AllocData} from "../../../types/AllocData";
import {useErrorMessage} from "../../../contexts/ErrorMessageContext";
import {lamportsReserversForLocalWallet} from "../../../const";
import {getAssociatedTokenAddress} from "easy-spl/dist/tx/associated-token-account";
import * as qpools from "@qpools/sdk";
import {useConnectedWallet} from "@saberhq/use-solana";

// TODO: Refactor the code here ... looks a bit too redundant.
//  Maybe try to push the logic into the sdk?
interface Props {
    passedAllocationData: Map<string, AllocData>
}

// Gotta have as input the wallet assets
export default function PurchaseButton({passedAllocationData}: Props) {

    const rpcProvider: IRpcProvider = useRpc();
    // const walletContext: WalletContextState = useWallet();
    const walletContext = useConnectedWallet();
    const crankProvider: ICrank = useCrank();
    const localKeypairProvider: ILocalKeypair = useLocalKeypair();
    const itemLoadContext: IItemsLoad = useItemsLoad();
    const errorMessage = useErrorMessage();

    const getSolanaBalances = async (): Promise<{wrappedSol: BN, nativeSol: BN}> => {
        // This returns the lamports, and so does the below item ...
        let nativeSolAmount: BN = new BN(await rpcProvider.connection.getBalance(walletContext!.publicKey!));
        let wrappedSolAta = await getAssociatedTokenAddress(
            qpools.constDefinitions.getWrappedSolMint(),
            walletContext!.publicKey!
        );
        let wrappedSolAmount: BN = new BN((await rpcProvider.connection.getTokenAccountBalance(wrappedSolAta)).value.amount);
        return {wrappedSol: wrappedSolAmount, nativeSol: nativeSolAmount}
    }

    /**
     *
     * INSTRUCTIONS TO BUY
     *
     * This model creates a portfolio where the base currency is USDC i.e the user only pays in USDC.
     * The steps 1-3 are permissioned, meaning that the user has to sign client side. The point is to
     * make these instructions fairly small such that they can all be bundled together in one transaction.
     * Create a Portfolio workflow:
     *
     * 1) create_portfolio(ctx,bump,weights,num_pos,amount_total):
     *      ctx: context of the portfolio
     *      bump: bump for the portfolio_pda
     *      weights: the weights in the portfolio (check if sum is normalized)
     *      num_positions: number of positions this portfolio will have
     *      amount: total amount of USDC in the portfolio
     *
     * 2) for position_i in range(num_positions):
     *          approve_position_weight_{PROTOCOL_NAME}(ctx, args)
     *
     * 3) transfer_to_portfolio():
     *      transfers the agreed upon amount to a ATA owned by portfolio_pda
     *
     */
    const buyItem = async () => {

        if (!rpcProvider.userAccount!.publicKey) {
            alert("Please connect your wallet first!");
            return
        }

        console.log("Old allocation data is: ", passedAllocationData);
        let allocationData: Map<string, AllocData> = new Map<string, AllocData>([...passedAllocationData.entries()].filter(([key , value]) => {
          let amount = new BN(value.userInputAmount!.amount.amount);
          if (amount.gtn(0)) {
              return true;
          }
          return false
        }));
        console.log("Making sure the filter didnt fuck up with the allocation data");
        console.log("New allocation data is: ", allocationData);

        if (!allocationData) {
            alert("Please try again in a couple of seconds (We should really fix this error message)");
            return;
        }

        if (allocationData.size < 1) {
            alert("You haven't input any tokens! The portfolio would be empty. Please assign some tokens!");
            return;
        }

        let allocationDataAsArray = Array.from(allocationData.entries());
        if (allocationDataAsArray.length < 1) {
            alert("Somehow no data was passed on to purchase a portfolio ...");
            return;
        }

        // Before starting, make sure the user has at least some SOL ....
        // 1_000_000_000
        if ((await rpcProvider.connection!.getBalance(rpcProvider.userAccount!.publicKey)) < 100_000) {
            // TODO: Gotta redirect her to Moonpay
            errorMessage.addErrorMessage(
                "You don't seem to have enough SOL in your wallet to execute this transaction ...",
                String("")
            );
            return;
        }

        await itemLoadContext.addLoadItem({message: "Sign: Creating Associated Token Accounts"});
        await itemLoadContext.addLoadItem({message: "Sign: Create Portfolio & Sending Asset"});
        await itemLoadContext.addLoadItem({message: "Running cranks to distribute assets across liquidity pools..."});

        /**
         * First, define the weights, and positions
         * The weights will be defined (exactly), by the mSOL and USDC ratio, the total should sum to 1000
         * Until then, assume that we have a weight of 1000 each (this weight thing is confusing when it's multi-asset)
         */

        // // If poolAddresses or weights are empty, don't proceed!
        // if (weights.length === 0 || assetLpMints.length === 0) {
        //     throw Error("Weights or PoolAddresses are empty!");
        // }
        // if (weights.length != assetLpMints.length) {
        //     throw Error("Weights and PoolAddresses do not conform!");
        // }
        // if (!(weights.length > 0)) {
        //     throw Error("All weights are zero! Doesn't make sense to create a portfolio");
        // }

        /**
         * Create Associated Token Accounts for the PDA, if not exists, yet
         */
        console.log("Creating associated token accounts ...");

        /************************************************************************************
         * TRANSACTION 0
         *************************************************************************************/

        /**
         * Calculate how much wrapped sol, vs unwrapped SOL to have
         */
        let wrappedSolLamports: BN = allocationDataAsArray
            .filter(([key, value]) => value.protocol.valueOf() !== qpools.typeDefinitions.interfacingAccount.Protocol.marinade.valueOf())
            .map(([key, value]) => {return new BN(value.userInputAmount!.amount.amount)})
            .reduce((prev, cur) => prev.add(cur), new BN(0));
        let nativeSolLamports: BN = allocationDataAsArray
            .filter(([key, value]) => value.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.marinade.valueOf())
            .map(([key, value]) => {return new BN(value.userInputAmount!.amount.amount)})
            .reduce((prev, cur) => prev.add(cur), new BN(0));

        /**
         * Get all possible input tokens ...
         *  Intersection of whitelisted input tokens, times what ist input through the pools
         */
        let selectedAssetPools: qpools.typeDefinitions.interfacingAccount.ExplicitPool[] = Array.from(allocationData.values()).map((asset) => {
            // If there is no underlying pool, than this is a bug!!
            return asset.pool!
        });
        let inputPoolsAndTokens: [qpools.typeDefinitions.interfacingAccount.ExplicitPool, qpools.typeDefinitions.interfacingAccount.ExplicitToken][] = await getInputTokens(selectedAssetPools);
        let inputPoolsAndTokensAsMap: Map<string, qpools.typeDefinitions.interfacingAccount.ExplicitToken> = new Map<string, qpools.typeDefinitions.interfacingAccount.ExplicitToken>();
        inputPoolsAndTokens.map(([pool, token]: [qpools.typeDefinitions.interfacingAccount.ExplicitPool, qpools.typeDefinitions.interfacingAccount.ExplicitToken]) => {
            inputPoolsAndTokensAsMap.set(pool.lpToken.address, token)
        });
        let uniqueInputTokens: PublicKey[] = inputPoolsAndTokens.map(([_, token]: [qpools.typeDefinitions.interfacingAccount.ExplicitPool, qpools.typeDefinitions.interfacingAccount.ExplicitToken]) => {
            return new PublicKey(token.address);
        });

        /**
         * Create associate token accounts
         *  Depending on the type of protocol, we must first receive the input pools ...
         *  This is the first transaction ...
         */
        let mints: PublicKey[] = selectedAssetPools
            .map((pool: qpools.typeDefinitions.interfacingAccount.ExplicitPool) => {
                return pool.tokens.map((token: qpools.typeDefinitions.interfacingAccount.ExplicitToken) => new PublicKey(token.address))
            }).flat();
        // Also add the lp mints to the ATAs to be created ...
        let lpMints: PublicKey[] = selectedAssetPools
            .map((pool: qpools.typeDefinitions.interfacingAccount.ExplicitPool) => {
                return new PublicKey(pool.lpToken.address)
            });
        mints.push(...lpMints);
        // We assume that the .tokens object carries all the tokens needed to make it run ...
        // TODO: Not sure if this is needed really for all the objects that we input right now ...
        let txAta = await rpcProvider.portfolioObject!.unwrapSolTransaction();
        let txCreateAssociateTokenAccount = await rpcProvider.portfolioObject!.createAssociatedTokenAccounts(
            mints,
            rpcProvider.provider!.wallet
        );
        txAta.add(txCreateAssociateTokenAccount)
        // Can also make an additional instruction which wraps sol again
        let txWrapSol = await rpcProvider.portfolioObject!.wrapSolTransaction(wrappedSolLamports);
        txAta.add(txWrapSol);
        if (txAta.instructions.length > 0) {
            try {
                await sendAndConfirmTransaction(
                    rpcProvider._solbondProgram!.provider,
                    rpcProvider.connection!,
                    txAta
                );
            } catch (error) {
                itemLoadContext.resetCounter();
                console.log(String(error));
                errorMessage.addErrorMessage(
                    "Something went wrong creating the associated token accounts",
                    String(error)
                );
                return;
            }
        }
        await itemLoadContext.incrementCounter();


        /******************
         * Make sure that you have enough wSOL and native SOL for all operations
         */
        // TODO: Make an assert that this number of items is not higher than what we gathered from above ...
        let {wrappedSol, nativeSol} = await getSolanaBalances();
        // Get the SOL balance from the user's wallet
        // Get the wrapped SOL balance from the user's wallet
        console.log("Total Available wrapped and native sol are: ");
        console.log("wrapped vs wallet: ", wrappedSolLamports.toString(), wrappedSol.toString());
        console.log("native vs wallet: ", nativeSolLamports.toString(), nativeSol.toString());

        // And throw an error if this is not the case!!
        console.assert(wrappedSolLamports.lte(wrappedSol));
        if (!wrappedSolLamports.lte(wrappedSol)) {
            itemLoadContext.resetCounter();
            errorMessage.addErrorMessage(
                "You managed to input more wrapped SOL than you have in your wallet! You broke the frontend!",
            );
            return;
        }
        console.assert(nativeSolLamports.lte(nativeSolLamports));
        if (!nativeSolLamports.lte(nativeSolLamports)) {
            itemLoadContext.resetCounter();
            errorMessage.addErrorMessage(
                "You managed to input more native SOL than you have in your wallet! You broke the frontend!",
            );
            return;
        }

        /************************************************************************************
         * TRANSACTION 1
         *************************************************************************************/

        /**
         * Create portfolio signed
         *  Not dependend on the individual items
         */
        let tx: Transaction = new Transaction();
        let IxCreatePortfolioPda = await rpcProvider.portfolioObject!.createPortfolioSigned(
            allocationDataAsArray.map(([key, value]) => new BN(value.weight)),
            lpMints,
            new BN(uniqueInputTokens.length)
        );
        tx.add(IxCreatePortfolioPda);

        /**
         * Add one transaction, where the wrapped SOL is converted to native SOL, or vice-versa, depending on the need ...
         *
         */



        // await Promise.all(allocationDataAsArray.map(async ([key, value]: [string, AllocData], index: number) => {
        //
        // }));

        /**
         *
         * (1) Register Currency Input Portfolio Accounts
         *  Same as associated token accounts, we must first receive the input pools ...
         *  Edge case: skip the case where the input is SOL. I should now really include the "empty" pubkey, of including raw-SOL, for the empty pubkey ...
         *
         *
         * (2) Also transfer to portfolio ..
         *  Same as associated token acounts, we must first receive the input pools, and their values ...
         *
         *
         * (3) Approve Position Weights
         *  Same as associated token accounts, we must first receive the input pools ...
         *
         */
        await Promise.all(allocationDataAsArray.map(async ([key, value]: [string, AllocData], index: number) => {

            // Do all types of checks here
            // And I guess throw an error if that is not the case ...
            // We can catch the error client-side, and display it in some modal or so

            if (!value.userInputAmount) {
                console.log("User input amount was not specified!");
                console.log(value);
                throw Error("User input amount was not specified! " + JSON.stringify(value));
            }
            if (!value.pool) {
                console.log("Pool is not set!!");
                console.log(value);
                throw Error("Pool is not set! " + JSON.stringify(value));
            }

            let currencyAmount: BN = new BN(value.userInputAmount!.amount.amount);
            let currencyMint: PublicKey = value.userInputAmount!.mint;
            let lpAddress: PublicKey = new PublicKey(value.pool!.lpToken.address);
            let weight: BN = new BN(value.weight);

            if (value.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.saber.valueOf()) {

                // Make sure that the input mint is not Native SOL
                let IxRegisterCurrencyInput = await rpcProvider.portfolioObject!.registerCurrencyInputInPortfolio(
                    currencyAmount,
                    currencyMint
                );
                tx.add(IxRegisterCurrencyInput);

                let IxApprovePositionWeightSaber = await rpcProvider.portfolioObject!.approvePositionWeightSaber(
                    lpAddress,
                    currencyAmount,
                    new BN(0),  // Will be flipped in the backend .. // Should probably remove the tokenB argument ...
                    new BN(0),
                    index,  // Hardcoded
                    weight
                )
                tx.add(IxApprovePositionWeightSaber);

                let IxSendUsdcToPortfolio = await rpcProvider.portfolioObject!.transfer_to_portfolio(value.userInputAmount!.mint);
                tx.add(IxSendUsdcToPortfolio);

            } else if (value.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.marinade.valueOf()) {
                let lamports = new BN(value.userInputAmount!.amount.amount);
                // TODO: Turn the excess lamports into wrapped SOL (add a send + create-native-sync instruction for this)
                if (lamports.lt(new BN(10 ** 9))) {
                    errorMessage.addWarningMessage("To utilize Marinade, you need to input at least 1SOL", "You have inputted this number of lamports: " + lamports.toString());
                    // throw Error()
                }
                let IxApprovePositionWeightMarinade = await rpcProvider.portfolioObject!.approvePositionWeightMarinade(
                    currencyAmount,
                    index,
                    weight
                );
                tx.add(IxApprovePositionWeightMarinade);

            } else if (value.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.solend.valueOf()) {

                let IxApprovePositionWeightSolend = await rpcProvider.portfolioObject!.approvePositionWeightSolend(
                    currencyMint,
                    currencyAmount,
                    index,
                    weight
                )
                tx.add(IxApprovePositionWeightSolend);

                // TODO: Double-check if you need this for solend ...
                let IxSendUsdcToPortfolio = await rpcProvider.portfolioObject!.transfer_to_portfolio(value.userInputAmount!.mint);
                tx.add(IxSendUsdcToPortfolio);

            } else {
                console.log("Protocol is not valid!");
                throw Error("Protocol is not valid! " + JSON.stringify(value));
            }
        }));


        // TODO: Turn the excess lamports into wrapped SOL (add a send + create-native-sync instruction for this)
        //  Or vice-versa

        /**
         * Finally, send some SOL to the crank wallet s.t. the cranks can be executed
         */
        console.log("Depositing some SOL to run the cranks ...");
        // This much SOL should suffice for now probably ...
        let IxSendToCrankWallet = await rpcProvider.portfolioObject!.sendToCrankWallet(
            localKeypairProvider.localTmpKeypair!.publicKey,
            lamportsReserversForLocalWallet
        );
        tx.add(IxSendToCrankWallet);
        console.log("Sending and signing the transaction");
        console.log("Provider is: ");
        console.log(rpcProvider._solbondProgram!.provider);
        console.log(rpcProvider._solbondProgram!.provider.wallet.publicKey.toString());
        try {
            await sendAndConfirmTransaction(
                rpcProvider._solbondProgram!.provider,
                rpcProvider.connection!,
                tx
            );
        } catch (error) {
            itemLoadContext.resetCounter();
            errorMessage.addErrorMessage(
                "Something went wrong creating the portfolio",
                String(error)
            );
            return;
        }
        await itemLoadContext.incrementCounter();

        /************************************************************************************
         * TRANSACTION 2
         *************************************************************************************/

        /**
         * Run cranks
         *  Again, dependent on the protocol
         */
        // Fetch all positions, and fulfill them ...
        await Promise.all(allocationDataAsArray.map(async ([key, value]: [string, AllocData], index: number) => {
            console.log("Fulfilling permissionles ...");
            console.log(value);
            if (value.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.saber.valueOf()) {
                try {
                    let sgPermissionlessFullfillSaber = await crankProvider.crankRpcTool!.permissionlessFulfillSaber(index);
                    console.log("Fulfilled sg Saber is: ", sgPermissionlessFullfillSaber);
                } catch (error) {
                    itemLoadContext.resetCounter();
                    console.log(String(error));
                    errorMessage.addErrorMessage(
                        "Fulfilling the Saber Protocol failed.",
                        String(error)
                    );
                    return;
                }
            } else if (value.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.marinade.valueOf()) {
                try {
                    let sgPermissionlessFullfillMarinade = await crankProvider.crankRpcTool!.createPositionMarinade(index);
                    console.log("Fulfilled sg Marinade is: ", sgPermissionlessFullfillMarinade);
                } catch (error) {
                    itemLoadContext.resetCounter();
                    console.log(String(error));
                    errorMessage.addErrorMessage(
                        "Fulfilling the Marinade Protocol failed.",
                        String(error)
                    );
                    return;
                }
            } else if (value.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.solend.valueOf()) {
                // Is there any way to do safe typecasting ... (?)
                let solendPool = value.pool as qpools.typeDefinitions.interfacingAccount.ExplicitSolendPool;
                try {
                    // TODO: createPositionSolend ==> requires the Solend one
                    // The last two variables are hard-coded and wrong!
                    let sgPermissionlessFullfillSolend = await crankProvider.crankRpcTool!.createPositionSolend(
                        index,
                        solendPool.solendAction
                    );
                    console.log("Fulfilled sg Marinade is: ", sgPermissionlessFullfillSolend);
                } catch (error) {
                    itemLoadContext.resetCounter();
                    console.log(String(error));
                    errorMessage.addErrorMessage(
                        "Fulfilling the Marinade Protocol failed.",
                        String(error)
                    );
                    return;
                }
            } else {
                console.log("Not all cranks could be fulfilled!!");
                console.log(value);
                // throw Error("Not all cranks could be fulfilled!! " + JSON.stringify(value));
                errorMessage.addErrorMessage(
                    "Some Protocol outside has been specified!",
                    "Not all cranks have been fulfilled, this protocool was not found: " + JSON.stringify(value)
                );
                return;
            }
            return;
        }));
        await itemLoadContext.incrementCounter();
        console.log("Updating price ...");
        // Add another Counter "running cranks"
        await rpcProvider.makePriceReload();
        console.log("Done Purchasing!");
        // TODO: Display a message "Portfolio created"!
    }

    return (
        <>
            <button
                type="button"
                // py-2.5
                className="px-10 h-12 my-auto bg-pink-700 text-white text-md font-semibold leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                onClick={() => {
                    console.log("Redeem stupid Position");
                    buyItem();
                }}
            >
                Deposit
            </button>
        </>
    )

}
