import {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from '@headlessui/react';
import PortfolioChart from "../portfolio/PortfolioChart";
import {useWallet} from "@solana/wallet-adapter-react";
import {AllocData, IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {BN} from "@project-serum/anchor";
import {PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {MOCK} from "@qpools/sdk";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {Promise} from "es6-promise";

export default function ConfirmPortfolioBuyModal(props: any) {

    // Add all the logic to buy the product here?
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
        let weights = qPoolContext.portfolioRatios
            .filter((item: AllocData) => {return item.weight > 0})
            .map((item: AllocData) => {return new BN(item.weight)});
        let poolAddresses = qPoolContext.portfolioRatios
            .filter((item: AllocData) => {return item.weight > 0})
            .map((item: AllocData) => {return item.pool!.swap.config.swapAccount});

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

        /**
         *
         */
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
                amountB = sendAmount;
            } else if ((new PublicKey(MOCK.DEV.SABER_USDC)).equals(state.tokenB.mint)) {
                amountA = sendAmount;
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

        // Now run cranks. Get all positions that were created. Iterate through all. And execute all of them.
        await Promise.all(poolAddresses.map(async (poolAddress: PublicKey, index: number) => {

            // Get the maximum index of the positions,
            // And for each of those, run the permissionless fulfill saber function
            // Must have a new provider with the new keypair to run all the cranks ...
            await qPoolContext.crankRpcTool!.permissionlessFulfillSaber(index);

        }));

        await itemLoadContext.incrementCounter();
        await qPoolContext.makePriceReload();

        // TODO: Display a message "Portfolio created"!
        props.onClose()
    }

    const portfolioChart = () => {
        return (<PortfolioChart
            totalAmountInUsdc={totalAmountInUsdc}
        />)
    }

    return (
        <>
            <Transition.Root appear show={props.isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-10 overflow-y-auto"
                    onClose={() => {props.onClose()}}
                >
                    <div className="min-h-screen px-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            {/*<Dialog.Overlay className="fixed inset-0" />*/}
                            <Dialog.Overlay className="fixed inset-0 bg-black opacity-70"/>
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        {/*<span*/}
                        {/*    className="inline-block h-screen align-middle"*/}
                        {/*    aria-hidden="true"*/}
                        {/*>*/}
                        {/*  &#8203;*/}
                        {/*</span>*/}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-50"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-50 scale-100"
                            leaveTo="opacity-0 scale-50"
                        >
                            {/**/}
                            <div
                                className="mx-auto mt-52 w-full shadow shadow-lg max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow rounded-sm bg-gray-800">

                                {/*<div className={"flex flex-row w-full"}>*/}
                                <div className={"justify-start my-auto"}>

                                    <div className={"flex flex-col w-full"}>

                                        <div className={"flex flex-col justify-start mx-auto"}>

                                            <Dialog.Title
                                                as="h3"
                                                className="text-2xl text-start font-medium leading-6 text-gray-200 my-3"
                                            >
                                                Portfolio Allocation
                                            </Dialog.Title>

                                            <p className="text-start text-gray-400">
                                                The asset allocation that optimizes for the Sharpe ratio is the following.
                                            </p>
                                            <p className="text-start text-gray-400">
                                                Your assets will be allocated accordingly.
                                                Do you want to proceed?
                                            </p>
                                        </div>

                                        <div className={"flex flex-col -my-12 -mt-14 justify-center mx-auto"}>
                                            {portfolioChart()}
                                        </div>

                                    </div>

                                    <div className="flex flex-row w-full my-1 mx-auto justify-end -ml-7">
                                        <button
                                            type="button"
                                            className="justify-end px-10 py-2 text-sm font-medium text-gray-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                                            onClick={buyItem}
                                        >
                                            Confirm
                                        </button>
                                    </div>

                                </div>

                                {/*</div>*/}

                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )

}