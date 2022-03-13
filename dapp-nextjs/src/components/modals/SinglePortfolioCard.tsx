import React, {Fragment, useRef} from "react";
import {AllocData, IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction, shortenedAddressString, solscanLink} from "../../utils/utils";
import {Dialog, Transition} from "@headlessui/react";
import {useLoad} from "../../contexts/LoadingContext";
import Image from "next/image";
import {registry} from "@qpools/sdk";
import {PortfolioAccount} from "@qpools/sdk";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {PositionInfo} from "@qpools/sdk";


export default function SinglePortfolioCard(props: any) {

    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();
    const itemLoadContext = useItemsLoad();
    const cancelButtonRef = useRef(null);

    /**
     * Disclose copied from headless UI https://headlessui.dev/react/disclosure
     * Table copied from https://flowbite.com/docs/components/tables/
     */
    const displayAllLpsInOneTable = (positions: PositionInfo[]) => {
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
                                            <span className="sr-only"></span>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>

                                    {positions.map((position: PositionInfo, index: number) => {
                                        if (!position.amountLp.uiAmount && (position.amountLp.uiAmount != 0)) {
                                            return <></>
                                        }

                                        // Get the icon from the registry
                                        let iconMintA = registry.getIconFromToken(position.mintA);
                                        let iconMintB = registry.getIconFromToken(position.mintB);

                                        return (
                                            <>
                                                <tr className="border-b dark:bg-gray-800 dark:border-gray-700">
                                                    {/* Show the icons next to this ... */}
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        {shortenedAddressString(position.mintLp)}
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

        console.log("About to be redeeming!");
        await itemLoadContext.addLoadItem({message: "Fetching Account Information"});
        await itemLoadContext.addLoadItem({message: "Approving Redeem & Redeeming Positions"});
        await itemLoadContext.addLoadItem({message: "Redeeming Positions"});
        await itemLoadContext.addLoadItem({message: "Transferring USDC Back to Your Wallet"});

        /**
         * Withdraw a Portfolio workflow:
         * 1) approve_withdraw_to_user(ctx,amount_total):
         *      ctx: context of the portfolio
         *      amount: total amount of USDC in the portfolio
         *
         * 2) for position_i in range(num_positions):
         *          approve_withdraw_amount_{PROTOCOL_NAME}(ctx, args)
         * 3) for position_i in range(num_positions):
         *          withdraw
         *
         * 3) transfer_redeemed_to_user():
         *      transfers the funds back to the user
         *
         */
        let tx: Transaction = new Transaction();

        // TODO: Call Crank API to withdraw for this user lol

        // Get the total amount from the initialUsdcAmount
        /**
         * Send some SOL to the crank wallet to run the cranks ...
         */
        let portfolioContents = (await qPoolContext._solbondProgram!.account.portfolioAccount.fetch(qPoolContext.portfolioObject!.portfolioPDA)) as PortfolioAccount;
        let initialUsdcAmount = portfolioContents.initialAmountUSDC;
        // Instead of initial amount, we should try to get the maximum. But for now, this should suffice
        let IxApproveWithdraw = await qPoolContext.portfolioObject!.signApproveWithdrawToUser(initialUsdcAmount);
        tx.add(IxApproveWithdraw);
        let IxRedeemPositions = await qPoolContext.portfolioObject!.approveRedeemFullPortfolio();
        IxRedeemPositions.map((x: TransactionInstruction) => {
            tx.add(x)
        });
        // Now send the transaction ...
        // Amount of SOL is pretty high probably.
        let IxSendToCrankWallet = await qPoolContext.portfolioObject!.sendToCrankWallet(
            qPoolContext.localTmpKeypair!.publicKey,
            100_000_000
        );
        tx.add(IxSendToCrankWallet);
        await itemLoadContext.incrementCounter();
        // Now sign this transaction
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            tx,
            qPoolContext.userAccount!.publicKey
        );
        await itemLoadContext.incrementCounter();

        /**
         * Run all cranks to take back the orders ...
         */
        // Run all the cranks here ...
        await qPoolContext.crankRpcTool!.fullfillAllWithdrawalsPermissionless();
        await itemLoadContext.incrementCounter();
        await qPoolContext.crankRpcTool!.transferToUser();
        await itemLoadContext.incrementCounter();

        let tmpWalletBalance: number = await qPoolContext.connection!.getBalance(qPoolContext.localTmpKeypair!.publicKey);
        let ix = await qPoolContext.crankRpcTool!.sendToUsersWallet(
            qPoolContext.localTmpKeypair!.publicKey,
            Math.min(tmpWalletBalance - 5_001, 0.0)
        );
        let tx2 = new Transaction();
        tx2.add(ix);
        await sendAndConfirmTransaction(
            qPoolContext.crankRpcTool!.crankProvider,
            qPoolContext.connection!,
            tx2,
            qPoolContext.userAccount!.publicKey
        );

        // Make reload
        await qPoolContext.makePriceReload();

        props.setShow(false);

    }

    return (
        <>
            <>
            <Transition show={props.show} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" initialFocus={cancelButtonRef} onClose={() => {props.setShow(false)}}>
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

                                        {displayAllLpsInOneTable(qPoolContext.positionInfos)}
                                    </div>
                                </div>
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
                            </div>
                        </Transition.Child>
                </Dialog>
            </Transition>
            </>
        </>
    );
}
