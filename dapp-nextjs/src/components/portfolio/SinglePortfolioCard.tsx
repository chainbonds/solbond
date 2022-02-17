import React, {Fragment, useEffect, useRef, useState} from "react";
import Image from "next/image";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {Account, AllocateParams, PublicKey, TokenAmount} from "@solana/web3.js";
import ConnectWalletPortfolioRow from "./ConnectWalletPortfolioRow";
import PortfolioDiagram from "./DetailedDiagram";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import {AccountOutput} from "../../types/AccountOutput";
import {UsdValuePosition} from "../../types/UsdValuePosition";
import {Dialog, Transition} from "@headlessui/react";
import { Disclosure } from '@headlessui/react';
import {ChevronUpIcon} from "@heroicons/react/solid";

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
            <div className="">
                {/*<p className="text-gray-700 text-base mb-1">*/}
                {/*    Position Value is: ${qPoolContext.positionValuesInUsd[position.index].totalPositionValue.toFixed(2)}*/}
                {/*</p>*/}
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

    /**
     * Table copied from https://flowbite.com/docs/components/tables/
     * @param position
     */
    const miniAddressTable = (position: AccountOutput) => {

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

        return (
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block py-2 min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-md sm:rounded-lg">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col"
                                        className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                        Type
                                    </th>
                                    <th scope="col"
                                        className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                        $ Value
                                    </th>
                                    <th scope="col" className="relative py-3 px-6">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {/*// <!-- Product 1 -->*/}
                                <tr className="border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Token LP
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                        {position.amountLp.uiAmount?.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                                        <a href={solscanLink(position.ataLp)} target={"_blank"}
                                           className="text-blue-600 dark:text-blue-500 hover:underline">Info</a>
                                    </td>
                                </tr>
                                {/*// <!-- Product 2 -->*/}
                                <tr className="border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Token A
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                        {position.amountA.uiAmount?.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                                        <a href={solscanLink(position.ataA)} target={"_blank"}
                                           className="text-blue-600 dark:text-blue-500 hover:underline">Info</a>
                                    </td>
                                </tr>
                                {/*// <!-- Product 2 -->*/}
                                <tr className="dark:bg-gray-800">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Token B
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                        {position.amountB.uiAmount?.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                                        <a href={solscanLink(position.ataB)} target={"_blank"}
                                           className="text-blue-600 dark:text-blue-500 hover:underline">Info</a>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )

    }

    const cancelButtonRef = useRef(null)

    /**
     * Disclose copied from headless UI https://headlessui.dev/react/disclosure
     */
    const displayAllPositions = () => {

        return (
            qPoolContext.allocatedAccounts.map((position: AccountOutput, index: number) => {

                console.log("Displaying position", position);
                if (!qPoolContext.positionValuesInUsd[position.index]) {
                    return (
                        <>
                        </>
                    );
                }

                return (
                    <>
                        <div className="w-full px-4">
                            <div className="w-full max-w-md p-2 mx-auto rounded-2xl">
                                <div className={"flex flex-col"}>
                                    <Disclosure>
                                        {({open}) => (
                                            <>
                                                <Disclosure.Button className={"flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"}>
                                                    <div className={"flex flex-row w-full"}>
                                                        <div className={"flex flex-row justify-start"}>
                                                            Position {index + 1}
                                                        </div>
                                                        <div className={"flex flex-row justify-end content-end mx-2"}>
                                                            ${qPoolContext.positionValuesInUsd[position.index].totalPositionValue.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <ChevronUpIcon
                                                        className={`${!open ? 'transform rotate-180' : ''} w-5 h-5 text-purple-500`}
                                                    />
                                                </Disclosure.Button>
                                                <Disclosure.Panel className={"px-4 pt-2 text-sm w-full text-gray-500 text-gray-500"}>
                                                    {miniAddressTable(position)}
                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                </div>
                            </div>
                        </div>
                    </>
                )
            })
        );

    }

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
                            {/**/}
                            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:align-middle sm:w-full mx-auto px-auto justify-center">
                                {/*Hello*/}
                                {/*<div className="flex items-center justify-center w-full h-full">*/}
                                {/*    <div className="py-3 px-6 text-gray-300 text-2xl font-medium mb-2 mt-3">*/}
                                {/*        This portfolio is worth ${qPoolContext.totalPortfolioValueInUsd.toFixed(2)}*/}
                                {/*    </div>*/}
                                {/*</div>*/}

                                <div className="flex items-center justify-center w-full h-full">

                                    <div className="flex flex-col rounded-lg max-w-sm text-center content-center">

                                        <div className="py-3 px-6 text-gray-900 text-xl font-medium mb-2">
                                            <PortfolioDiagram values={qPoolContext.positionValuesInUsd}/>
                                        </div>

                                        {/* Display all positions now ... */}
                                        {displayAllPositions()}

                                    </div>
                                </div>                                {/*<button*/}

                                <div className="flex w-full py-3 px-6 pt-8 text-gray-600 justify-center">
                                    <button
                                        type="button"
                                        className="mx-3 px-6 py-2.5 bg-pink-800 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                                        onClick={() => {
                                            console.log("Redeem stupid Position")
                                        }}
                                    >
                                        Redeem ~${qPoolContext.totalPortfolioValueInUsd.toFixed(2)} USDC (estimated)
                                    </button>
                                    <button
                                        type="button"
                                        className="mx-3 px-6 py-2.5 bg-gray-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-gray-700 hover:shadow-lg focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-800 active:shadow-lg transition duration-150 ease-in-out"
                                        onClick={() => setShow(false)}
                                    >
                                        Go Back
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
