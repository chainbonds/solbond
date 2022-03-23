import {Fragment} from "react";
import {Transition} from '@headlessui/react';
import {useWallet} from "@solana/wallet-adapter-react";
import {useLoad} from "../../contexts/LoadingContext";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";
import dynamic from 'next/dynamic'

const Onramper = dynamic(() => import('./Onramper'), {
    ssr: false
})

export default function OnramperModal(props: any) {

    return (
        <>
            <Transition.Root appear show={props.isOpen} as={Fragment}>
                <div className="fixed inset-0 z-10 overflow-y-auto">
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
                            <div className="fixed inset-0 bg-black opacity-70"/>
                        </Transition.Child>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-50"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-50 scale-100"
                            leaveTo="opacity-0 scale-50"
                        >
                                <div className="flex h-screen">
                                    <div className={"m-auto relative"}>
                                            <button className={"absolute -top-0 -right-0 rounded-bl-md w-16 h-6 z-10"}
                                                    style={{background : "#266678"}}
                                                    onClick = {() => {props.onClose()}}
                                            >
                                                &times;
                                            </button>
                                            <Onramper/>
                                    </div>
                                </div>
                        </Transition.Child>
                    </div>
                </div>
            </Transition.Root>
        </>
    )
}
