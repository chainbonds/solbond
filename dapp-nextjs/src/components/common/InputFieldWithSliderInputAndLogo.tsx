import React, {ChangeEvent, useEffect, useState} from "react";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";
import {AllocData, keyFromPoolData} from "../../types/AllocData";
import {BN} from "@project-serum/anchor";
import {TokenAmount} from "@solana/web3.js";
import {
    ExplicitPool,
    ExplicitToken,
    getMarinadeSolMint,
    getTokenAmount,
    Registry,
    getWhitelistTokens
} from "@qpools/sdk";
import {SelectedToken} from "../../utils/utils";
import {use} from "i18next";
import {Property} from "csstype";
import All = Property.All;

// TODO: I guess most numbers here should be replaced by TokenAmount, and then the lamports should be the inputs, and the uiAmounts should be the display values?
//  Not sure if typescript can handle these though
interface Props {
    selectedInputToken: SelectedToken,
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: TokenAmount) => Promise<void>,
    // currencyName: string,
    // min: TokenAmount,
    // max: TokenAmount,
    registry: Registry
}

export default function InputFieldWithSliderInputAndLogo({
                                                             selectedInputToken,
                                                             allocationItems,
                                                             selectedItemKey,
                                                             modifyIndividualAllocationItem,
                                                             registry
                                                         }: Props) {

    /**
     * Peripheral state
     */
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Let's hope this is copy by reference
    /**
     * Get a reference to the currently selected asset
     */
    const [selectedAsset, setSelectedAsset] = useState<AllocData>();
    useEffect(() => {
        if (!allocationItems.has(selectedItemKey)) {
            console.log("Selected key not found ...", allocationItems, selectedItemKey);
            return;
        }
        setSelectedAsset((oldSelectedAsset: AllocData | undefined) => {
            let currentlySelectedAsset: AllocData = allocationItems.get(selectedItemKey)!;
            return currentlySelectedAsset;
        })
    }, [allocationItems, selectedItemKey]);


    /**
     * Define the maximum and minimum deposable amounts
     */
    const [min, setMin] = useState<number>(0);
    const [max, setMax] = useState<number>(100);
    useEffect(() => {
        if (selectedAsset && selectedAsset.userWalletAmount?.amount.uiAmount) {
            setMin(0);
            setMax(selectedAsset.userWalletAmount.amount.uiAmount);
        }
    }, [selectedAsset]);

    /**
     * Define the state for the UI elements ...
     */
        // Set the initial state to what the user has in his currently-selected-asset
    const [sliderValue, setSliderValue] = useState<number>(0.);
    const [inputValue, setInputValue] = useState<number>(0.);
    useEffect(() => {
        if (selectedAsset && selectedAsset.userInputAmount) {
            setSliderValue(selectedAsset!.userInputAmount!.amount.uiAmount!);
            setInputValue(selectedAsset!.userInputAmount!.amount.uiAmount!);
        }
    }, [selectedAsset]);
    useEffect(() => {
        // setInputValue(sliderValue);
    }, [sliderValue]);
    useEffect(() => {
        // setSliderValue(inputValue);
    }, [inputValue]);

    /**
     * Define the state for anything that defines the amount, or helps calculate better amounts ...
     */
        // For now, we can do this dirty trick.
        // For mainnet, we cannot anymore because there will be too many pools with similar ids ...
    const [allocationDataWithThisInputToken, setAllocationDataWithThisInputToken] = useState<AllocData[]>([]);
    useEffect(() => {
        // Why do we need the registry for this? Just take it from the pool of the allocation data (?)
        let relevantPools: AllocData[] = Array.from(allocationItems.values())
            .filter((x: AllocData) => {
                return x.userInputAmount!.mint.toString() === selectedInputToken.mint.toString();
            });
        setAllocationDataWithThisInputToken(relevantPools);
    }, [allocationItems, selectedAsset]);

    const [totalDepositedAmount, setTotalDepositedAmount] = useState<BN>(new BN(0));
    const [totalAvailableAmount, setTotalAvailableAmount] = useState<BN>(new BN(0));
    useEffect(() => {
        let depositedAmount: BN = new BN(0);
        let walletAmount: BN = new BN(0);
        allocationDataWithThisInputToken.map((x: AllocData) => {
            let add = new BN(x.userInputAmount!.amount.amount);
            depositedAmount = depositedAmount.add(add);
        });
        // Do an assert that all these are equivalent
        allocationDataWithThisInputToken.map((x: AllocData) => {
            walletAmount = new BN(x.userWalletAmount!.amount.amount);
        })
        setTotalDepositedAmount(depositedAmount);
        setTotalAvailableAmount(walletAmount);
    }, [allocationDataWithThisInputToken]);

    /**
     * Turns the new value into a TokenAmount,
     * @param newValue
     */
    const updateValue = (newValue: number) => {
        let decimals = new BN(selectedAsset!.userInputAmount!.amount.decimals);
        let power = (new BN(10)).pow(decimals);
        console.log("power is: ", power.toString());
        console.log("Value that we're getting is: ", newValue);
        let numberInclDecimals: BN = power.muln(newValue);
        console.log("Number incl decimals is: ", numberInclDecimals.toString());
        let tokenAmount: TokenAmount = getTokenAmount(numberInclDecimals, decimals);
        console.log("Number incl decimals is: ", tokenAmount);
        modifyIndividualAllocationItem(selectedItemKey, tokenAmount)
    }

    // Add the blocker here, maybe (?)
    const onChangeInputTextField = (event: ChangeEvent<HTMLInputElement>) => {
        let newValue = Number(event.target.value);
        console.log("New " + String(selectedInputToken.name) + " is: " + String(newValue));

        let finalNewValue: number;
        if (newValue > totalAvailableAmount.toNumber()) {
            console.log("Cannot permit (1)");
            finalNewValue = totalAvailableAmount.toNumber();
            setErrorMessage("You cannot input more than there is in your wallet!");
        } else if (
            (selectedAsset!.pool.lpToken.address!.toString() === getMarinadeSolMint().toString()) &&
            (newValue > 0 && newValue < 1)
        ) {
            console.log("Cannot permit (0)");
            finalNewValue = 0.;
            setErrorMessage("The Marinade Finance Protocol requires you to input at least one full SOL to be delegated. You can also keep it at 0 SOL.");
        } else {
            finalNewValue = newValue;
            setErrorMessage("");
        }
        setInputValue(finalNewValue);
        // updateValue(finalNewValue);
    }

    const onChangeInputRangeField = (event: ChangeEvent<HTMLInputElement>) => {
        let newValue = Number(event.target.value);
        console.log("New " + String(selectedInputToken.name) + " is: " + String(newValue));
        // Gotta double-check that this is not above the maximum balance ...
        let finalNewValue: number;
        if (newValue > totalAvailableAmount.toNumber()) {
            console.log("Cannot permit (2)");
            finalNewValue = totalAvailableAmount.toNumber();
            setErrorMessage("You cannot input more than there is in your wallet!");
        } else if (
            (selectedInputToken.mint!.toString() === getMarinadeSolMint().toString()) &&
            (newValue > 0 && newValue < 1)
        ) {
            console.log("Cannot permit (0)");
            finalNewValue = 0.;
            setErrorMessage("The Marinade Finance Protocol requires you to input at least one full SOL to be delegated. You can also keep it at 0 SOL.");
        } else {
            finalNewValue = newValue
            setErrorMessage("");
        }
        setSliderValue(finalNewValue);
        // updateValue(finalNewValue);
    }

    if (!selectedAsset) {
        return (<></>);
    }

    console.log("Allocation Items are: ", allocationItems);
    const logoPath = selectedAsset!.pool?.tokens.filter((x: ExplicitToken) => {
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
                        <Image alt={selectedInputToken.name} src={logoPath} height={34} width={34}
                               className={"rounded-3xl"}/>
                        }
                        <text className={"my-auto text-center content-center mx-2"}>
                            {selectedInputToken.name}
                        </text>
                    </div>
                    </span>
                    <input
                        className="rounded-lg w-full items-end text-right h-12 p-4"
                        style={{backgroundColor: BRAND_COLORS.slate700}}
                        type="number"
                        id="stake_amount"
                        autoComplete="stake_amount"
                        placeholder="0.0"
                        step={"0.000000001"}
                        min={min}
                        max={max}
                        value={inputValue}
                        onChange={onChangeInputTextField}
                    />
                </div>
                <div className={"mx-auto my-auto p-1 w-full"}>
                    <input
                        type="range"
                        step={"0.000000001"}
                        min={min}
                        max={max}
                        onChange={onChangeInputRangeField}
                        value={sliderValue}
                        className="range range-xs"
                    />
                </div>
                <div className={"flex flex-col"}>
                    <div className={"items-start justify-start"}>
                        {(
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
                                } {selectedInputToken.name} in Your Wallet
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
