import React, {useEffect, useState} from "react";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";
import {AllocData, keyFromPoolData} from "../../types/AllocData";
import {BN} from "@project-serum/anchor";
import {TokenAmount} from "@solana/web3.js";
import {ExplicitPool, ExplicitToken, getMarinadeSolMint, getTokenAmount, Registry, getWhitelistTokens} from "@qpools/sdk";

// TODO: I guess most numbers here should be replaced by TokenAmount, and then the lamports should be the inputs, and the uiAmounts should be the display values?
//  Not sure if typescript can handle these though
interface Props {
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    currencyName: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: TokenAmount) => Promise<void>,
    min: TokenAmount,
    max: TokenAmount,
    registry: Registry
}
export default function InputFieldWithSliderInputAndLogo({allocationItems, selectedItemKey, currencyName, modifyIndividualAllocationItem, min, max, registry}: Props) {

    const [value, setValue] = useState<number>(0.);
    const [sliderValue, setSliderValue] = useState<number>(0.);
    const [inputValue, setInputValue] = useState<number>(0.);
    const [maxAvailableInputBalance, setMaxAvailableInputBalance] = useState<TokenAmount>(max);
    const [totalInputBalance, setTotalInputBalance] = useState<TokenAmount>(min);
    const [currentlySelectedAsset, setCurrentlySelectedAsset] = useState<AllocData>();

    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (!allocationItems.has(selectedItemKey)) {
            console.log("Selected key not found ...", allocationItems, selectedItemKey);
            return;
        }
        let currentlySelectedAsset: AllocData = allocationItems.get(selectedItemKey)!;
        setCurrentlySelectedAsset(() => {return currentlySelectedAsset});
    }, [allocationItems, selectedItemKey]);

    const calculateTotalDepositingAmount = async () => {
        if (!currentlySelectedAsset) {
            return
        }
        let inputCurrency = currentlySelectedAsset.userInputAmount!.mint;
        let totalInputtedAmount: BN = new BN(0);
        let decimals: number = currentlySelectedAsset.userWalletAmount!.amount.decimals;
        (await registry.getPoolsByInputToken(inputCurrency.toString()))
            .filter((x: ExplicitPool) => {
                // Gotta create the id same as when loading the data. Create a function for this...
                let id = keyFromPoolData(x);
                if (allocationItems.has(id)) {
                    return true
                } else {
                    console.log("Name not found!", id, x, allocationItems);
                    return false
                }

            })
            .map((x: ExplicitPool) => {
                let id = keyFromPoolData(x);
                let inputAmount = new BN(allocationItems.get(id)!.userInputAmount!.amount.amount);
                totalInputtedAmount = totalInputtedAmount.add(inputAmount);
            });
        let readableTotalInputtedAmount: TokenAmount = getTokenAmount(totalInputtedAmount, new BN(decimals));
        console.log("Readable total input amount is: ", readableTotalInputtedAmount);
        setTotalInputBalance(readableTotalInputtedAmount);
    }

    // Define max and the rest here maybe (and also currency-name ...
    // diff: number
    const calculateAvailableAmount = async () => {
        if (!currentlySelectedAsset) {
            return
        }
        if (!currentlySelectedAsset.userInputAmount) {
            console.log("input amount not found ...", currentlySelectedAsset.userInputAmount);
            return;
        }
        let inputCurrency = currentlySelectedAsset.userInputAmount!.mint;

        // Get the full wallet amount ..
        let walletAmount: BN = new BN(currentlySelectedAsset.userWalletAmount!.amount!.amount);
        let decimals: number = currentlySelectedAsset.userWalletAmount!.amount.decimals;
        let totalInputtedAmount: BN = new BN(0);
        (await registry.getPoolsByInputToken(inputCurrency.toString()))
            .filter((x: ExplicitPool) => {
                // Gotta create the id same as when loading the data. Create a function for this...
                let id = keyFromPoolData(x);
                let currentElementsId = selectedItemKey;

                console.log("id and current element id is: ", id, currentElementsId);
                // Also ignore the element with this key ...
                if (currentElementsId === id) {
                    return false;
                }

                if (allocationItems.has(id)) {
                    return true
                } else {
                    console.log("Name not found!", id, x, allocationItems);
                    return false
                }

            })
            .map((x: ExplicitPool) => {
                let id = keyFromPoolData(x);
                let inputAmount = new BN(allocationItems.get(id)!.userInputAmount!.amount.amount);
                totalInputtedAmount = totalInputtedAmount.add(inputAmount);
            });

        let amountLeft: BN = walletAmount.sub(totalInputtedAmount);
        console.log("All amounts are: ", walletAmount.toString(), totalInputtedAmount.toString(), amountLeft.toString());
        // Gotta divide the available amount by the decimals ...
        // max input available amount should also be a tokenamount
        let amountLeftAsTokenAmount: TokenAmount = getTokenAmount(amountLeft, new BN(decimals));
        // let newMaxInputAmount: number = (amountLeft.toNumber() / (10 ** decimals));
        console.log(amountLeftAsTokenAmount);
        setMaxAvailableInputBalance(amountLeftAsTokenAmount);
    }
    useEffect(() => {
        calculateAvailableAmount();
        calculateTotalDepositingAmount();
    }, [selectedItemKey, allocationItems, value]);

    useEffect(() => {
        console.log("Total Input Balance Changed!");
        console.log(totalInputBalance);
    }, [totalInputBalance]);

    useEffect(() => {
        if (allocationItems.get(selectedItemKey)!.userInputAmount!.amount!.uiAmount!) {
            if (currentlySelectedAsset?.pool.lpToken.address?.toString() === getMarinadeSolMint().toString()) {
                setValue(0.);
            } else {
                setValue(allocationItems.get(selectedItemKey)!.userInputAmount!.amount!.uiAmount!);
            }
        }
    }, []);

    useEffect(() => {
        if (
            allocationItems.has(selectedItemKey) && allocationItems.get(selectedItemKey)?.userInputAmount &&
            allocationItems.get(selectedItemKey)!.userInputAmount!.amount.uiAmount
        ) {
            setValue(allocationItems.get(selectedItemKey)!.userInputAmount!.amount!.uiAmount!);
        }
    }, [selectedItemKey]);
    useEffect(() => {
        setValue(sliderValue);
    }, [sliderValue]);
    useEffect(() => {
        setValue(inputValue);
    }, [inputValue]);
    useEffect(() => {
        if (!currentlySelectedAsset) {
            return;
        }
        if (!currentlySelectedAsset.userInputAmount) {
            console.log("input amount not found ...", currentlySelectedAsset.userInputAmount);
            return;
        }
        console.log("Value that we're getting is: ", value);
        let power = (new BN(10)).pow(new BN(currentlySelectedAsset.userInputAmount!.amount.decimals));
        console.log("power is: ", power.toString());
        let numberInclDecimals: BN = power.muln(value);
        console.log("Number incl decimals is: ", numberInclDecimals.toString());
        let tokenAmount: TokenAmount = getTokenAmount(numberInclDecimals, new BN(currentlySelectedAsset.userInputAmount!.amount.decimals));
        console.log("Number incl decimals is: ", tokenAmount);
        modifyIndividualAllocationItem(selectedItemKey, tokenAmount).then(() => {
            calculateAvailableAmount();
        });
    }, [value]);

    // Add the blocker here, maybe (?)

    const inputTextField = () => {

        // Calculate minimum and maximum again

        return (<>
            <input
                className="rounded-lg w-full items-end text-right h-12 p-4"
                style={{backgroundColor: BRAND_COLORS.slate700}}
                type="number"
                id="stake_amount"
                autoComplete="stake_amount"
                placeholder="0.0"
                step={"0.000000001"}
                min={min.uiAmount!}
                max={max.uiAmount!}
                value={value}
                onChange={async (event) => {
                    let newValue = Number(event.target.value);
                    console.log("New " + String(currencyName) + " is: " + String(newValue));
                    // let diff: number = Math.max(newValue - value, 0.);
                    await calculateAvailableAmount();
                    // Add the difference ...
                    // TODO: Also add the case that the user does less than this total value ...
                    // let diff = newValue - value;

                    console.log("LP (1) is: ", currentlySelectedAsset!.pool.lpToken.address.toString());
                    // console.log("LP (2) is: ", currentlySelectedAsset!.userInputAmount!.mint!.toString());
                    if (currentlySelectedAsset!.pool.lpToken.address!.toString() === getMarinadeSolMint().toString()) {
                        if (newValue > 0 && newValue < 1) {
                            console.log("Cannot permit (0)");
                            setInputValue(0.);
                            setErrorMessage("The Marinade Finance Protocol requires you to input at least one full SOL to be delegated. You can also keep it at 0 SOL.");
                            return;
                        } else {
                            setInputValue(newValue);
                            setErrorMessage("");
                        }
                    }

                    if (newValue > maxAvailableInputBalance.uiAmount!) {
                        console.log("Cannot permit (1)");
                        setInputValue(maxAvailableInputBalance.uiAmount!);
                        setErrorMessage("You cannot input more than there is in your wallet!");
                        return;
                    } else {
                        setInputValue(newValue);
                        setErrorMessage("");
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
                    min={min.uiAmount!}
                    max={max.uiAmount!}
                    onChange={async (event) => {
                        let newValue = Number(event.target.value);
                        console.log("New " + String(currencyName) + " is: " + String(newValue));
                        // Gotta double-check that this is not above the maximum balance ...
                        // let diff: number = Math.max(newValue - value, 0.);
                        // diff
                        await calculateAvailableAmount();

                        console.log("LP (1) is: ", currentlySelectedAsset!.pool.lpToken.address.toString());
                        // console.log("LP (2) is: ", currentlySelectedAsset!.userInputAmount!.mint!.toString());
                        if (currentlySelectedAsset!.pool.lpToken.address!.toString() === getMarinadeSolMint().toString()) {
                            if ((newValue > 0 && newValue < 1) || (value > 0 && value < 1)) {
                                console.log("Cannot permit (0)");
                                setSliderValue(0.);
                                setErrorMessage("The Marinade Finance Protocol requires you to input at least one full SOL to be delegated. You can also keep it at 0 SOL.");
                                return;
                            } else {
                                setSliderValue(newValue);
                                setErrorMessage("");
                            }
                        }


                        if (newValue > maxAvailableInputBalance.uiAmount!) {
                            console.log("Cannot permit (2)");
                            setSliderValue(maxAvailableInputBalance.uiAmount!);
                            setErrorMessage("You cannot input more than there is in your wallet!");
                            return;
                        } else {
                            setSliderValue(newValue);
                            setErrorMessage("");
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
    const logoPath = allocationItems.get(selectedItemKey)!.pool?.tokens.filter((x: ExplicitToken) => {
        return getWhitelistTokens()
    })[0].logoURI!;
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
                <div className={"flex flex-col"}>
                    <div className={"items-start justify-start"}>
                        { (
                            allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.uiAmount ||
                            allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.uiAmount === 0
                            ) ?
                            (
                                <div className={"text-gray-500 text-sm font-semibold items-start justify-start"}>
                                    Planning to deposit: {
                                    // (totalInputBalance)?.toFixed(Math.min(8, allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.decimals!))
                                    (allocationItems.get(selectedItemKey)?.userInputAmount?.amount.uiAmount!).toFixed(Math.min(8, allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.decimals!))
                                } out of {
                                    (allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.uiAmount!).toFixed(2)
                                } {currencyName} in Your Wallet
                                </div>
                            ) : (
                                <div className={"text-gray-500 text-sm font-semibold items-start justify-start"}>
                                    Wallet Loading ...
                                </div>
                            )
                        }
                    </div>
                    <div className={"text-red-500 text-sm font-bold"}>
                        {errorMessage && errorMessage}
                        {!errorMessage && <span>&nbsp;</span>}
                    </div>
                </div>
            </div>
        </>
    );
}
