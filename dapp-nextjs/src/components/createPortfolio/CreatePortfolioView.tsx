import React, {useEffect, useState} from "react";
import OnramperModal from "../onramper/OnramperModal"
import UserInfoBalance from "../common/UserInfoBalance";
import {AllocData} from "../../types/AllocData";
import {getInputToken, SelectedToken} from "../../utils/utils";
import InputFieldWithSliderInputAndLogo from "../common/InputFieldWithSliderInputAndLogo";
import PurchaseButton from "../createPortfolio/buttons/PurchaseButton";

interface Props {
    allocationItems: Map<string, AllocData>,
    selectedItemKey: string,
    modifyIndividualAllocationItem: (arg0: string, arg1: number) => void
}
export default function CreatePortfolioView({allocationItems, selectedItemKey, modifyIndividualAllocationItem}: Props) {

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
                                />
                            }
                        </div>
                        <div className={"flex flex-row ml-auto my-auto mt-1"}>
                            <PurchaseButton allocationData={allocationItems}/>
                        </div>
                    </div>
                    <div className={"flex flex-row mx-1 mt-1"}>
                        { (selectedToken && allocationItems.has(selectedItemKey) && allocationItems.get(selectedItemKey)?.userWalletAmount ) &&
                            <UserInfoBalance
                                currencyName={selectedToken.name}
                                currencyBalance={allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.uiAmount || null}
                            />
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
