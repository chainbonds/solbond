import React, {useEffect, useState} from "react";
import OnramperModal from "../onramper/OnramperModal"
import {AllocData} from "../../types/AllocData";
import {getInputToken, SelectedToken} from "../../utils/utils";
import InputFieldWithSliderInputAndLogo from "../common/InputFieldWithSliderInputAndLogo";
import PurchaseButton from "../createPortfolio/buttons/PurchaseButton";
import {TokenAmount} from "@solana/web3.js";
import * as qpools from "@qpools/sdk";

interface Props {
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: TokenAmount) => Promise<void>,
    registry: qpools.helperClasses.Registry
}
export default function CreatePortfolioView({allocationItems, selectedItemKey, modifyIndividualAllocationItem, registry}: Props) {

    const [displayOnramperModal, setDisplayOnramperModal] = useState<boolean>(false);
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
            <OnramperModal
                isOpen={displayOnramperModal}
                onClose={() => {
                    setDisplayOnramperModal(false)
                }}
            />
            <div className={"flex pb-2 w-full"}>
                <div className={"flex flex-col w-full"}>
                    <div className={"flex flex-row"}>
                        <div className={"flex flex-row w-9/12 mr-4"}>
                            { (selectedToken && allocationItems.has(selectedItemKey) && allocationItems.get(selectedItemKey)?.userWalletAmount ) &&
                                <InputFieldWithSliderInputAndLogo
                                    selectedItemKey={selectedItemKey}
                                    modifyIndividualAllocationItem={modifyIndividualAllocationItem}
                                    allocationItems={allocationItems}
                                    currencyName={selectedToken.name}
                                    min={0}
                                    max={allocationItems.get(selectedItemKey)!.userWalletAmount!.amount.uiAmount! ? allocationItems.get(selectedItemKey)!.userWalletAmount!.amount.uiAmount! : 100}
                                    registry={registry}
                                />
                            }
                        </div>
                        <div className={"flex flex-row ml-auto my-auto mt-1"}>
                            <PurchaseButton passedAllocationData={allocationItems}/>
                        </div>
                    </div>
                    {/*<div className={"flex flex-row mx-1 mt-1"}>*/}
                    {/*    /!*{ (selectedToken && allocationItems.has(selectedItemKey) && allocationItems.get(selectedItemKey)?.userWalletAmount ) &&*!/*/}
                    {/*    /!*}*!/*/}
                    {/*</div>*/}
                </div>
            </div>
        </>
    );
}
