import React from "react";
import ConnectWalletButton from "../buttons/ConnectWalletButton";


export default function SelectWalletForm() {

    return (
        <>
            <div className={"flex pb-2 w-full"}>
                <div className={"flex flex-col w-full"}>
                    <div className={"flex flex-row"}>
                        <div className={"flex flex-row w-9/12 mr-4"}>
                            {/* TODO: Make this some sort of button to display some text or whatever */}
                        </div>
                        <div className={"flex flex-row ml-auto my-auto"}>
                            <ConnectWalletButton/>
                        </div>
                    </div>
                    <div className={"flex flex-row mx-1 mt-1"}>
                        {/* TODO: Also can fill this with something as well ... */}
                        {/*<UserInfoBalance currencyMint={currencyMint}/>*/}
                    </div>
                </div>
            </div>
        </>
    );
}
