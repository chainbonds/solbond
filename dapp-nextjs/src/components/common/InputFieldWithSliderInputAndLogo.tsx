import React, {useEffect, useState} from "react";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";
import {AllocData} from "../../types/AllocData";
import {ExplicitToken} from "@qpools/sdk";
import {getWhitelistTokens} from "@qpools/sdk";

interface Props {
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    currencyName: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: number) => Promise<number>,
    min: number,
    max: number
}
export default function InputFieldWithSliderInputAndLogo({allocationItems, selectedItemKey, currencyName, modifyIndividualAllocationItem, min, max}: Props) {

    const [value, setValue] = useState<number>(0.);
    const [sliderValue, setSliderValue] = useState<number>(0.);
    const [inputValue, setInputValue] = useState<number>(0.);

    useEffect(() => {
        if (allocationItems.get(selectedItemKey)!.userInputAmount!.amount!.uiAmount!) {
            setValue(allocationItems.get(selectedItemKey)!.userInputAmount!.amount!.uiAmount!);
        }
    }, []);

    useEffect(() => {
        if (allocationItems.has(selectedItemKey) && allocationItems.get(selectedItemKey)?.userInputAmount && allocationItems.get(selectedItemKey)!.userInputAmount!.amount.uiAmount) {
            setValue(allocationItems.get(selectedItemKey)!.userInputAmount!.amount!.uiAmount!);
        }
    }, [selectedItemKey]);  // allocationItems,
    useEffect(() => {
        modifyIndividualAllocationItem(selectedItemKey, inputValue).then((newValue: number) => {
            setValue(newValue);
        });
    }, [sliderValue]);
    useEffect(() => {
        // First, modify the input,
        // Then, if the input is not modifiable, set this value to false ...
        modifyIndividualAllocationItem(selectedItemKey, inputValue).then((newValue: number) => {
            setValue(newValue);
        });
    }, [inputValue]);
    // useEffect(() => {
    //     // setSliderValue(value);
    //     // setInputValue(value);
    //     // Now also modify this quantity ...
    //     // TODO: Check if you can put these in again, after you implement the max logic
    //     // modifyIndividualAllocationItem(selectedItemKey, value);
    // }, [value]);

    // Add the blocker here, maybe (?)

    const inputTextField = () => {
        return (<>
            <input
                className="rounded-lg w-full items-end text-right h-12 p-4"
                style={{backgroundColor: BRAND_COLORS.slate700}}
                type="number"
                id="stake_amount"
                autoComplete="stake_amount"
                placeholder="0.0"
                step={"0.0001"}
                min={min}
                max={max}
                value={value}
                onChange={(event) => {
                    let newValue = Number(event.target.value);
                    console.log("New " + String(currencyName) + " is: " + String(newValue));
                    setInputValue(newValue)
                }}
            />
        </>)
    }

    const inputRangeField = () => {
        return (<>
                <input
                    type="range"
                    step={"0.0001"}
                    min={min}
                    max={max}
                    onChange={(event) => {
                        let newValue = Number(event.target.value);
                        console.log("New " + String(currencyName) + " is: " + String(newValue));
                        setSliderValue(newValue);
                    }}
                    value={value}
                    className="range range-xs"
                />
            </>
        )
    }

    if (!allocationItems.has(selectedItemKey)) {
        return (<></>);
    }

    console.log("Allocation Items are: ", allocationItems);
    const logoPath = allocationItems.get(selectedItemKey)!.pool?.tokens.filter((x: ExplicitToken) => {return getWhitelistTokens()})[0].logoURI!;
    console.log("Logo Path is: ", logoPath);
    return (
        <>
            <div className="flex flex-col form-control w-full">
                <div className="mx-auto my-auto p-1 relative text-gray-300 focus-within:text-gray-300 w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 h-full">
                    <div className={"flex w-full my-auto text-center content-center"}>
                        {logoPath &&
                            <Image alt={currencyName} src={logoPath} height={34} width={34} className={"rounded-3xl"}/>
                        }
                        <text className={"my-auto text-center content-center mx-2"}>
                            {currencyName}
                        </text>
                    </div>
                    </span>
                    {inputTextField()}
                </div>
                <div className={"mx-auto my-auto p-1 w-full"}>
                    {inputRangeField()}
                </div>
            </div>
        </>
    );
}
