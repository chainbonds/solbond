import React, {Fragment, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import {FaucetButton} from "../createPortfolio/buttons/FaucetButton";

interface Props {
    showModal: boolean,
    setShowModal: (arg1: boolean) => void
    onClose: () => void
}

export default function BuyMoreAssetsModal({showModal, setShowModal, onClose}: Props) {

    let twitterLink = "https://twitter.com/intent/tweet?text=I'm%20testing%20%40qpoolsfinance%20on%20%40Solana%0A%0A%F0%9F%94%84%E2%98%80%EF%B8%8F%20https%3A%2F%2Fqpools.app%0A%0AToken%20ID%3A%20"
    twitterLink += "550000"
    twitterLink += "%0A%0A%24SOL%20integrating%20with%20%40saber_hq%20%20%40MarinadeFinance%20and%20%40solendprotocol";

    console.log("Twitter link is: ", twitterLink);

    return (
        <>
            <Transition.Root appear show={showModal} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => {onClose()}}>
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
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all shadow sm:my-2 sm:max-w-md sm:align-middle sm:w-full mx-auto px-auto justify-center">
                                <div className={"flex flex-col w-full"}>
                                    <div className={"flex flex-col justify-start"}>
                                        <Dialog.Title
                                            as="h3"
                                            className="flex items-center justify-center w-full h-full text-gray-300 text-2xl font-medium my-6"
                                        >
                                            Not enough assets!
                                        </Dialog.Title>
                                        <div className="flex items-center justify-center w-full h-full border-t border-gray-700">
                                            <div
                                                className="flex flex-col rounded-lg max-w-2xl text-center content-center my-3 mx-5">
                                                <p className={"flex flex-col text-gray-400"}>
                                                    You seem to have bought too many Degenerate Apes!
                                                    Please re-fill your wallet to test this application.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row w-full py-5 mx-auto justify-start border-t border-gray-700 px-5 mx-auto">
                                            <div className={"mx-auto mr-5"}>
                                                <FaucetButton activated={true} />
                                            </div>
                                            <div className={"mx-auto ml-5"}>
                                                <button
                                                    className="border border-gray-500 text-white font-bold py-3 px-7 rounded "
                                                    onClick={() => {setShowModal(false)}}
                                                >
                                                    Stay poor
                                                </button>
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