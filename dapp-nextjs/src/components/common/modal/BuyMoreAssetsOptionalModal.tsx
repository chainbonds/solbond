import React, {ChangeEvent, Fragment, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import {BRAND_COLORS} from "../../../const";
import {FaucetButton} from "../../createPortfolio/buttons/FaucetButton";

interface Props {
    showModal: boolean,
    setShowModal: (arg1: boolean) => void
    onClose: () => void
}

export default function BuyMoreAssetsOptionalModal({showModal, setShowModal, onClose}: Props) {

    const [inputLink, setInputLink] = useState<string>("");

    let min: number = 1_000_000;
    let max: number = 8_999_999;
    let primeNumber = 103 * 127 * 149;
    let random = Math.floor(Math.random() * max) + min;
    random *= primeNumber;
    let twitterLink = "https://twitter.com/intent/tweet?text=I'm%20testing%20%40qpoolsfinance%20on%20%40Solana%0A%0A%F0%9F%94%84%E2%98%80%EF%B8%8F%20https%3A%2F%2Fqpools.app%0A%0AToken%20ID%3A%20";
    // This next number could be randomly taken ...
    twitterLink += String(random);
    twitterLink += "%0A%0A%24SOL%20and%20%24USDC%20integrating%20with%20%40saber_hq%20%20%40MarinadeFinance%20and%20%40solendprotocol";

    console.log("Twitter link is: ", twitterLink);

    return (
        <>
            <Transition.Root appear show={showModal} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => {
                    onClose()
                }}>
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
                                            Thanks for helping test qPools!
                                        </Dialog.Title>
                                        <div
                                            className="flex items-center justify-center w-full h-full border-t border-gray-700">
                                            <div
                                                className="flex flex-col rounded-lg max-w-2xl text-center content-center my-3 mx-5">
                                                <p className={"text-gray-200 font-light"}>
                                                    In order to prevent spam,
                                                    we require users to verify their transaction via Twitter.
                                                </p>
                                                <div className={"flex flex-col mx-auto mt-5 w-full"}>
                                                    <p className={"text-gray-200 text-sm font-bold mr-auto"}>
                                                        URL of Verification Tweet
                                                    </p>
                                                    <input
                                                        className="rounded-sm w-full items-end text-right h-12 p-4 text-sm mt-1"
                                                        style={{backgroundColor: BRAND_COLORS.slate700}}
                                                        type="text"
                                                        placeholder={"e.g. twitter.com/qpoolsfinance/status/1512088730626002948"}
                                                        id="stake_amount"
                                                        value={inputLink}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                            setInputLink(e.target.value);
                                                        }}
                                                    />
                                                </div>
                                                <div className={"mx-auto"}>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="flex flex-row w-full py-5 border-t border-gray-700 px-5 justify-between">
                                            <div>
                                                <a href={twitterLink} target="_blank" rel="noreferrer">
                                                    <button
                                                        className="border border-gray-500 text-white font-bold py-3 px-7 rounded my-auto"
                                                        // onClick={() => {setShowModal(false)}}
                                                    >
                                                        Verify on Twitter
                                                    </button>
                                                </a>
                                            </div>
                                            <div>
                                                <FaucetButton
                                                    activated={!!inputLink}
                                                />
                                            </div>
                                            {/*<div className={"mx-auto ml-5"}>*/}
                                            {/*    /!*<button*!/*/}
                                            {/*    /!*    className="border border-gray-500 text-white font-bold py-3 px-7 rounded "*!/*/}
                                            {/*    /!*    onClick={() => {setShowModal(false)}}*!/*/}
                                            {/*    /!*>*!/*/}
                                            {/*    /!*    Verify on Twitter*!/*/}
                                            {/*    /!*</button>*!/*/}
                                            {/*</div>*/}
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
