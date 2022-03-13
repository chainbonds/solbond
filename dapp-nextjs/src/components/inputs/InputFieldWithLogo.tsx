import React from "react";
import Image from "next/image";

export default function InputFieldWithLogo(props: any) {

    const inputField = () => {
        return (<>
            <input
                className="rounded-lg w-full bg-gray-200 items-end text-right h-12 p-4 text-gray-900"
                type="number"
                id="stake_amount"
                {...props.registerFunction()}
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
                className="rounded-lg w-full bg-gray-200 items-end text-right h-12 p-4"
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
                <div className="relative text-gray-900 focus-within:text-gray-900 w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 w-full">
                    <div className={"flex w-full"}>
                        <Image alt={props.displayText} src={props.logoPath} height={34} width={34}/>
                        <text className={"my-auto mx-2 w-full"}>
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
