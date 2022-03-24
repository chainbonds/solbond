import React, {useState} from "react";
import PurchaseButton from "../buttons/PurchaseButton";
import OnramperModal from "../modals/OnramperModal"
import UserInfoBalance from "../displays/UserInfoBalance";
import InputFieldWithSliderInputAndLogo from "../inputs/InputFieldWithSliderInputAndLogo";
import {AllocData} from "../../types/AllocData";
import {getInputToken, SelectedToken} from "../../utils/utils";

interface Props {
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: number) => void
}
export default function StakeForm({allocationItems, selectedItemKey, modifyIndividualAllocationItem}: Props) {

    const [displayOnramperModal, setDisplayOnramperModal] = useState<boolean>(false);

    // TODO: Probably gotta make the Marinade case-distinction here already ...

    console.log("Allocation items are: ", allocationItems);

    if (!allocationItems) {
        return <></>
    }

    // TODO: Add the balance into the local state here ..
    const inputField = () => {

        if (!allocationItems.has(selectedItemKey) || !allocationItems.get(selectedItemKey)?.userWalletAmount) {
            return <></>
        }

        let asset = allocationItems.get(selectedItemKey)!;
        console.log("Asset is: ", asset);
        console.log("Pool is: ", asset.pool);
        let selectedAssetTokens = asset.pool!.tokens;
        let inputToken: SelectedToken = getInputToken(selectedAssetTokens);
        console.log("Input token in: ", inputToken);
        console.log("Asset that we're looking at is: ", asset);

        return (
            <>
                <InputFieldWithSliderInputAndLogo
                    selectedItemKey={selectedItemKey}
                    modifyIndividualAllocationItem={modifyIndividualAllocationItem}
                    allocationItems={allocationItems}
                    currencyName={inputToken.name}
                    min={0}
                    max={allocationItems.get(selectedItemKey)!.userWalletAmount!.amount.uiAmount! ? allocationItems.get(selectedItemKey)!.userWalletAmount!.amount.uiAmount! : 100}
                />
            </>
        );
    }

    const userCurrencyField = () => {

        if (!allocationItems.has(selectedItemKey) || !allocationItems.get(selectedItemKey)?.userWalletAmount) {
            return <></>
        }

        let asset = allocationItems.get(selectedItemKey)!;
        console.log("Asset is: ", asset);
        console.log("Pool is: ", asset.pool);
        let selectedAssetTokens = asset.pool!.tokens;
        let inputToken: SelectedToken = getInputToken(selectedAssetTokens);
        console.log("Input token in: ", inputToken);
        console.log("Asset that we're looking at is: ", asset);

        if (allocationItems.has(selectedItemKey) && allocationItems.get(selectedItemKey)?.userWalletAmount) {
            return <></>
        }

        return (
            <UserInfoBalance
                currencyMint={inputToken.mint}
                currencyName={inputToken.name}
                balance={allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.uiAmount || null}
                solBalance={allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.uiAmount || null}  // TODO: Did we pass in the SOL balance anyways ... (?)
            />
        );
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
                            {inputField()}
                        </div>
                        <div className={"flex flex-row ml-auto my-auto mt-1"}>
                            <PurchaseButton
                                allocationData={allocationItems}
                            />
                        </div>
                    </div>
                    <div className={"flex flex-row mx-1 mt-1"}>
                        {/* TODO: Pass in the SOL balance separately ... and acculuate this in a separate variable, perhaps (or another AllocData, with a special mint) */}
                        {userCurrencyField()}
                    </div>
                </div>
            </div>
        </>
    );
}
