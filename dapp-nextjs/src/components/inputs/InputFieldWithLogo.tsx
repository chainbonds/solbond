import React from "react";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";

export default function InputFieldWithLogo(props: any) {

    const inputField = () => {
        return (<>
            <input
                className="rounded-lg w-full items-end text-right h-12 p-4"
                style={{backgroundColor: BRAND_COLORS.slate700}}
                type="number"
                id="stake_amount"
                autoComplete="stake_amount"
                placeholder="0.0"
                step={"0.0001"}
                min="0"
                onChange={(event) => {
                    let newValue = Number(event.target.value);
                    console.log("New " + String(props.displayText) + " is: " + String(newValue));
                    props.setNewValue(newValue);
                }}
            />
        </>)
    }

    const displayField = () => {
        return (
            <div
                className="rounded-lg w-full items-end text-right h-12 p-4"
                style={{backgroundColor: BRAND_COLORS.slate700}}
                id="stake_amount"
                placeholder="0.0"
            >
                {props.value}
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-row w-full h-full mx-0">
                <div className="relative text-gray-300 focus-within:text-gray-300 w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 h-full">
                    <div className={"flex w-full my-auto text-center content-center"}>
                        <Image alt={props.displayText} src={props.logoPath} height={34} width={34}/>
                        <text className={"my-auto text-center content-center mx-2"}>
                            {props.displayText}
                        </text>
                    </div>
                    </span>
                    {props.modifiable ? inputField() : displayField()}
                </div>
            </div>
        </>
    );
}