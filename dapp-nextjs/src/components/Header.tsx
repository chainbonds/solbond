import React, {FC} from "react";
import {LogoWithTitle} from "./assets/LogoWithTitle";
import {FaucetButton} from "./buttons/FaucetButton";
import {RunFulfillCrankButton} from "./buttons/RunFulfillCrankButton";
import {RunWithdrawCrankButton} from "./buttons/RunWithdrawCrankButton";
import ConnectWalletButton from "./buttons/ConnectWalletButton";

export const Header: FC = ({}) => {

    return (
        <>
            <div
                id={"header-buy-bonds"}
                className="w-full left-0 top-0 py-6 px-6 lg:px-20 lg:py-12"
            >
                <div className="flex flex-col md:flex-row justify-center md:justify-between">
                    <div className={"mx-auto px-auto md:mx-0 md:px-0 md:my-auto md:py-auto"}>
                        <LogoWithTitle/>
                    </div>
                    <div className={"flex-1 px-2 mx-2"}>
                    </div>
                    {/*TODO Implement Devnet show (and also faucet maybe)*/}
                    <div className={"flex my-auto py-auto mx-auto md:mx-0"}>
                        <div className={"flex flex-col md:flex-row"}>
                            <div className={"px-2 py-2 mx-auto md:py-0 md:py-auto md:my-auto"}>
                                <FaucetButton/>
                            </div>

                           {/* <div className={"px-2 py-2 mx-auto md:py-0 md:py-auto md:my-auto"}>
                                <RunFulfillCrankButton />
                            </div>
                            <div className={"px-2 py-2 mx-auto md:py-0 md:py-auto md:my-auto"}>
                                <RunWithdrawCrankButton />
                            </div>*/}
                            <ConnectWalletButton/>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}
