import React, {useEffect, useState} from "react";
import Image from "next/image";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {AllocateParams, PublicKey, TokenAmount} from "@solana/web3.js";
import ConnectWalletPortfolioRow from "./ConnectWalletPortfolioRow";
import PortfolioDiagram from "./DetailedDiagram";
import SinglePortfolioCard from "./SinglePortfolioCard";
import {solscanLink} from "../../utils/utils";

export default function SinglePortfolioRow(props: any) {

    const [showPortfolio, setShowPortfolio] = useState<boolean>(false);

    return (
        <>
            {/* First comes the modal */}
            <SinglePortfolioCard
                show={showPortfolio}
                setShow={(x: boolean) => setShowPortfolio(x)}
            />
            {/* Then the actual stuff */}
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
                        <div className={"flex w-full mx-auto px-auto justify-center"}>
                            ${props.value && props.value.toFixed(2)}
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-end"}>
                            {/*<button*/}
                            {/*    className={"rounded-lg bg-pink-700 hover:bg-pink-900 py-1 my-auto w-full content-center"}*/}
                            {/*>*/}
                            {/*    View*/}
                            {/*</button>*/}
                            <button
                                onClick={() => {setShowPortfolio(true)}}
                                className="text-blue-600 dark:text-blue-500"
                            >
                                View
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
