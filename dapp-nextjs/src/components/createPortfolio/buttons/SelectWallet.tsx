import React from "react";
// import {useWallet, WalletContextState} from "@solana/wallet-adapter-react";
import CustomConnectWalletButton from "../../common/CustomConnectWalletButton";
import {useConnectedWallet} from "@saberhq/use-solana";

export default function SelectWallet({}) {

    const walletContext = useConnectedWallet();

    return (
        <>
            <div className={"flex pb-2 w-full"}>
                <div className={"flex flex-col w-full"}>
                    <div className={"flex flex-row"}>
                        <div className={"flex flex-row w-9/12 mr-4"}>
                            {/* TODO: Make this some sort of button to display some text or whatever */}
                            {/*<div className="w-full border border-gray-700 text-white font-thin py-3 px-7 rounded align-center text-center">*/}
                            {/*    We are currently on Devnet.*/}
                            {/*    Any feedback and opinions are appreciated. Make sure to voice them on Discord or Twitter :)*/}
                            {/*</div>*/}
                        </div>
                        <div className={"flex flex-row ml-auto my-auto"}>
                            {!walletContext?.publicKey && <CustomConnectWalletButton/>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
