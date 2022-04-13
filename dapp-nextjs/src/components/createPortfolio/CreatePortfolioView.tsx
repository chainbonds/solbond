import React, {useEffect, useState} from "react";
import {AllocData} from "../../types/AllocData";
import {getInputToken, SelectedToken} from "../../utils/utils";
import InputFieldWithSliderInputAndLogo from "../common/InputFieldWithSliderInputAndLogo";
import PurchaseButton from "../createPortfolio/buttons/PurchaseButton";
import { Registry } from "@qpools/sdk";
import {TokenAmount} from "@solana/web3.js";
import {BN} from "@project-serum/anchor";
import {UserTokenBalance} from "../../types/UserTokenBalance";

interface Props {
    allocationItems: Map<string, AllocData>,
    setAllocationItems:  React.Dispatch<React.SetStateAction<Map<string, AllocData>>>
    selectedItemKey: string,
    // modifyIndividualAllocationItem: (arg0: string, arg1: TokenAmount) => Promise<TokenAmount>,
    registry: Registry
}
export default function CreatePortfolioView({allocationItems, selectedItemKey, setAllocationItems, registry}: Props) {

    const [selectedToken, setSelectedToken] = useState<SelectedToken | null>();

    const getSelectedToken = async () => {
        if (!allocationItems) {return;}
        if (!selectedItemKey) {return;}
        let asset = allocationItems.get(selectedItemKey)!;
        console.log("Asset is: ", asset);
        console.log("Pool is: ", asset.pool);
        let selectedAssetTokens = asset.pool!.tokens;
        let inputToken: SelectedToken = await getInputToken(selectedAssetTokens);
        setSelectedToken(inputToken);
        console.log("Input token in: ", inputToken);
        console.log("Asset that we're looking at is: ", asset);
    }
    useEffect(() => {
        getSelectedToken()
    }, [selectedItemKey]);

    if (!allocationItems) {
        return <></>
    }

    return (
        <>
            <div className={"flex pb-2 w-full"}>
                <div className={"flex flex-col w-full"}>
                    <div className={"flex flex-row"}>
                        <div className={"flex flex-row w-9/12 mr-4"}>
                            { (selectedToken && allocationItems.has(selectedItemKey) && allocationItems.get(selectedItemKey)?.userWalletAmount ) &&
                                <InputFieldWithSliderInputAndLogo
                                    selectedInputToken={selectedToken}
                                    selectedItemKey={selectedItemKey}
                                    setAllocationItems={setAllocationItems}
                                    allocationItems={allocationItems}
                                    registry={registry}
                                />
                            }
                        </div>
                        <div className={"flex flex-row ml-auto my-auto mt-1"}>
                            <PurchaseButton passedAllocationData={allocationItems}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
