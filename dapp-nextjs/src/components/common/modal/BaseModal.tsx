import React, {Fragment} from "react";
import {Dialog, Transition} from "@headlessui/react";

interface Props {
    title: string,
    body: any,
    footer: any,
    showModal: boolean,
    onClose: () => void
}

export default function BaseModal({title, body, footer, showModal, onClose}: Props) {

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
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all shadow sm:my-2 sm:max-w-md sm:align-middle sm:w-full mx-auto px-auto justify-center">
                                <div className={"flex flex-col w-full"}>
                                    <div className={"flex flex-col justify-start"}>
                                        <Dialog.Title
                                            as="h3"
                                            className="flex items-center justify-center w-full h-full text-gray-300 text-2xl font-medium my-6"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <div
                                            className="flex items-center justify-center w-full h-full border-t border-gray-700">
                                            {body()}
                                        </div>
                                        <div className="flex flex-row w-full py-5 mx-auto justify-start border-t border-gray-700 px-5 mx-auto">
                                            {footer()}
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