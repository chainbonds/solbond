import React from "react";
import {BN} from "@project-serum/anchor";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import {PublicKey, Transaction} from "@solana/web3.js";
import {getInputTokens, sendAndConfirmTransaction} from "../../../utils/utils";
import {IItemsLoad, useItemsLoad} from "../../../contexts/ItemsLoadingContext";
import {ICrank, useCrank} from "../../../contexts/CrankProvider";
import {ILocalKeypair, useLocalKeypair} from "../../../contexts/LocalKeypairProvider";
import {AllocData} from "../../../types/AllocData";
import {registry, Protocol} from "@qpools/sdk";
import {Property} from "csstype";
import All = Property.All;
import {getCurrentHub} from "@sentry/hub";

// TODO: Refactor the code here ... looks a bit too redundant.
//  Maybe try to push the logic into the sdk?
interface Props {
    allocationData: Map<string, AllocData>
}

// Gotta have as input the wallet assets
export default function PurchaseButton({allocationData}: Props) {

    const rpcProvider: IRpcProvider = useRpc();
    const crankProvider: ICrank = useCrank();
    const localKeypairProvider: ILocalKeypair = useLocalKeypair();
    const itemLoadContext: IItemsLoad = useItemsLoad();

    // TODO: Get all assets and protocols through the context. Also, perhaps instead of if protocolType, just directly also record the protocol itself ...
    const buyItem = async () => {

        // let valueInUsdc = props.valueInUsdc;
        if (!rpcProvider.userAccount!.publicKey) {
            alert("Please connect your wallet first!");
            return
        }

        // Also make sure that the portfolio was loaded ...
        if (!allocationData) {
            alert("Please try again in a couple of seconds (We should really fix this error message)");
            return
        }

        // Parse allocation data also as a array ...
        let allocationDataAsArray = Array.from(allocationData.entries());

        // Gotta check if the amounts exist ...
        // if (!userWalletProvider.walletAssets) {
        //     alert("Please try again in a couple of seconds (We should really fix this error message) 2");
        //     return
        // }

        // TODO: Add this
        // if ((typeof valueInUsdc) != number) {
        //     throw Error("Value in USDC is not a number");
        // }

        await itemLoadContext.addLoadItem({message: "Preparing Transaction"});
        await itemLoadContext.addLoadItem({message: "(Sign): Creating Associated Token Accounts"});
        await itemLoadContext.addLoadItem({message: "Sign: Create Portfolio & Sending Asset"});
        await itemLoadContext.addLoadItem({message: "Running cranks to distribute assets across liquidity pools..."});

        // Define mSOL send amount
        // Define USDC send amount

        // ==> Let that be like part of the wallet
        // We can also airdrop some stuff for now


        // Define the same for wrapped SOL, lol

        // For all LP tokens

        // Define all LP tokens here, and also their respective assets
        // Which should also allow for more assets
        // TODO: Remove this hardcoded values, and look these up from the backend JSON API
        // let USDC_mint = new PublicKey("2tWC4JAdL4AxEFJySziYJfsAnW2MHKRo98vbAPiRDSk8");
        // let USDC_USDT_pubkey: PublicKey = new PublicKey("VeNkoB1HvSP6bSeGybQDnx9wTWFsQb2NBCemeCDSuKL");  // This is the pool address, not the LP token ...
        // let mSolLpToken: PublicKey = new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So");  // Assume the LP token to be the denominator for what underlying asset we target ...

        // TODO: Maybe just refactor this shitty purchase button as well...
        // Should iterate through all, one by one, and based on the protocol, apply some logic here, apply some logic there

        // let assetLpMints = [USDC_USDT_pubkey, mSolLpToken];
        let assetLpMints: PublicKey[] = await Promise.all(Array.from(allocationData.entries()).map(async (entry: [string, AllocData], index: number) => {
            let key = entry[0];
            let value = entry[1];
            console.log("Value LP is: ", value.userInputAmount!.mint);
            return new PublicKey(value.userInputAmount!.mint);
        }));
        let weights: BN[] = await Promise.all(Array.from(allocationData.entries()).map(async (entry: [string, AllocData], index: number) => {
            let key = entry[0];
            let value = entry[1];
            return new BN(value.weight);
        }));

        /**
         * First, define the weights, and positions
         * The weights will be defined (exactly), by the mSOL and USDC ratio, the total should sum to 1000
         * Until then, assume that we have a weight of 1000 each (this weight thing is confusing when it's multi-asset)
         */
        // Make sure each one does not have null values
        assetLpMints = assetLpMints.filter((mint: PublicKey, index: number) => {
            return weights[index].gt(new BN(0))
        });
        weights = weights.filter((weight: BN) => {
            return weight.gt(new BN(0))
        });

        // TODO: Also filter out that that the amount paid is bigger than 0 (and bigger than 1 for marinade...)

        // Filter these, if any is 0
        // TODO: Not going for this right now. Just check that the user actually has enough balance in his wallet

        // If poolAddresses or weights are empty, don't proceed!
        if (weights.length === 0 || assetLpMints.length === 0) {
            throw Error("Weights or PoolAddresses are empty!");
        }
        if (weights.length != assetLpMints.length) {
            throw Error("Weights and PoolAddresses do not conform!");
        }
        if (!(weights.length > 0)) {
            throw Error("All weights are zero! Doesn't make sense to create a portfolio");
        }


        /**
         *
         * INSTRUCTIONS TO BUY
         * TODO: Modify this according to the new version
         *
         * This model creates a portfolio where the base currency is USDC i.e the user only pays in USDC.
         * The steps 1-3 are permissioned, meaning that the user has to sign client side. The point is to
         * make these instructions fairly small such that they can all be bundled together in one transaction.
         * Create a Portfolio workflow:
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

        // Split it up into multiple transactions ...
        /**
         * Create Associated Token Accounts for the PDA, if not exists, yet
         */
        // TODO: Gotta normalize weights up to 1000
        // TODO:
        // Have a look at this; but this is still needed!
        await itemLoadContext.incrementCounter();
        console.log("Creating associated token accounts ...");
        // TODO: Create separate LPs for Saber, and the other LPs

        // Do all the logic here ...

        /************************************************************************************
         * TRANSACTION 0
         *************************************************************************************/

        /**
         * Get all possible input tokens ...
         *  Intersection of whitelisted input tokens, times what ist input through the pools
         */
        let selectedAssetPools: registry.ExplicitPool[] = Array.from(allocationData.values()).map((asset) => {
            // If there is no underlying pool, than this is a bug!!
            return asset.pool!
        });
        let inputPoolsAndTokens: [registry.ExplicitPool, registry.ExplicitToken][] = getInputTokens(selectedAssetPools);
        let inputPoolsAndTokensAsMap: Map<string, registry.ExplicitToken> =  new Map<string, registry.ExplicitToken>();
        inputPoolsAndTokens.map(([pool, token]: [registry.ExplicitPool, registry.ExplicitToken]) => {
                inputPoolsAndTokensAsMap.set(pool.lpToken.address, token)
        });

        /**
         * Create associate token accounts
         *  Depending on the type of protocol, we must first receive the input pools ...
         *  This is the first transaction ...
         */
        let mints: PublicKey[] = inputPoolsAndTokens.map(([pool, token]: [registry.ExplicitPool, registry.ExplicitToken]) => new PublicKey(token.address));
        let txCreateAssociateTokenAccount = await rpcProvider.portfolioObject!.createAssociatedTokenAccounts(
            mints,
            rpcProvider.provider!.wallet
        );
        if (txCreateAssociateTokenAccount.instructions.length > 0) {
            await sendAndConfirmTransaction(
                rpcProvider._solbondProgram!.provider,
                rpcProvider.connection!,
                txCreateAssociateTokenAccount
            );
        }
        await itemLoadContext.incrementCounter();

        /************************************************************************************
         * TRANSACTION 1
         *************************************************************************************/

        /**
         * Create portfolio signed
         *  Not dependend on the individual items
         */
        let tx: Transaction = new Transaction();
        let IxCreatePortfolioPda = await rpcProvider.portfolioObject!.createPortfolioSigned(
            weights,
            assetLpMints
        );
        tx.add(IxCreatePortfolioPda);

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

            if (value.protocol === Protocol.saber) {

                // Make sure that the input mint is not Native SOL

                let IxRegisterCurrencyInput = await rpcProvider.portfolioObject!.registerCurrencyInputInPortfolio(
                    currencyAmount,
                    currencyMint // Is the mint here the currency ... (?). If not, then replace this by getInputTokens from pool ... // Or fix this root-level
                );
                tx.add(IxRegisterCurrencyInput);

                let IxApprovePositionWeightSaber = await rpcProvider.portfolioObject!.approvePositionWeightSaber(
                    lpAddress,
                    currencyAmount,
                    new BN(0),  // Will be flipped in the backend .. // Shoudl probably remove the tokenB argument ...
                    new BN(0),
                    index,  // Hardcoded
                    weight
                )
                tx.add(IxApprovePositionWeightSaber);

                let IxSendUsdcToPortfolio = await rpcProvider.portfolioObject!.transfer_to_portfolio(value.userInputAmount!.mint);
                tx.add(IxSendUsdcToPortfolio);

            } else if (value.protocol === Protocol.marinade) {
                let lamports = new BN(value.userInputAmount!.amount.amount);
                if (lamports.lt(new BN(10 ** 9))) {
                    throw Error("To utilize Marinade, you need to input at least 1SOL")
                }

                let IxApprovePositionWeightMarinade = await rpcProvider.portfolioObject!.approvePositionWeightMarinade(
                    currencyAmount,
                    index,
                    weight
                );
                tx.add(IxApprovePositionWeightMarinade);

            } else {
                console.log("Protocol is not valid!");
                throw Error("Protocol is not valid! " + JSON.stringify(value));
            }
        }));

        /**
         * Finally, send some SOL to the crank wallet s.t. the cranks can be executed
         */
        console.log("Depositing some SOL to run the cranks ...");
        // This much SOL should suffice for now probably ...
        let IxSendToCrankWallet = await rpcProvider.portfolioObject!.sendToCrankWallet(
            localKeypairProvider.localTmpKeypair!.publicKey,
            50_000_000
        );
        tx.add(IxSendToCrankWallet);
        await itemLoadContext.incrementCounter();

        console.log("Sending and signing the transaction");
        console.log("Provider is: ");
        console.log(rpcProvider._solbondProgram!.provider);
        console.log(rpcProvider._solbondProgram!.provider.wallet.publicKey.toString());
        await sendAndConfirmTransaction(
            rpcProvider._solbondProgram!.provider,
            rpcProvider.connection!,
            tx
        );
        await itemLoadContext.incrementCounter();

        /************************************************************************************
         * TRANSACTION 2
         *************************************************************************************/

        /**
         * Run cranks
         *  Again, dependent on the protocol
         */
        await Promise.all(allocationDataAsArray.map(async ([key, value]: [string, AllocData], index: number) => {
            if (value.protocol === Protocol.saber) {
                let sgPermissionlessFullfillSaber = await crankProvider.crankRpcTool!.permissionlessFulfillSaber(index);
                console.log("Fulfilled sg Saber is: ", sgPermissionlessFullfillSaber);
            } else if (value.protocol === Protocol.marinade) {
                let sgPermissionlessFullfillMarinade = await crankProvider.crankRpcTool!.createPositionMarinade(index);
                console.log("Fulfilled sg Marinade is: ", sgPermissionlessFullfillMarinade);
            } else {
                console.log("Not all cranks could be fulfilled!!");
                console.log(value);
                throw Error("Not all cranks could be fulfilled!! " + JSON.stringify(value));
            }
        }));
        await itemLoadContext.incrementCounter();
        console.log("Updating price ...");
        // Add another Counter "running cranks"
        await rpcProvider.makePriceReload();
        console.log("Done Purchasing!");



























            /***
         * LEGACY OLD PURCHASE BUTTON
         */















        // let txCreateATA: Transaction = await rpcProvider.portfolioObject!.createAssociatedTokenAccounts([assetLpMints[0]], , rpcProvider.provider!.wallet);
        // if (txCreateATA.instructions.length > 0) {
        //     await sendAndConfirmTransaction(
        //         rpcProvider._solbondProgram!.provider,
        //         rpcProvider.connection!,
        //         txCreateATA
        //     );
        // }
        // await itemLoadContext.incrementCounter();

        // // TODO: change depending on user input
        // let valueInUsdc: number = 2;
        // let AmountUsdc: BN = new BN(valueInUsdc).mul(new BN(10 ** MOCK.DEV.SABER_USDC_DECIMALS));
        // let valueInSol: number = 1;
        // // I guess mSOL has 9 decimal points
        // let AmountSol: BN = new BN(valueInSol).mul(new BN(10 ** 9));
        // console.log("Total amount in Usdc is: ", valueInUsdc);
        //
        // if (!(valueInUsdc > 0)) {
        //     throw Error("Amount to be paid in must be bigger than 0");
        // }

        // Gotta iterate over alloc-data, and create a position for each !!!

        /**
         *
         * Transaction 1:
         * - Create Signed Portfolio
         * - Register the Currencies that the PortfolioPDA will posses
         * - Send the Currencies to Portfolio
         *
         */
        // TODO: Should not be a try catch around
        // console.log("Creating Portfolio");
        // let tx: Transaction = new Transaction();
        // let IxCreatePortfolioPda = await rpcProvider.portfolioObject!.createPortfolioSigned(
        //     weights,
        //     assetLpMints
        // );
        // tx.add(IxCreatePortfolioPda);

        console.log("Transfer Asset to Portfolio");
        // TODO: Check if they exist, if they already do exist, don't rewrite these ...
        // TODO: => Make an if-else statement, depending on whether this is USDC or mSOL. If this is bare SOL, you should skip this ...
        // TODO: ==> Gotta turn this into a
        // await Promise.all(Array.from(allocationData.entries()).map(async (entry: [string, AllocData], index: number) => {
        //
        //     let key: string = entry[0]
        //     let value: AllocData = entry[1];
        //
        //     // TODO: Get currency mint
        //     let currencyMint: PublicKey = value.userInputAmount!.mint;
        //     let currencyAmount: BN = new BN(value.userInputAmount!.amount.amount);
        //     // If this doesn't work, we have a bug! It must be filtered beforehand in the program-flow before
        //
        //     // Skip it
        //
        //     // Do a weird dictionary reading ... (?)
        //     if (value.protocol === Protocol.saber) {
        //         let IxRegisterCurrencyInput = await rpcProvider.portfolioObject!.registerCurrencyInputInPortfolio(
        //             currencyAmount,
        //             currencyMint
        //         );
        //         tx.add(IxRegisterCurrencyInput);
        //     } else if (value.protocol === Protocol.marinade) {
        //         // Let it fail if Marinade has less than 1 !
        //         if (currencyAmount.lt(new BN(1_000_000_000))) {
        //             alert("If you want to pay into marinade finance, you need to at least pay in 1SOL");
        //             return;
        //         }
        //     } else {
        //         console.log("Not all cranks could be fulfilled!!");
        //         console.log(value);
        //         throw Error("Not all cranks could be fulfilled!! " + JSON.stringify(value));
        //     }
        // }));

        // Create position approve for marinade, and the saber pool (again, hardcode this part lol).
        // Later these should be fetched from the frontend.
        console.log("Approve Position Saber");

        // Iterate through all items in AllocData
        // /**
        //  * Now do Saber
        //  */
        // await Promise.all(Array.from(allocationData.entries()).map(async (entry: [string, AllocData], index: number) => {
        //
        //     let key: string = entry[0]
        //     let value: AllocData = entry[1];
        //
        //     // Do a weird dictionary reading ... (?)
        //     if (value.protocol != Protocol.saber) {
        //         return;
        //     }
        //
        //     if (!value.userInputAmount) {
        //         console.log("User input amount was not specified!");
        //         console.log(value);
        //         throw Error("User input amount was not specified! " + JSON.stringify(value));
        //     }
        //
        //     console.log("Value is: ", value);
        //
        //     // Also get the value from the allocKey item
        //     let amount = new BN(value.userInputAmount!.amount.amount);
        //     let weight = new BN(value.weight);
        //
        // }));

        // /**
        //  * Now do Marinade
        //  */
        // // TODO: Let's hope that async map keeps order : if there is a bug with the orders, this is probably the first thing to check ...
        // await Promise.all(Array.from(allocationData.entries()).map(async (entry: [string, AllocData], index: number) => {
        //
        //     let key: string = entry[0]
        //     let value: AllocData = entry[1];
        //     // Do a weird dictionary reading ... (?)
        //     if (value.protocol != Protocol.marinade) {
        //         return;
        //     }
        //     if (!value.userInputAmount) {
        //         console.log("User input amount was not specified!");
        //         console.log(value);
        //         throw Error("User input amount was not specified! " + JSON.stringify(value));
        //     }
        //     // Also get the value from the allocKey item
        //     let amount = new BN(value.userInputAmount!.amount.amount);
        //     // Assert that the amount here is greater than 1!
        //     let weight = new BN(value.weight);
        //     let IxApprovePositionWeightMarinade = await rpcProvider.portfolioObject!.approvePositionWeightMarinade(
        //         amount,
        //         index,
        //         weight
        //     );
        //     tx.add(IxApprovePositionWeightMarinade);
        // }));

        /**
         * Now transfer the funds (if it hasn't been done so already)
         */
        // Also make a map statement here ...
        // await Promise.all(Array.from(allocationData.entries()).map(async (entry: [string, AllocData], index: number) => {
        //
        //     let key: string = entry[0]
        //     let value: AllocData = entry[1];
        //
        //     // Do a weird dictionary reading ... (?)
        //     if (value.protocol === Protocol.marinade) {
        //         return;
        //     }
        //     let currencyMint = value.userInputAmount!.mint;
        //     // TODO: Is this set ... (?) Double-check where and how
        //     let IxSendUsdcToPortfolio = await rpcProvider.portfolioObject!.transfer_to_portfolio(currencyMint);
        //     tx.add(IxSendUsdcToPortfolio);
        // }));

        // console.log("Depositing some SOL to run the cranks ...");
        // // This much SOL should suffice for now probably ...
        // let IxSendToCrankWallet = await rpcProvider.portfolioObject!.sendToCrankWallet(
        //     localKeypairProvider.localTmpKeypair!.publicKey,
        //     50_000_000
        // );
        // tx.add(IxSendToCrankWallet);
        // await itemLoadContext.incrementCounter();
        //
        // console.log("Sending and signing the transaction");
        // console.log("Provider is: ");
        // console.log(rpcProvider._solbondProgram!.provider);
        // console.log(rpcProvider._solbondProgram!.provider.wallet.publicKey.toString());
        // await sendAndConfirmTransaction(
        //     rpcProvider._solbondProgram!.provider,
        //     rpcProvider.connection!,
        //     tx
        // );
        // await itemLoadContext.incrementCounter();

        /**
         *
         * Transaction 2 (Cranks):
         *
         */
        console.log("Permissoinlessly fulfilling the transactions");
        // await qPoolContext.crankRpcTool!.fullfillAllPermissionless();
        // For now, don't do a forloop, just fulfill the two positions
        // Again, run the loops here ...
        await Promise.all(Array.from(allocationData.entries()).map(async (entry: [string, AllocData], index: number) => {

            let key: string = entry[0]
            let value: AllocData = entry[1];

            // Do a weird dictionary reading ... (?)
            if (value.protocol === Protocol.saber) {
                let sgPermissionlessFullfillSaber = await crankProvider.crankRpcTool!.permissionlessFulfillSaber(index);
                console.log("Fulfilled sg Saber is: ", sgPermissionlessFullfillSaber);
            } else if (value.protocol === Protocol.marinade) {
                let sgPermissionlessFullfillMarinade = await crankProvider.crankRpcTool!.createPositionMarinade(index);
                console.log("Fulfilled sg Marinade is: ", sgPermissionlessFullfillMarinade);
            } else {
                console.log("Not all cranks could be fulfilled!!");
                console.log(value);
                throw Error("Not all cranks could be fulfilled!! " + JSON.stringify(value));
            }
        }));
        await itemLoadContext.incrementCounter();

        console.log("Updating price ...");
        // Add another Counter "running cranks"
        await rpcProvider.makePriceReload();

        console.log("Done!");


        /**
         *
         * Transaction: START OF OLD IMPLEMENTATION
         *
         */
        // TODO: =======> START OF OLD IMPLEMENTATION
        // /**
        //  * Send USDC to the portfolio. Later on, we can create instructions to send all assets into the portfolio
        //  */
        // // Finally, also transfer the USDC to the portfolio
        // // Only create this portfolio, if it doesn't exist ...
        // // TODO: Create portfolio should be able to be called multiple times
        //
        // console.log("Adding createPortfolioSigned");
        // // let IxCreatePortfolioPda: TransactionInstruction = await qPoolContext.portfolioObject!.createPortfolioSigned(
        // //     weights,
        // //     poolAddresses,
        // //     sendAmount
        // // );
        // tx.add(IxCreatePortfolioPda);
        // console.log("Adding transferUsdcFromUserToPortfolio");
        // let IxSendUsdcToPortfolio = await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio();
        // tx.add(IxSendUsdcToPortfolio);
        // await itemLoadContext.incrementCounter();
        //
        // console.log("Other instructions ...");
        // // TODO: Gotta double-check if A or B is the right one
        // // Get the user's complete tokenA, and do tokenA times weight to be deposited here
        // // Get the user's complete tokenB, and do tokenB times weight to be deposited here
        // // Same for every pool
        //
        // let instructionsBeforeAdding: number = tx.instructions.length;
        //
        // // Calculate according to totalSendAmount
        // await Promise.all(poolAddresses.map(async (poolAddress: PublicKey, index: number) => {
        //
        //     const stableSwapState = await qPoolContext.portfolioObject!.getPoolState(poolAddress);
        //     const {state} = stableSwapState;
        //
        //     let amountA = new BN(0);
        //     let amountB = new BN(0);
        //
        //     // Now make an if-else, based on which mintA or mintB corresponds to the USDC
        //     if ((new PublicKey(MOCK.DEV.SABER_USDC)).equals(state.tokenA.mint)) {
        //         // On a separate occasion, check if the sendAmount is higher than the max amount, etc.
        //         amountA = sendAmount;
        //     } else if ((new PublicKey(MOCK.DEV.SABER_USDC)).equals(state.tokenB.mint)) {
        //         amountB = sendAmount;
        //     } else {
        //         console.log('Saber USDC does not correspond to either entity!');
        //         return
        //     }
        //
        //     console.log("Amount before multiply by weight is.. ", amountA.toString());
        //     console.log("Amount before multiply by weight is.. ", amountB.toString());
        //     console.log("Condition1: ", !amountA.eq(new BN(0)));
        //     console.log("Condition2: ", !amountB.eq(new BN(0)));
        //
        //     // Only initiate this transaction, if either of amountA or amountB is not zero
        //     if (!(amountA.eq(new BN(0)) && amountB.eq(new BN(0)))) {
        //         // Gotta translate to BN, or otherwise there will be truncation errors!
        //         let weight = weights[index];
        //         // denominator
        //         let weightDenominator = weights.reduce((a, b) => {return a.add(b)}, new BN(0));
        //         console.log("Weight denominator is: ", weightDenominator)
        //         amountA = weight.mul(amountA).div(weightDenominator);
        //         amountB = weight.mul(amountB).div(weightDenominator);
        //         console.log("Amount after multiply weight is.. ", amountA.toString());
        //         console.log("Amount after multiply weight is.. ", amountB.toString());
        //         let IxApprovePositionWeightSaber = await qPoolContext.portfolioObject!.approvePositionWeightSaber(
        //             poolAddresses,
        //             amountA,
        //             amountB,
        //             new BN(0),
        //             index,
        //             weight
        //         );
        //         tx.add(IxApprovePositionWeightSaber);
        //     }
        //
        // }));
        //
        // if (instructionsBeforeAdding === tx.instructions.length) {
        //     throw Error("No positions added, aborting transaction!");
        // }
        //
        // // Finally, send some funds to the local tmp keypair
        // // By default, just send some SOL
        // // For now, just send 0.1 SOL to the crank wallet. This should be enough.
        // // We can send this back, when the items are redeemed
        // let IxSendToCrankWallet = await qPoolContext.portfolioObject!.sendToCrankWallet(
        //     qPoolContext.localTmpKeypair!.publicKey,
        //     100_000_000
        // );
        // tx.add(IxSendToCrankWallet);
        //
        // // Now sign this transaction
        // await sendAndConfirmTransaction(
        //     qPoolContext._solbondProgram!.provider,
        //     qPoolContext.connection!,
        //     tx,
        //     qPoolContext.userAccount!.publicKey
        // );
        // await itemLoadContext.incrementCounter();
        //
        // // TODO: Should be taken from positions, not from the saved list!
        // // Perhaps you should encapsulate all this logic in a separate "run-all-cranks" function
        // // Now run cranks. Get all positions that were created. Iterate through all. And execute all of them.
        // // positionAccount
        // await qPoolContext.crankRpcTool!.fullfillAllPermissionless();
        // await itemLoadContext.incrementCounter();
        // // Add another Counter "running cranks"
        // await qPoolContext.makePriceReload();

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
