import {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from '@headlessui/react';
import PortfolioChartAndTable from "../portfolio/PortfolioChartAndTable";
import {useWallet} from "@solana/wallet-adapter-react";
import {AllocData, IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {BN} from "@project-serum/anchor";
import {PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {MOCK} from "@qpools/sdk";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {Promise} from "es6-promise";
import PurchaseButton from "../buttons/PurchaseButton";

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
                            <Dialog.Overlay className="fixed inset-0 bg-black opacity-70"/>
                        </Transition.Child>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-50"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-50 scale-100"
                            leaveTo="opacity-0 scale-50"
                        >
                            <div className="mx-auto mt-52 w-full shadow shadow-lg max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow rounded-sm bg-gray-800">
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
                                            <PortfolioChartAndTable
                                                totalAmountInUsdc={totalAmountInUsdc}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-row w-full my-1 mx-auto justify-end -ml-7">
                                        <PurchaseButton />
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
}
