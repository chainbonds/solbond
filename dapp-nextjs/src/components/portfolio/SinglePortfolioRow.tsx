import React, {useState} from "react";
import SinglePortfolioCard from "../modals/SinglePortfolioCard";

export default function SinglePortfolioRow(props: any) {

    const [showPortfolio, setShowPortfolio] = useState<boolean>(false);

    return (
        <>
            <SinglePortfolioCard
                show={showPortfolio}
                setShow={(x: boolean) => setShowPortfolio(x)}
            />
            <div className="flex items-center justify-center w-full h-full">

                <div className="relative text-gray-400 focus-within:text-gray-400 w-full h-full">
                    <div className="flex rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4">
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
                            <button
                                onClick={() => {
                                    setShowPortfolio(true)
                                }}
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
