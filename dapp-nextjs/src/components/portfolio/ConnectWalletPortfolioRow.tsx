import React from "react";

export default function ConnectWalletPortfolioRow(props: any) {

    return (
        <>
            <div className="flex items-center justify-center w-full h-full">
                <div className="relative text-gray-400 focus-within:text-gray-400 w-full h-full">
                    <div className="flex rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4">
                        <div className={"flex w-full mx-auto px-auto justify-center"}>
                            {props.text}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
