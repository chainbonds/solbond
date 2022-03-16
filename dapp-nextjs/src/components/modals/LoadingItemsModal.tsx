import React, {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import {FaCheckCircle, FaTimesCircle} from "react-icons/fa";
import {Oval} from "react-loader-spinner";
import {LoadingItem, useItemsLoad} from "../../contexts/ItemsLoadingContext";

// Should replace with an enum, and failed can also be an option

// This should probably much more be a provider, rather than a component like this ...
// Probably I can load these variables into the loader modal ...
export default function LoadingItemsModal() {

    const itemLoadContext = useItemsLoad();
    const [disableButton, setDisableButton] = useState<boolean>(false);

    useEffect(() => {
        if ((itemLoadContext.loadItems.length > 0) && (itemLoadContext.progressCounter < (itemLoadContext.loadItems.length))) {
            setDisableButton(true);
        } else {
            setDisableButton(false);
        }
    }, [itemLoadContext.loadItems, itemLoadContext.progressCounter]);


    return (
        <>
            <Transition.Root appear show={itemLoadContext.showLoadingModal} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => {
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
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all shadow sm:my-2 sm:max-w-md sm:align-middle sm:w-full mx-auto px-auto justify-center">

                                <div className={"flex flex-col w-full"}>

                                    <div className={"flex flex-col justify-start"}>

                                        <Dialog.Title
                                            as="h3"
                                            className="flex items-center justify-center w-full h-full text-gray-300 text-2xl font-medium my-6"
                                        >
                                            Waiting for Transactions
                                        </Dialog.Title>

                                        <div className="flex items-center justify-center w-full h-full border-t border-gray-700">

                                            <div
                                                className="flex flex-col rounded-lg max-w-2xl text-center content-center my-3">

                                                <p className={"flex flex-col text-gray-400"}>
                                                    Please approve any transaction messages that appear
                                                </p>

                                                <div className={"mx-auto"}>

                                                    {itemLoadContext.loadItems.map((x: LoadingItem, index: number) => {


                                                        if (index === itemLoadContext.progressCounter) {
                                                            return (
                                                                <>
                                                                    <div className={"flex flex-row my-3 justify-start"}>
                                                                        <div className={"flex my-auto"}>
                                                                            <Oval color="#00BFFF" height={20}
                                                                                  width={20}/>
                                                                        </div>
                                                                        <div className={"flex pl-4 text-gray-400"}>
                                                                            {x.message}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )
                                                        } else if (index < itemLoadContext.progressCounter) {
                                                            return (
                                                                <>
                                                                    <div className={"flex flex-row my-3 justify-start"}>
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
                                                                    <div className={"flex flex-row my-3 justify-start"}>
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

                                                </div>

                                            </div>
                                        </div>

                                        <div className="flex flex-row w-full py-5 mx-auto justify-start border-t border-gray-700 px-20 mx-auto">
                                            {disableButton ?
                                                <button
                                                    type="button"
                                                    className="flex flex-row justify-center w-full px-10 py-2 text-sm font-medium text-gray-500 bg-blue-100 border border-transparent rounded-md w-full"
                                                    onClick={() => {
                                                        itemLoadContext.resetCounter()
                                                    }}
                                                    disabled={true}
                                                >
                                                    Approving transactions
                                                </button>
                                                :
                                                <>
                                                    <button
                                                        type="button"
                                                        className="flex flex-row justify-center w-full px-10 py-2 text-sm font-medium text-gray-900 bg-blue-100 border border-transparent w-full rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                                                        onClick={() => {
                                                            itemLoadContext.resetCounter()
                                                        }}
                                                    >
                                                        Done!
                                                    </button>
                                                </>
                                            }
                                        </div>


                                    </div>

                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition.Root>
        </>
    );

}
