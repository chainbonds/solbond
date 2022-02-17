import React, {useEffect, useState} from "react";
import Image from "next/image";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {AllocateParams, PublicKey, TokenAmount} from "@solana/web3.js";
import ConnectWalletPortfolioRow from "./ConnectWalletPortfolioRow";
import PortfolioDiagram from "./DetailedDiagram";

export interface UsdValuePosition {
    totalPositionValue: number,
    usdValueA: number,
    usdValueB: number,
    usdValueLp: number,
};

export default function SinglePortfolioCard(props: any) {

    // Display portfolio value, I guess
    // const [pnlPercent, setPnlPercent] = useState<number>(-5.);
    // useEffect(() => {
    //     setPnlPercent(props.value)
    // }, []);
    // const displayReturn = () => {
    //
    //     if (pnlPercent >= 0.) {
    //         return (
    //             <div className={"flex w-full mx-auto px-auto justify-end text-green-500"}>
    //                 + {pnlPercent} %
    //             </div>
    //         );
    //     } else {
    //         return (
    //             <div className={"flex w-full mx-auto px-auto justify-end text-red-500"}>
    //                 - {-1. * pnlPercent} %
    //             </div>
    //         );
    //     }
    // }

    // const displayReturn = () => {
    //
    //     if (pnlPercent >= 0.) {
    //         return (
    //             <div className={"flex w-full mx-auto px-auto justify-end text-green-500"}>
    //                 + {pnlPercent} %
    //             </div>
    //         );
    //     } else {
    //         return (
    //             <div className={"flex w-full mx-auto px-auto justify-end text-red-500"}>
    //                 - {-1. * pnlPercent} %
    //             </div>
    //         );
    //     }
    // }

    return (
        <>
            {/*
                Working on a row with two elements
            */}


            <div className="flex items-center justify-center w-full h-full">

                <div className="relative text-gray-400 focus-within:text-gray-400 w-full h-full">
                    <div className="flex rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4">
                        {/* Two elements here again? One front, one end*/}
                        <div className={"flex w-full mx-auto px-auto justify-start"}>
                            {props.address}
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-center"}>
                            {props.time}
                        </div>
                        {displayReturn()}
                        {/*<div className={"flex w-full mx-auto px-auto justify-end text-green-500"}>*/}
                        {/*    {props.value}*/}
                        {/*</div>*/}
                        {/*<div className={"flex flex-row w-full items-end"}>*/}
                        {/*    {props.value}*/}
                        {/*</div>*/}
                    </div>
                </div>

            </div>
        </>
    );
}
