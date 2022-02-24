import {Button, Modal} from 'react-bootstrap';
import {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from '@headlessui/react';
import PortfolioChart from "../portfolio/PortfolioChart";
import {useWallet} from "@solana/wallet-adapter-react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {useLoad} from "../../contexts/LoadingContext";
import {BN} from "@project-serum/anchor";
import {u64} from "@solana/spl-token";
import {Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {MOCK} from "@qpools/sdk";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";

export default function ConfirmPortfolioBuyModal(props: any) {

    // Add all the logic to buy the product here?
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();
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

        // Display a message "Portfolio created"!
        props.onClose()

        // await loadContext.increaseCounter();

        await itemLoadContext.addLoadItem({message: "Fetching data"});
        await itemLoadContext.addLoadItem({message: "Creating Associated Token Accounts"});
        await itemLoadContext.addLoadItem({message: "Register Portfolio & Pool Object"});
        // await itemLoadContext.addLoadItem({message: "Register Pool Objects"});
        await itemLoadContext.addLoadItem({message: "Send Currency to Portfolio"});
        await itemLoadContext.addLoadItem({message: "Distribute Currency amongst liquidity pools"});

        // Initialize if not initialized yet
        await qPoolContext.initializeQPoolsUserTool(walletContext);
        await itemLoadContext.incrementCounter();

        console.log("Total amount in Usdc is: ", totalAmountInUsdc);

        // We can now assume that the portfolio was created in the qpools context.
        const sendAmount: BN = new BN(totalAmountInUsdc).mul(new BN(10**MOCK.DEV.SABER_USDC_DECIMALS));

        let amountTokenA = new u64(sendAmount);
        const amounts = [amountTokenA, 0, 0];
        let weights: Array<BN> = [new BN(1000), new BN(0), new BN(0)];

        /*
            BLOCK 1: Create Associated Token Accounts for the Portfolio
         */
        // First, and if this was not created before, create the associated token accounts
        let txAssociatedTokenAccounts: Transaction = new Transaction();
        (await qPoolContext.portfolioObject!.registerAtaForLiquidityPortfolio()).map((x: TransactionInstruction) => {
            if (x) {
                console.log("Adding to the tx: ", x);
                txAssociatedTokenAccounts.add(x);
            }
        });
        // If the transaction is not empty
        console.log("txAssociatedTokenAccounts Instructions are: ", txAssociatedTokenAccounts.instructions);
        if (txAssociatedTokenAccounts.instructions.length > 0) {
            console.log("Sending the first set of transactions!!");
            await sendAndConfirmTransaction(
                qPoolContext._solbondProgram!.provider,
                qPoolContext.connection!,
                txAssociatedTokenAccounts,
                qPoolContext.userAccount!.publicKey
            );
        }
        await itemLoadContext.incrementCounter();

        /*
            BLOCK 2: Create the data structures for the portfolio, and liquidity pools
         */
        // TODO: Here too, double-check if these accounts were already created.
        //  If they were not created, then create them. This could possibly also save a couple instructions
        // Register all pools, and addresses
        console.log("Registering all accounts ...");
        let txRegisterDataStructures: Transaction = new Transaction();
        txRegisterDataStructures.add(
            await qPoolContext.portfolioObject!.registerPortfolio(weights)
        );
        (await qPoolContext.portfolioObject!.registerAllLiquidityPools()).map((x: TransactionInstruction) => {
            if (x) {
                txRegisterDataStructures.add(x);
            }
        });
        console.log("txRegisterDataStructures Instructions are: ", txRegisterDataStructures.instructions);
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            txRegisterDataStructures,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        /*
            BLOCK 2: Create the data structures for the portfolio, and liquidity pools
         */
        // Now apply all functions that send money back and forth
        console.log("Sending tokens around. This should be atomic, so that liquidity mining is successful, indeed ...");
        let txPushTokensToLiquidityPoolsThroughPortfolio: Transaction = new Transaction();
        txPushTokensToLiquidityPoolsThroughPortfolio.add(
            await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio(amountTokenA)
        );
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            txPushTokensToLiquidityPoolsThroughPortfolio,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        // Gotta calculate the full distribution of tokens before sending these instrutions ...
        // Perhaps we should call it 1-by-1 for now?
        // Calculating the full allocation beforehand seems a bit tough to do right now, no?
        await qPoolContext.portfolioObject!.depositTokensToLiquidityPools(weights);
        await itemLoadContext.incrementCounter();

        // Perhaps, instead of resetting the counter, display some sort of "Ok" button
        // await itemLoadContext.resetCounter();

        // Make reload
        await qPoolContext.makePriceReload();

        console.log("Done sending USDC to portfolio!!");
        // await loadContext.decreaseCounter();

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