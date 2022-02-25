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
        await itemLoadContext.addLoadItem({message: "Register Portfolio & Pools"});
        await itemLoadContext.addLoadItem({message: "Sending USDC to Portfolio Object"});
        // await itemLoadContext.addLoadItem({message: "Register Pool Objects"});
        await itemLoadContext.addLoadItem({message: "Distribute Currency amongst liquidity pools"});

        // Initialize if not initialized yet
        await qPoolContext.initializeQPoolsUserTool(walletContext);
        await itemLoadContext.incrementCounter();

        console.log("Total amount in Usdc is: ", totalAmountInUsdc);
        const sendAmount: BN = new BN(totalAmountInUsdc).mul(new BN(10**MOCK.DEV.SABER_USDC_DECIMALS));
        let weights: Array<BN> = [new BN(1000), new BN(0), new BN(0)];

        /*
            List all instructions here first ...
            Let's assume, we will not send more than 5 transactions ...
         */
        let tx1: Transaction = new Transaction();
        let tx2: Transaction = new Transaction();
        let tx3: Transaction = new Transaction();
        let tx4: Transaction = new Transaction();
        let tx5: Transaction = new Transaction();
        let tx6: Transaction = new Transaction();
        let tx7: Transaction = new Transaction();

        // Calculate total transaction size for these items.
        let ixList1: TransactionInstruction[] = await qPoolContext.portfolioObject!.registerAtaForLiquidityPortfolio();
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
        // This should be one transaction, in the very first instance of buying a portfolio ...

        // Chain the next two instructions together ...
        let ix1: TransactionInstruction = await qPoolContext.portfolioObject!.registerPortfolio(weights);
        let ix2: TransactionInstruction = await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio(sendAmount);
        tx2.add(ix1); tx2.add(ix2);
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            tx2,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        // Finally, the pools can all be registered separately (but in one transaction)
        let ixList2: TransactionInstruction[] = await qPoolContext.portfolioObject!.registerAllLiquidityPools();
        ixList2.map((x: TransactionInstruction) => {tx3.add(x)});
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            tx3,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        // The finally, deposit the Tokens to the liquidity pools
        // Might have to approve these one-by-one, because just so many accounts!!
        let ixList3: TransactionInstruction[] = await qPoolContext.portfolioObject!.depositTokensToLiquidityPools();
        // TODO: It is very important that this goes through atomatically
        await Promise.all(
            ixList3.map(async (x: TransactionInstruction) => {
                let tmpTx = new Transaction();
                tmpTx.add(x);
                await sendAndConfirmTransaction(
                    qPoolContext._solbondProgram!.provider,
                    qPoolContext.connection!,
                    tmpTx,
                    qPoolContext.userAccount!.publicKey
                )
            })
        );
        await itemLoadContext.incrementCounter();
        await qPoolContext.makePriceReload();

        // These ones are not instructions anymore, these are just RPC calls
        let length = 0.;
        console.log("Single Instruction is: ", ix1);
        ixList1.map((x: TransactionInstruction) => length += x.keys.length);
        console.log("Length up to this point is: ", length);
        length += ix1.keys.length;
        console.log("Length up to this point is: ", length);
        length += ix2.keys.length;
        console.log("Length up to this point is: ", length);
        ixList2.map((x: TransactionInstruction) => length += x.keys.length);
        console.log("Length up to this point is: ", length);
        // ixList3.map((x: TransactionInstruction) => length += x.keys.length);
        // console.log("Length up to this point is: ", length);















        // /*
        //     BLOCK 1: Create Associated Token Accounts for the Portfolio
        //     First, and if this was not created before, create the associated token accounts
        //  */
        // let txAssociatedTokenAccounts: Transaction = new Transaction();
        // (await qPoolContext.portfolioObject!.registerAtaForLiquidityPortfolio()).map((x: TransactionInstruction) => {
        //     if (x) {
        //         console.log("Adding to the tx: ", x);
        //         txAssociatedTokenAccounts.add(x);
        //     }
        // });
        //
        // console.log("txAssociatedTokenAccounts Instructions are: ", txAssociatedTokenAccounts.instructions);
        // if (txAssociatedTokenAccounts.instructions.length > 0) {
        //     console.log("Sending the first set of transactions!!");
        //     await sendAndConfirmTransaction(
        //         qPoolContext._solbondProgram!.provider,
        //         qPoolContext.connection!,
        //         txAssociatedTokenAccounts,
        //         qPoolContext.userAccount!.publicKey
        //     );
        // }
        // await itemLoadContext.incrementCounter();
        //
        // /*
        //     BLOCK 2: Create the data structures for the portfolio, and liquidity pools
        //  */
        // // TODO: Here too, double-check if these accounts were already created.
        // //  If they were not created, then create them. This could possibly also save a couple instructions
        // // Register all pools, and addresses
        // // console.log("Registering all accounts ...");
        // let tx1: Transaction = new Transaction();
        // tx1.add(
        //     await qPoolContext.portfolioObject!.registerPortfolio(weights)
        // );
        // // And register all liquidity pools
        // (await qPoolContext.portfolioObject!.registerAllLiquidityPools()).map((x: TransactionInstruction) => {
        //     if (x) {
        //         tx1.add(x);
        //     }
        // });
        // // Also send USDC to this account!
        // tx1.add(
        //     await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio(amountTokenA)
        // );
        // console.log("txRegisterDataStructures Instructions are: ", tx1.instructions);
        // await sendAndConfirmTransaction(
        //     qPoolContext._solbondProgram!.provider,
        //     qPoolContext.connection!,
        //     tx1,
        //     qPoolContext.userAccount!.publicKey
        // );
        // await itemLoadContext.incrementCounter();
        // await itemLoadContext.incrementCounter();
        // await itemLoadContext.incrementCounter();
        //
        // /*
        //     BLOCK 3: Push liquidity to the liquidity pools
        //  */
        // // Now apply all functions that send money back and forth
        // console.log("Sending tokens around. This should be atomic, so that liquidity mining is successful, indeed ...");
        // // let tx2: Transaction = new Transaction();
        // // tx2.add(
        // //     await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio(amountTokenA)
        // // );
        // // await sendAndConfirmTransaction(
        // //     qPoolContext._solbondProgram!.provider,
        // //     qPoolContext.connection!,
        // //     tx2,
        // //     qPoolContext.userAccount!.publicKey
        // // );
        // // await itemLoadContext.incrementCounter();
        //
        // // Gotta calculate the full distribution of tokens before sending these instrutions ...
        // // Perhaps we should call it 1-by-1 for now?
        // // Calculating the full allocation beforehand seems a bit tough to do right now, no?
        // await qPoolContext.portfolioObject!.depositTokensToLiquidityPools(weights);
        // await itemLoadContext.incrementCounter();
        //
        // // Perhaps, instead of resetting the counter, display some sort of "Ok" button
        // // await itemLoadContext.resetCounter();
        //
        // // Make reload
        // await qPoolContext.makePriceReload();
        //
        // console.log("Done sending USDC to portfolio!!");
        // // await loadContext.decreaseCounter();

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