import React, {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import {BRAND_COLORS} from "../../const";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {RunWithdrawCrankButton} from "../createPortfolio/buttons/RunWithdrawCrankButton";
import {RunDepositCrankButton} from "../createPortfolio/buttons/RunDepositCrankButton";
import { ShowCrank } from "types/ShowCrank";

interface Props {
    showCrankState: ShowCrank
}
export default function RunCranksModal({showCrankState}: Props) {

    const [inputLink, setInputLink] = useState<string>("");
    const rpcProvider: IRpcProvider = useRpc();

    // Open this if the portfolioAccount is created, but not fulfilled,
    // Or if the portfolioAccount is setToRedeemed, but not redeemed yet
    useEffect(() => {

    }, []);

    return (
        <>
            <Transition.Root appear show={showCrankState.valueOf() !== ShowCrank.NoCrank.valueOf()} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => {}}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-black opacity-40"/>
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
                        <div className={"mt-52"}>
                            <div
                                className="rounded-lg overflow-hidden shadow-xl transform transition-all shadow sm:my-2 sm:max-w-md sm:align-middle sm:w-full mx-auto px-auto justify-center">
                                <div className={"flex flex-col w-full"}
                                     style={{backgroundColor: BRAND_COLORS.slate900}}
                                >
                                    <div className={"flex flex-col justify-start"}>
                                        <Dialog.Title
                                            as="h3"
                                            className="flex items-center justify-center w-full h-full text-gray-100 text-xl font-light my-6"
                                        >
                                            Uh, oh, looks like the cranks have not fully executed!
                                        </Dialog.Title>
                                        <div className="flex items-center justify-center w-full h-full border-t border-gray-700">
                                            <div className="flex flex-col rounded-lg max-w-2xl text-center content-center my-3 mx-5">
                                                <p className={"text-gray-200 font-light"}>
                                                    In order to finalize the creation of your portfolio,
                                                    re-try to run the cranks.
                                                    This will retry to allocate the assets from your portfolio object,
                                                    to the respective assets.
                                                </p>
                                                <div className={"mx-auto"}>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row w-full py-5 border-t border-gray-700 px-5 justify-between">
                                            <div>
                                                {(showCrankState.valueOf() === ShowCrank.DepositCrank.valueOf()) && <RunDepositCrankButton />}
                                                {(showCrankState.valueOf() === ShowCrank.WithdrawCrank.valueOf()) && <RunWithdrawCrankButton />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition.Root>
        </>
    )

}