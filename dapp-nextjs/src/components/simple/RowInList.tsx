import React from "react";

interface Props {
    text: string
}
export default function RowInList({text}: Props) {

    return (
        <>
            <div className="flex items-center justify-center w-full h-full">
                <div className="relative text-gray-400 focus-within:text-gray-400 w-full h-full">
                    <div className="flex rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4">
                        <div className={"flex w-full mx-auto px-auto justify-center"}>
                            {text}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
