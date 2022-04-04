import React, {useEffect, useState} from "react";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";
import {AllocData} from "../../types/AllocData";
import {ExplicitPool, ExplicitToken, Protocol, Registry} from "@qpools/sdk";
import {getWhitelistTokens} from "@qpools/sdk";
import {BN} from "@project-serum/anchor";

interface Props {
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    currencyName: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: number) => Promise<number | null>,
    min: number,
    max: number,
    registry: Registry
}
export default function InputFieldWithSliderInputAndLogo({allocationItems, selectedItemKey, currencyName, modifyIndividualAllocationItem, min, max, registry}: Props) {

    const [value, setValue] = useState<number>(0.);
    const [sliderValue, setSliderValue] = useState<number>(0.);
    const [inputValue, setInputValue] = useState<number>(0.);
    const [maxAvailableInputBalance, setMaxAvailableInputBalance] = useState<number>(0.);

    // Define max and the rest here maybe (and also currency-name ...

    const calculateAvailableAmount = async () => {
        if (!allocationItems.has(selectedItemKey)) {
            return;
        }
        let currentlySelectedAsset: AllocData = allocationItems.get(selectedItemKey)!;
        if (!currentlySelectedAsset.userInputAmount) {
            return;
        }
        let inputCurrency = currentlySelectedAsset.userInputAmount!.mint;

        let totalInputtedAmount: BN = new BN(0);
        let walletAmount: BN = new BN(0);
        (await registry.getPoolsByInputToken(inputCurrency.toString()))
            .filter((x: ExplicitPool) => {
                // Gotta create the id same as when loading the data. Create a function for this...
                let id = String(Protocol[x.protocol]) + " " + x.id;
                if (allocationItems.has(id)) {
                    return true
                } else {
                    console.log("Name not found!", id, x, allocationItems);
                    return false
                }
            })
            .map((x: ExplicitPool) => {
                let id = String(Protocol[x.protocol]) + " " + x.id;
                let inputAmount = new BN(allocationItems.get(id)!.userInputAmount!.amount.amount);
                totalInputtedAmount = totalInputtedAmount.add(inputAmount);
            });

        // Get how much the user has in his wallet
        // and display an error message when this constraint is not set ...
        let amountLeft: BN = walletAmount.sub(totalInputtedAmount);
        setMaxAvailableInputBalance(amountLeft.toNumber());
    }
    useEffect(() => {

    }, [allocationItems]);

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
        modifyIndividualAllocationItem(selectedItemKey, sliderValue).then((newValue: number | null) => {
            if (newValue) {
                setValue(newValue);
                setInputValue(newValue);
            }
        });
    }, [sliderValue]);
    useEffect(() => {
        // First, modify the input,
        // Then, if the input is not modifiable, set this value to false ...
        modifyIndividualAllocationItem(selectedItemKey, inputValue).then((newValue: number | null) => {
            if (newValue) {
                setValue(newValue);
                setSliderValue(newValue);
            }
        });
    }, [inputValue]);
    // useEffect(() => {
    //     setSliderValue(value);
    //     setInputValue(value);
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
                    if (newValue > maxAvailableInputBalance) {
                        console.log("Cannot permit ");
                        alert("Cannot permit to pay in more than you own!");
                    } else {
                        setInputValue(newValue)
                    }
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
                        // Gotta double-check that this is not above the maximum balance ...
                        if (newValue > maxAvailableInputBalance) {
                            console.log("Cannot permit ");
                            alert("Cannot permit to pay in more than you own!");
                        } else {
                            setSliderValue(newValue);
                        }
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

    /**
     * TODO: Cap the maximum amount to be inputted ... (?)
     */

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
