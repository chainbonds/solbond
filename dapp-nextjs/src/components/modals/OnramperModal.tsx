import {Button, Modal} from 'react-bootstrap';
import {Fragment, useEffect, useState} from "react";
import {Transition} from '@headlessui/react';
import {useWallet} from "@solana/wallet-adapter-react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {useLoad} from "../../contexts/LoadingContext";
import {BN} from "@project-serum/anchor";
import {u64} from "@solana/spl-token";
import {Transaction, TransactionInstruction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {MOCK} from "@qpools/sdk";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";
import dynamic from 'next/dynamic'

const Onramper = dynamic(() => import('./Onramper'), {
    ssr: false
})

export default function OnramperModal(props: any) {

    // Add all the logic to buy the product here?
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();
    const itemLoadContext = useItemsLoad();

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
                            {/*<Dialog.Overlay className="fixed inset-0" />*/}
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