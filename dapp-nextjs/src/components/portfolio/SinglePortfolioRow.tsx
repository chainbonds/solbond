import React, {useEffect, useState} from "react";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import {RedeemPortfolioButton} from "../buttons/RedeemPortfolioButton";

export default function SinglePortfolioRow(props: any) {

    useEffect(() => {
        console.log("Found address is: ", props.address);
    }, [])

    return (
        <>
            <div className="flex items-center justify-center w-full h-full">

                <div className="relative text-gray-200 focus-within:text-gray-200 w-full h-full">
                    <div className="flex rounded-lg w-full bg-gray-900 items-center text-right h-14 border-2 border-gray-700 px-6">
                        {/*<div className={"flex w-full mx-auto px-auto justify-start font-medium"}>*/}
                        {/*    Portfolio*/}
                        {/*</div>*/}
                        <div className={"flex w-full mx-auto px-auto justify-start"}>
                            {props.address &&
                                <a href={solscanLink(props.address)} target={"_blank"} rel="noreferrer"
                                   className="text-gray-50 hover:underline font-medium">
                                    {shortenedAddressString(props.address)}
                                </a>
                            }
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-center font-medium"}>
                            ${props.value && props.value.toFixed(2)}
                        </div>
                        <div className={"flex w-full mx-auto px-auto h-full justify-end"}>
                            <RedeemPortfolioButton />
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
