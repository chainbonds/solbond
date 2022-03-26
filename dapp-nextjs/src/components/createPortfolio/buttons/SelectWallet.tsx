import React from "react";
import {useWallet, WalletContextState} from "@solana/wallet-adapter-react";
import ConnectWalletButton from "../../common/ConnectWalletButton";

export default function SelectWallet({}) {

    const walletContext: WalletContextState = useWallet();

    return (
        <>
            <div className={"flex pb-2 w-full"}>
                <div className={"flex flex-col w-full"}>
                    <div className={"flex flex-row"}>
                        <div className={"flex flex-row w-9/12 mr-4"}>
                            {/* TODO: Make this some sort of button to display some text or whatever */}
                        </div>
                        <div className={"flex flex-row ml-auto my-auto"}>
                            {!walletContext.publicKey && <ConnectWalletButton/>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
