import React, {useEffect, useState} from "react";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";
import {registry} from "@qpools/sdk";
import {AllocData} from "../../types/AllocData";

interface Props {
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    currencyName: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: number) => void,
    min: number,
    max: number
}
export default function InputFieldWithSliderInputAndLogo({allocationItems, selectedItemKey, currencyName, modifyIndividualAllocationItem, min, max}: Props) {

    // TODO: Find a provider that does this for you
    // Probably the UserWalletAssets provider!
    // const qPoolContext: IRpcProvider = useRpc();

    // Have a setter for the value ..
    // Or get this from props ...
    // Probably props is better
    const [value, setValue] = useState<number>(0.);
    const [sliderValue, setSliderValue] = useState<number>(0.);
    const [inputValue, setInputValue] = useState<number>(0.);

    useEffect(() => {
        if (allocationItems.get(selectedItemKey)?.userInputAmount && allocationItems.get(selectedItemKey)!.userInputAmount!.amount.uiAmount) {
            setValue(allocationItems.get(selectedItemKey)!.userInputAmount!.amount!.uiAmount!);
        }
    }, [allocationItems, selectedItemKey]);
    useEffect(() => {
        setValue(sliderValue);
    }, [sliderValue]);
    useEffect(() => {
        setValue(inputValue);
    }, [inputValue]);
    useEffect(() => {
        setSliderValue(value);
        setInputValue(value);

        // Now also modify this quantity ...
        modifyIndividualAllocationItem(selectedItemKey, value);

    }, [value]);

    // Max and Min Fields need to be included
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

    // Maybe this should be a special component ....

    // Gotta pick the token that is whitelisted, and inside the
    if (!allocationItems.get(selectedItemKey)) {
        return (<></>);
    }

    const logoPath = allocationItems.get(selectedItemKey)!.pool?.tokens.filter((x: registry.ExplicitToken) => {return registry.getWhitelistTokens()})[0].logoURI!;
    return (
        <>
            <div className="flex flex-col form-control w-full">
                <div className="mx-auto my-auto p-1 relative text-gray-300 focus-within:text-gray-300 w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 h-full">
                    <div className={"flex w-full my-auto text-center content-center"}>
                        <Image alt={currencyName} src={logoPath} height={34} width={34} className={"rounded-3xl"}/>
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
            {/*    TODO: Add the connect wallet button here, perhaps (?)*/}
        </>
    );
}