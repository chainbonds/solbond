import React, {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import {FaCheckCircle, FaTimesCircle} from "react-icons/fa";
import {Oval, TailSpin} from "react-loader-spinner";
import {LoadingItem, useItemsLoad} from "../../contexts/ItemsLoadingContext";
// import FaCheckCircle from "react-icons/fa/";

// Should replace with an enum, and failed can also be an option

// This should probably much more be a provider, rather than a component like this ...
// Probably I can load these variables into the loader modal ...
export default function LoadingItemsModal(props: any) {

    const itemLoadContext = useItemsLoad();

    // Should prob more be like a dictionaty ...
    // const [loadItems, setLoadItems] = useState<LoadingItem[]>([]);
    // const [progressCounter, setProgressCounter] = useState<number>(1);
    const [showModal, setShowModal] = useState<boolean>(true);

    useEffect(() => {
        if (itemLoadContext.progressCounter === itemLoadContext.loadItems.length) {
            setShowModal(false);
        }
    }, [itemLoadContext.progressCounter, itemLoadContext.loadItems]);

    useEffect(() => {

        itemLoadContext.resetCounter();

        const a: LoadingItem[] = [
            {
                message: "Transaction Item 1",
                loadingDone: true
            },
            {
                message: "Transaction Item 2",
                loadingDone: false
            },
            {
                message: "Transaction Item 3",
                loadingDone: false
            }
        ];
        a.map((x: LoadingItem) => {
            itemLoadContext.addLoadItem(x);
        });

        setTimeout(() => {
            console.log("Incrementing counter ..");
            itemLoadContext.incrementCounter();
        }, 5000);

    }, []);

    return (
        <>
            <Transition show={showModal} as={Fragment}>
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
                        <div
                            className="bg-gray-900 rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-md sm:align-middle sm:w-full mx-auto px-auto justify-center">
                            <div className="flex items-center justify-center w-full h-full">
                                <div className="py-2 px-6 text-gray-300 text-2xl font-medium mt-2">
                                    Waiting for Transactions
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-full h-full">

                                <div className="flex flex-col rounded-lg max-w-2xl text-center content-center">

                                    <div className={"mb-3"}>

                                        {itemLoadContext.loadItems.map((x: LoadingItem, index: number) => {


                                            if (index === itemLoadContext.progressCounter) {
                                                return (
                                                    <>
                                                        <div className={"flex flex-row my-3 justify-center"}>
                                                            <div className={"flex my-auto"}>
                                                                <Oval color="#00BFFF" height={20} width={20}/>
                                                            </div>
                                                            <div className={"flex pl-4 text-gray-400"}>
                                                                {x.message}
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            } else if (x.loadingDone) {
                                                return (
                                                    <>
                                                        <div className={"flex flex-row my-3 justify-center"}>
                                                            <div className={"flex pl-0.5 my-auto"}>
                                                                <FaCheckCircle color={"#4ade80"} size={20}/>
                                                            </div>
                                                            <div className={"flex pl-5 text-gray-400"}>
                                                                {x.message}
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            } else {
                                                return (
                                                    <>
                                                        <div className={"flex flex-row my-3 justify-center"}>
                                                            <div className={"flex pl-0.5 my-auto"}>
                                                                <FaTimesCircle color={"#94a3b8"} size={20}/>
                                                            </div>
                                                            <div className={"flex pl-5 text-gray-400"}>
                                                                {x.message}
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        })}

                                        <div className={"flex mt-6 mb-4 flex-row justify-center mx-auto text-gray-300"}>
                                            {/* Loading screen ...*/}
                                            Please approve transactions!
                                        </div>
                                    </div>

                                </div>
                            </div>
                            {/*                    /!*<button*!/*/}

                            {/*<div className="flex w-full my-2 px-6 text-gray-400 justify-center">*/}
                            {/*    Please approve transactions!*/}
                            {/*</div>*/}
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition>
        </>
    );


}