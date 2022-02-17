import React, {useEffect, useState} from "react";
import Image from "next/image";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {AllocateParams, PublicKey, TokenAmount} from "@solana/web3.js";
import ConnectWalletPortfolioRow from "./ConnectWalletPortfolioRow";
import PortfolioDiagram from "./DetailedDiagram";
import SinglePortfolioCard from "./SinglePortfolioCard";

export default function SinglePortfolioRow(props: any) {

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

    // TODO: When click, implement the row

    return (
        <>
            {/*
                Working on a row with two elements
            */}

            <SinglePortfolioCard
                show={true}
            />


            <div className="flex items-center justify-center w-full h-full">

                <div className="relative text-gray-400 focus-within:text-gray-400 w-full h-full">
                    <div className="flex rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4">
                        {/* Two elements here again? One front, one end*/}
                        <div className={"flex w-full mx-auto px-auto justify-start"}>
                            Portfolio
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-center"}>
                            {props.address}
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-end"}>
                            ${props.value && props.value.toFixed(2)}
                        </div>
                        {/*
                            TODO: Use this
                        */}
                    </div>
                </div>

            </div>
        </>
    );
}
