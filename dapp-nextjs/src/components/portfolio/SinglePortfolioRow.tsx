import React, {useEffect, useState} from "react";
import SinglePortfolioCard from "../modals/SinglePortfolioCard";
import {shortenedAddressString, solscanLink} from "../../utils/utils";

export default function SinglePortfolioRow(props: any) {

    const [showPortfolio, setShowPortfolio] = useState<boolean>(false);

    useEffect(() => {
        console.log("Found address is: ", props.address);
    }, [])

    return (
        <>
            <SinglePortfolioCard
                show={showPortfolio}
                setShow={(x: boolean) => setShowPortfolio(x)}
            />
            <div className="flex items-center justify-center w-full h-full">

                <div className="relative text-gray-200 focus-within:text-gray-200 w-full h-full">
                    <div className="flex rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4 border-2 border-gray-700 ">
                        <div className={"flex w-full mx-auto px-auto justify-start font-medium"}>
                            Portfolio
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-center"}>
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
                        <div className={"flex w-full mx-auto px-auto justify-end"}>
                            <button
                                onClick={() => {
                                    setShowPortfolio(true)
                                }}
                                className="text-gray-50 font-medium"
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
