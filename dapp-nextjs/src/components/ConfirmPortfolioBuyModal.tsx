import {Button, Modal} from 'react-bootstrap';
import {Fragment} from "react";
import { Dialog, Transition} from '@headlessui/react';
import PieChart from "./PieChart";

export default function ConfirmPortfolioBuyModal(props: any) {

    return (
        <>

            {/*<div className="fixed inset-0 flex items-center justify-center">*/}
            {/*    <button*/}
            {/*        type="button"*/}
            {/*        onClick={openModal}*/}
            {/*        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"*/}
            {/*    >*/}
            {/*        Open dialog*/}
            {/*    </button>*/}
            {/*</div>*/}

            <Transition appear show={props.isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-10 overflow-y-auto"
                    onClose={props.onClose}
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
                            <Dialog.Overlay className="fixed inset-0" />
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span
                            className="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                          &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md bg-gray-900">
                                <Dialog.Title
                                    as="h3"
                                    className="text-2xl text-center font-medium leading-6 text-gray-200 mx-5"
                                >
                                    Portfolio Allocation
                                </Dialog.Title>

                                <div className="mt-2">
                                    <p className="text-center text-gray-400">
                                        The asset allocation that optimizes for the Sharpe ratio is the following.
                                    </p>
                                    <p className="text-center text-gray-400">
                                        Your assets will be allocated accordingly.
                                    </p>
                                </div>

                                <div className={"my-5 w-auto max-w-xs mx-auto"}>
                                    <PieChart />
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-center text-gray-400">
                                        Do you want to proceed?
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-row w-full mx-auto justify-center">
                                    <button
                                        type="button"
                                        className="justify-center px-4 py-2 text-sm font-medium text-gray-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                                        onClick={props.closeModal}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    )

}