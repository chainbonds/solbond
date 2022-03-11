import React from "react";
import Image from "next/image";

export default function InputFieldWithLogo(props: any) {

    return (
        <>
            <div className="flex items-center justify-center w-full h-full">
                <div className="relative text-gray-600 focus-within:text-gray-400 w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2">

                    <div className={"flex h-max w-max"}>
                        <Image alt={props.displayText} src={props.logoPath} height={40} width={40}/>
                        <text className={"my-auto mx-2"}>
                            {props.displayText}
                        </text>
                    </div>
                    </span>
                    {props.modifiable &&
                    <input
                        className="rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4"
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
                    }
                    {!props.modifiable &&
                    <div
                        className="rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4"
                        id="stake_amount"
                        placeholder="0.0"
                    >{props.value}</div>
                    }
                </div>
            </div>
        </>
    );
}