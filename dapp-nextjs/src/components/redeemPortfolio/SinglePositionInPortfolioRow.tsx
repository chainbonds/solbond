import React from "react";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import {PublicKey} from "@solana/web3.js";
import {RedeemPortfolioButton} from "./RedeemPortfolioButton";

interface Props {
    address: PublicKey,
    value: number
}
export default function SinglePositionInPortfolioRow({address, value}: Props) {

    return (
        <>
            <div className="flex items-center justify-center w-full h-full">
                <div className="relative text-gray-200 focus-within:text-gray-200 w-full h-full">
                    <div
                        className="flex rounded-lg w-full bg-gray-900 items-center text-right h-14 border-2 border-gray-700 px-6">
                        <div className={"flex w-full mx-auto px-auto justify-start"}>
                            {address &&
                            <a href={solscanLink(address)} target={"_blank"} rel="noreferrer"
                               className="text-gray-50 hover:underline font-medium">
                                {shortenedAddressString(address)}
                            </a>
                            }
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-center font-medium"}>
                            ${value && value.toFixed(2)}
                        </div>
                        <div className={"flex w-full mx-auto px-auto h-full justify-end"}>
                            <RedeemPortfolioButton/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
