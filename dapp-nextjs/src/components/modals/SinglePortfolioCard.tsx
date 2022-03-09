import React, {Fragment, useRef} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction, shortenedAddressString, solscanLink} from "../../utils/utils";
import {AccountOutput} from "../../types/AccountOutput";
import {Dialog, Transition} from "@headlessui/react";
import {useLoad} from "../../contexts/LoadingContext";
import Image from "next/image";
import {getIconFromToken} from "../../../../../qPools-contract/qpools-sdk/src/registry/registry-helper";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";

export default function SinglePortfolioCard(props: any) {

    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();
    const itemLoadContext = useItemsLoad();
    const cancelButtonRef = useRef(null);

    /**
     * Disclose copied from headless UI https://headlessui.dev/react/disclosure
     * Table copied from https://flowbite.com/docs/components/tables/
     */
    const displayAllLpsInOneTable = (positions: AccountOutput[]) => {
        return (
            <>

                <div className="flex flex-col">
                    <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block py-2 min-w-full sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow-md sm:rounded-lg">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col"
                                            className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                            Pool
                                        </th>
                                        <th scope="col"
                                            className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                            Assets
                                        </th>
                                        <th scope="col"
                                            className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                            USDC Value
                                        </th>
                                        <th scope="col" className="relative py-3 px-6">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/*// <!-- Product 1 -->*/}

                                    {positions.map((position: AccountOutput, index: number) => {

                                        // if (!position) {
                                        //     console.log("Not ready to load just yet..");
                                        //     return (
                                        //         <></>
                                        //     )
                                        // }
                                        // if (qPoolContext.positionValuesInUsd.length != qPoolContext.allocatedAccounts.length) {
                                        // console.log("Lengths do not confirm!");
                                        // return (
                                        // <></>
                                        // )
                                        // }

                                        if (!position.amountLp.uiAmount && (position.amountLp.uiAmount != 0)) {
                                            return <></>
                                        }


                                        // Get the icon from the registry
                                        let iconMintA = getIconFromToken(position.mintA);
                                        let iconMintB = getIconFromToken(position.mintB);

                                        return (
                                            <>
                                                <tr className="border-b dark:bg-gray-800 dark:border-gray-700">
                                                    {/* Show the icons next to this ... */}
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        {shortenedAddressString(position.mintLp)}
                                                        {/* TODO: Change this to "Saber USDC-USDT Pool" or whatever (make a dictionary lookup) */}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                                                        <a href={solscanLink(position.mintA)} target={"_blank"} rel="noreferrer"
                                                           className="text-blue-600 dark:text-blue-400 hover:underline">
                                                            <Image src={iconMintA} width={30} height={30} />
                                                        </a>
                                                        <a href={solscanLink(position.mintB)} target={"_blank"} rel="noreferrer"
                                                           className="text-blue-600 dark:text-blue-400 hover:underline">
                                                            <Image src={iconMintB} width={30} height={30} />
                                                        </a>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                                                        {position.amountLp.uiAmount!.toFixed(2)}
                                                        {/* TODO: Change this to "Saber USDC-USDT Pool" or whatever (make a dictionary lookup) */}
                                                        {/*{position.amountLp.uiAmount?.toFixed(2)}*/}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                                                        <a href={solscanLink(position.ataLp)} target={"_blank"} rel="noreferrer"
                                                           className="text-blue-600 dark:text-blue-500 hover:underline">See on Solscan</a>
                                                    </td>
                                                </tr>
                                            </>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </>
        )
    }

    const submitToContract = async () => {

        // await loadContext.increaseCounter();

        console.log("About to be redeeming!");
        // Redeem the full portfolio

        await itemLoadContext.addLoadItem({message: "Redeeming Portfolios"});
        await itemLoadContext.addLoadItem({message: "Transferring Tokens Back"});

        let tx1: Transaction = new Transaction();
        let tx2: Transaction = new Transaction();
        // let tx3: Transaction = new Transaction();

        // Again, chain transactions together ..
        (await qPoolContext.portfolioObject!.redeemFullPortfolio()).map((x: TransactionInstruction) => {
            tx1.add(x);
        });
        // Gotta check if all these transactions work when pushed into one Transaction
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            tx1,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        tx2.add(
            await qPoolContext.portfolioObject!.transferUsdcFromPortfolioToUser()
        );
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            tx2,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        // Inject these somehow, once per pool!
        // let amount_a = (await this.connection.getTokenAccountBalance(userAccountA)).value.amount;
        // let amount_b = (await this.connection.getTokenAccountBalance(userAccountB)).value.amount;

        // Don't overoptimize these too much just yet ...

        // Loader, should register all the items that we're gonna go through ..
        // itemLoadContext.addLoadItem({message: "Creating Associated Token Accounts"});
        // itemLoadContext.addLoadItem({message: "Depositing USDC to the Portfolio"});
        // itemLoadContext.addLoadItem({message: "Distributing the Portfolio across the liquidity pools (1)"});
        // itemLoadContext.addLoadItem({message: "Distributing the Portfolio across the liquidity pools (2)"});

        // Be smarter about the way you split up the transactions into multiple parts ...

        // Collect all transactions
        // Can be dynamic, especially if we have more than 3 assets later


        // Now do some optimized portfolio sending ...
        // let numberIxs = allTxIxs.length;
        // let tx0 = new Transaction();
        // allTxIxs.slice(0, 2).map((x) => tx0.add(x));
        // let tx1 = new Transaction();
        // allTxIxs.slice(2, numberIxs).map((x) => tx1.add(x));

        // Split up the transactions, and
        // Redeem the full portfolio
        // Finally, also add the instruction to transfer to the user ...
        // await sendAndConfirmTransaction(
        //     qPoolContext._solbondProgram!.provider,
        //     qPoolContext.connection!,
        //     tx0,
        //     qPoolContext.userAccount!.publicKey
        // );
        // // itemLoadContext.incrementCounter();
        //
        // await sendAndConfirmTransaction(
        //     qPoolContext._solbondProgram!.provider,
        //     qPoolContext.connection!,
        //     tx1,
        //     qPoolContext.userAccount!.publicKey
        // );
        // // itemLoadContext.incrementCounter();
        //
        // let tx2 = new Transaction();
        // tx2.add(await qPoolContext.portfolioObject!.transferUsdcFromPortfolioToUser());
        // await sendAndConfirmTransaction(
        //     qPoolContext._solbondProgram!.provider,
        //     qPoolContext.connection!,
        //     tx2,
        //     qPoolContext.userAccount!.publicKey
        // );
        // // itemLoadContext.incrementCounter();
        // // itemLoadContext.resetCounter();

        // Make reload
        await qPoolContext.makePriceReload();

        await loadContext.decreaseCounter();
        props.setShow(false);

    }

    return (
        <>
            {/* Insert another modal here ... */}
            {/*<div className="flex items-center justify-center w-full h-full">*/}
            <>
            <Transition show={props.show} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" initialFocus={cancelButtonRef} onClose={() => {props.setShow(false)}}>
                    {/*<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">*/}
                    {/*<div className="min-h-screen px-4 text-center">*/}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-black opacity-40" />
                        </Transition.Child>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-50"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-50 scale-100"
                            leaveTo="opacity-100 scale-50"
                        >
                            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:align-middle sm:w-full mx-auto px-auto justify-center">
                                <div className="flex items-center justify-center w-full h-full">
                                    <div className="py-2 px-6 text-gray-300 text-2xl font-medium mt-2">
                                        Portfolio Info
                                    </div>
                                </div>

                                <div className="flex items-center justify-center w-full h-full">

                                    <div className="flex flex-col rounded-lg max-w-2xl text-center content-center">

                                        <div className={"mb-3"}>
                                            This portfolio is worth an estimated USDC {qPoolContext.totalPortfolioValueInUsd.toFixed(2)}
                                        </div>

                                        {displayAllLpsInOneTable(qPoolContext.allocatedAccounts)}
                                        {/*{displayAllPositions()}*/}

                                    </div>
                                </div>                                {/*<button*/}

                                <div className="flex w-full py-3 px-6 text-gray-600 justify-center">
                                    <button
                                        type="button"
                                        className="mx-3 px-6 py-2.5 bg-pink-800 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                                        onClick={() => {
                                            console.log("Redeem stupid Position");
                                            submitToContract();
                                        }}
                                    >
                                        Redeem ~USDC {qPoolContext.totalPortfolioValueInUsd.toFixed(2)} USDC (estimated)
                                    </button>
                                    <button
                                        type="button"
                                        className="mx-3 px-6 py-2.5 bg-gray-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-gray-700 hover:shadow-lg focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-800 active:shadow-lg transition duration-150 ease-in-out"
                                        onClick={() => props.setShow(false)}
                                    >
                                        Back
                                    </button>
                                </div>

                                {/*    type="button"*/}
                                {/*    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"*/}
                                {/*    onClick={() => setShow(false)}*/}
                                {/*    ref={cancelButtonRef}*/}
                                {/*>*/}
                                {/*    Cancel*/}
                                {/*</button>*/}
                            </div>
                            {/*</div>*/}
                        </Transition.Child>
                    {/*</div>*/}
                </Dialog>
            </Transition>
            </>
            {/*    <Transition.Root show={show} as={Fragment}>*/}
            {/*            /!*<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">*!/*/}
            {/*    </Transition.Root>*/}

            {/*</div>*/}
        </>
    );
}
