import React from "react";
import Image from "next/image";

export default function SinglePortfolioRow(props: any) {


    return (
        <>
            {/*
                Working on a row with two elements
            */}
            <div className="flex items-center justify-center w-full h-full">
                <div className="relative text-gray-300 focus-within:text-gray-400 w-full h-full">
                    <div className="flex rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4">
                        {/* Two elements here again? One front, one end*/}
                        <div className={"flex w-full mx-auto px-auto justify-start"}>
                            {props.address}
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-center"}>
                            {props.time}
                        </div>
                        <div className={"flex w-full mx-auto px-auto justify-end text-green-500"}>
                            {props.value}
                        </div>
                        {/*<div className={"flex flex-row w-full items-end"}>*/}
                        {/*    {props.value}*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </>
    );
}
