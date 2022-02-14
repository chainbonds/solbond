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
            <Transition.Root appear show={props.isOpen} as={Fragment}>
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
                            {/*<Dialog.Overlay className="fixed inset-0" />*/}
                            <Dialog.Overlay className="fixed inset-0 bg-black opacity-70" />
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
                            enterFrom="opacity-0 scale-50"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-50 scale-100"
                            leaveTo="opacity-0 scale-50"
                        >
                            <div className="inline-block w-full shadow shadow-lg max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md bg-gray-900">

                                <div className={"flex flex-row w-full"}>

                                    <div className={"my-5 max-w-xs mx-auto w-1/2"}>
                                        <PieChart />
                                    </div>

                                    <div className={"pt-16 mx-5 justify-start my-auto max-w-xs"}>

                                        <Dialog.Title
                                            as="h3"
                                            className="text-2xl text-start font-medium leading-6 text-gray-200 my-5"
                                        >
                                            Portfolio Allocation
                                        </Dialog.Title>

                                        <p className="text-start text-gray-400">
                                            The asset allocation that optimizes for the Sharpe ratio is the following.
                                        </p>
                                        <p className="text-start text-gray-400">
                                            Your assets will be allocated accordingly.
                                        </p>
                                        <p className="text-start text-gray-400">
                                            Do you want to proceed?
                                        </p>

                                        <div className="flex flex-row w-full mx-auto justify-start my-10">
                                            <button
                                                type="button"
                                                className="justify-center px-4 py-2 text-sm font-medium text-gray-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                                                onClick={props.closeModal}
                                            >
                                                Confirm
                                            </button>
                                        </div>

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