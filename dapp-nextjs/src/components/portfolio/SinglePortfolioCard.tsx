import React, {Fragment, useEffect, useRef, useState} from "react";
import Image from "next/image";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {AllocateParams, PublicKey, TokenAmount} from "@solana/web3.js";
import ConnectWalletPortfolioRow from "./ConnectWalletPortfolioRow";
import PortfolioDiagram from "./DetailedDiagram";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import {AccountOutput} from "../../types/AccountOutput";
import {UsdValuePosition} from "../../types/UsdValuePosition";
import {Dialog, Transition} from "@headlessui/react";
import PieChart from "../PieChart";

export default function SinglePortfolioCard(props: any) {

    const qPoolContext: IQPool = useQPoolUserTool();
    const [show, setShow] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Get all the accounts from the
    useEffect(() => {
        if (props.show == true || props.show == false) {
            setShow(props.show);
        }
    }, [props.show]);

    const displaySinglePosition = (position: AccountOutput) => {
        if (!position) {
            console.log("Not ready to load just yet..");
            return (
                <></>
            )
        }
        if (qPoolContext.positionValuesInUsd.length != qPoolContext.allocatedAccounts.length) {
            console.log("Lengths do not confirm!");
            return (
                <></>
            )
        }

        // Check which one is the Currency-mint, and based on that, print better strings
        return (
            <div className="p-6">
                <p className="text-gray-700 text-base mb-1">
                    Position Value is: {qPoolContext.positionValuesInUsd[position.index].totalPositionValue}
                </p>
                <p className="text-gray-700 text-base mb-1">
                    LP Token <a href={solscanLink(position.ataLp)} target={"_blank"}>{shortenedAddressString(position.mintLp)}</a> {position.amountLp.uiAmountString}
                </p>
                <p className="text-gray-700 text-base">
                    Token A <a href={solscanLink(position.ataA)} target={"_blank"}>{shortenedAddressString(position.mintA)}</a> {position.amountA.uiAmountString}
                </p>
                <p className="text-gray-700 text-base mb-1">
                    Token B <a href={solscanLink(position.ataB)} target={"_blank"}>{shortenedAddressString(position.mintB)}</a> {position.amountB.uiAmountString}
                </p>
                {/* Redeem button could go here? */}
            </div>
        )
    }

    const cancelButtonRef = useRef(null)

    return (
        <>
            {/*<div className="flex items-center justify-center w-full h-full">*/}
            <>
            <Transition show={show} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" initialFocus={cancelButtonRef} onClose={() => {setShow(false)}}>
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
                            {/*<Dialog.Overlay className="fixed inset-0" />*/}
                            <Dialog.Overlay className="fixed inset-0 bg-black opacity-40" />
                            {/*<Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>*/}
                            {/*<Dialog.Overlay className="fixed inset-0 z-5" />*/}
                        </Transition.Child>
                        {/*<span className="inline-block h-screen align-middle" aria-hidden="true">*/}
                        {/*  &#8203;*/}
                        {/*</span>*/}
                        <Transition.Child
                            as={Fragment}
                            // className={"z-index-20"}
                            enter="ease-out duration-300"
                            // enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterFrom="opacity-0 scale-50"
                            // enterTo="opacity-100 translate-y-0 sm:scale-100"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-50 scale-100"
                            leaveTo="opacity-100 scale-50"
                            // leave="ease-in duration-200"
                            // leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            // leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            {/*<div ref={cancelButtonRef}>*/}
                            <div className="bg-gray-400 rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-auto px-auto justify-center">
                                {/*Hello*/}
                                <div className="flex items-center justify-center w-full h-full">

                                    <div className="block rounded-lg shadow-lg bg-white max-w-sm text-center">
                                        <div className="py-3 px-6 border-b border-gray-300 text-gray-900 text-xl font-medium mb-2">
                                            Portfolio Value ${qPoolContext.totalPortfolioValueInUsd}
                                        </div>

                                        <div className={"mx-auto px-auto justify-center"}>
                                            <PortfolioDiagram
                                                values={qPoolContext.positionValuesInUsd}
                                            />
                                        </div>

                                        Display all positions now ...
                                        {qPoolContext.allocatedAccounts.map((position) => {
                                            console.log("Displaying position", position);
                                            return displaySinglePosition(position)
                                        })}

                                        <div className="py-3 px-6 border-t border-gray-300 text-gray-600">
                                            <button type="button" className="px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
                                                Redeem back to USDC
                                            </button>
                                        </div>
                                    </div>
                                </div>                                {/*<button*/}
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
