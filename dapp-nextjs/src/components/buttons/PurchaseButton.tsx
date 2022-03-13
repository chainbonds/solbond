import React, {useEffect, useState} from "react";
import {BN} from "@project-serum/anchor";
import {AllocData, IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {Promise} from "es6-promise";
import {useWallet} from "@solana/wallet-adapter-react";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {MOCK} from "@qpools/sdk";

export default function PurchaseButton(props: any) {

    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const itemLoadContext = useItemsLoad();

    const [totalAmountInUsdc, setTotalAmountInUsdc] = useState<number>(0.);
    useEffect(() => {
        if (props.valueInUsdc) {
            console.log("Defined!: ", props.valueInUsdc);
            setTotalAmountInUsdc(props.valueInUsdc);
        } else {
            console.log("WARNING: Prop is empty!", props.valueInUsdc);
        }
    }, [props.valueInUsdc]);

    const buyItem = async () => {

        if (!qPoolContext.userAccount!.publicKey) {
            alert("Please connect your wallet first!");
            return
        }

        // Also make sure that the portfolio was loaded ...
        if (!qPoolContext.portfolioRatios) {
            alert("Please try again in a couple of seconds (We should really fix this error message)");
            return
        }

        if (!qPoolContext.portfolioRatios[0].pool) {
            alert("Please try again in a couple of seconds (We should really fix this error message) 2");
            return
        }

        await itemLoadContext.addLoadItem({message: "Preparing Transaction"});
        await itemLoadContext.addLoadItem({message: "(Sign): Creating Associated Token Accounts"});
        await itemLoadContext.addLoadItem({message: "Sign: Create Portfolio & Send USDC"});
        await itemLoadContext.addLoadItem({message: "Sign: Register Portfolio & Pools"});
        await itemLoadContext.addLoadItem({message: "Running cranks to distribute assets across liquidity pools..."});

        // Initialize if not initialized yet
        await qPoolContext.initializeQPoolsUserTool(walletContext);
        await itemLoadContext.incrementCounter();

        console.log("Total amount in Usdc is: ", totalAmountInUsdc);
        const sendAmount: BN = new BN(totalAmountInUsdc).mul(new BN(10**MOCK.DEV.SABER_USDC_DECIMALS));

        // Again, these weights need to be retrieved from the Serpius API
        let weights: BN[] = qPoolContext.portfolioRatios
            .filter((item: AllocData) => {return item.weight > 0})
            .map((item: AllocData) => {return new BN(item.weight)});
        let poolAddresses: PublicKey[] = qPoolContext.portfolioRatios
            .filter((item: AllocData) => {return item.weight > 0})
            .map((item: AllocData) => {return new PublicKey(item.pool!.swap.config.swapAccount)});

        // If poolAddresses or weights are empty, don't proceed!
        if (weights.length === 0 || poolAddresses.length === 0) {
            throw Error("Weights or PoolAddresses are empty!");
        }
        if (weights.length != poolAddresses.length) {
            throw Error("Weights and PoolAddresses do not conform!");
        }

        // TODO: Gotta normalize weights up to 1000
        /**
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

        /**
         * Create Associated Token Accounts for the PDA, if not exists, yet
         */
            // Have a look at this; but this is still needed!
        let tx1: Transaction = new Transaction();
        let ixList1: TransactionInstruction[] = await qPoolContext.portfolioObject!.registerAtaForLiquidityPortfolio(poolAddresses);
        ixList1.map((x: TransactionInstruction) => {tx1.add(x)});
        if (tx1.instructions.length > 0) {
            console.log("Sending the first set of transactions!!");
            await sendAndConfirmTransaction(
                qPoolContext._solbondProgram!.provider,
                qPoolContext.connection!,
                tx1,
                qPoolContext.userAccount!.publicKey
            );
        }
        await itemLoadContext.incrementCounter();

        /**
         * Send USDC to the portfolio. Later on, we can create instructions to send all assets into the portfolio
         */
        // Finally, also transfer the USDC to the portfolio
        console.log("Creating Portfolio");
        let tx: Transaction = new Transaction();
        // Only create this portfolio, if it doesn't exist ...
        // TODO: Create portfolio should be able to be called multiple times

        console.log("Adding createPortfolioSigned");
        let IxCreatePortfolioPda: TransactionInstruction = await qPoolContext.portfolioObject!.createPortfolioSigned(
            weights,
            poolAddresses,
            sendAmount
        );
        tx.add(IxCreatePortfolioPda);
        console.log("Adding transferUsdcFromUserToPortfolio");
        let IxSendUsdcToPortfolio = await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio();
        tx.add(IxSendUsdcToPortfolio);
        await itemLoadContext.incrementCounter();

        console.log("Other instructions ...");
        // TODO: Gotta double-check if A or B is the right one
        // Get the user's complete tokenA, and do tokenA times weight to be deposited here
        // Get the user's complete tokenB, and do tokenB times weight to be deposited here
        // Same for every pool

        // Calculate according to totalSendAmount
        await Promise.all(poolAddresses.map(async (poolAddress: PublicKey, index: number) => {

            const stableSwapState = await qPoolContext.portfolioObject!.getPoolState(poolAddress);
            const {state} = stableSwapState;

            let amountA = new BN(0);
            let amountB = new BN(0);

            // Now make an if-else, based on which mintA or mintB corresponds to the USDC
            if ((new PublicKey(MOCK.DEV.SABER_USDC)).equals(state.tokenA.mint)) {
                // On a separate occasion, check if the sendAmount is higher than the max amount, etc.
                amountA = sendAmount;
            } else if ((new PublicKey(MOCK.DEV.SABER_USDC)).equals(state.tokenB.mint)) {
                amountB = sendAmount;
            } else {
                console.log('Saber USDC does not correspond to either entity!');
                return
            }

            console.log("Amount before multiply by weight is.. ", amountA.toString());
            console.log("Amount before multiply by weight is.. ", amountB.toString());
            console.log("Condition1: ", !amountA.eq(new BN(0)));
            console.log("Condition2: ", !amountB.eq(new BN(0)));

            // Only initiate this transaction, if either of amountA or amountB is not zero
            if (!(amountA.eq(new BN(0)) && amountB.eq(new BN(0)))) {
                // Gotta translate to BN, or otherwise there will be truncation errors!
                let weight = weights[index];
                // denominator
                let weightDenominator = weights.reduce((a, b) => {return a.add(b)}, new BN(0));
                console.log("Weight denominator is: ", weightDenominator)
                amountA = weight.mul(amountA).div(weightDenominator);
                amountB = weight.mul(amountB).div(weightDenominator);
                console.log("Amount after multiply weight is.. ", amountA.toString());
                console.log("Amount after multiply weight is.. ", amountB.toString());
                let IxApprovePositionWeightSaber = await qPoolContext.portfolioObject!.approvePositionWeightSaber(
                    poolAddresses,
                    amountA,
                    amountB,
                    new BN(0),
                    index,
                    weight
                );
                tx.add(IxApprovePositionWeightSaber);
            }

        }));

        // Finally, send some funds to the local tmp keypair
        // By default, just send some SOL
        // For now, just send 0.1 SOL to the crank wallet. This should be enough.
        // We can send this back, when the items are redeemed
        let IxSendToCrankWallet = await qPoolContext.portfolioObject!.sendToCrankWallet(
            qPoolContext.localTmpKeypair!.publicKey,
            100_000_000
        );
        tx.add(IxSendToCrankWallet);

        // Now sign this transaction
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            tx,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        // TODO: Should be taken from positions, not from the saved list!
        // Perhaps you should encapsulate all this logic in a separate "run-all-cranks" function
        // Now run cranks. Get all positions that were created. Iterate through all. And execute all of them.
        // positionAccount
        await qPoolContext.crankRpcTool!.fullfillAllPermissionless();
        await itemLoadContext.incrementCounter();
        // Add another Counter "running cranks"
        await qPoolContext.makePriceReload();

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
            {/*<div className="flex w-full bg-slate-800 justify-center md:justify-end">*/}
            {/*    <button*/}
            {/*        type={props.type}*/}
            {/*        onClick={props.onClick}*/}
            {/*        className={"rounded-lg text-xl font-semibold bg-pink-700 hover:bg-pink-900 h-12 w-full text-center align-middle"}*/}
            {/*    >*/}
            {/*        {props.text}*/}
            {/*    </button>*/}
            {/*</div>*/}
        </>
    )

}
