import React, {useState} from "react";
import PurchaseButton from "../buttons/PurchaseButton";
import OnramperModal from "../modals/OnramperModal"
import UserInfoBalance from "../displays/UserInfoBalance";
import InputFieldWithSliderInputAndLogo from "../inputs/InputFieldWithSliderInputAndLogo";
import {PublicKey} from "@solana/web3.js";
import {AllocData} from "../../types/AllocData";

interface Props {
    currencyMint: PublicKey,
    currencyName: string,
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: number) => void
}
export default function StakeForm({currencyMint, currencyName, allocationItems, selectedItemKey, modifyIndividualAllocationItem}: Props) {

    const [displayOnramperModal, setDisplayOnramperModal] = useState<boolean>(false);

    // TODO: Probably gotta make the Marinade case-distinction here already ...

    console.log("Allocation items are: ", allocationItems);

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
                            <InputFieldWithSliderInputAndLogo
                                selectedItemKey={selectedItemKey}
                                modifyIndividualAllocationItem={modifyIndividualAllocationItem}
                                allocationItems={allocationItems}
                                currencyName={currencyName}
                                min={0}
                                // TODO: Gotta have a separate one just for the amount that the user has in his wallet (?)
                                max={allocationItems.get(selectedItemKey)!.userInputAmount!.amount.uiAmount ? allocationItems.get(selectedItemKey)!.userInputAmount!.amount.uiAmount : 100}
                            />
                        </div>
                        <div className={"flex flex-row ml-auto my-auto"}>
                            <PurchaseButton />
                        </div>
                    </div>
                    <div className={"flex flex-row mx-1 mt-1"}>
                        <UserInfoBalance
                            currencyMint={currencyMint}
                            currencyName={currencyName}
                            balance={allocationItems.get(selectedItemKey)?.userInputAmount?.amount.uiAmount || null}
                            solBalance={allocationItems.get(selectedItemKey)?.userInputAmount?.amount.uiAmount || null}  // TODO: Did we pass in the SOL balance anyways ... (?)
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
