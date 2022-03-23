import React, {useState} from "react";
import PurchaseButton from "../buttons/PurchaseButton";
import OnramperModal from "../modals/OnramperModal"
import ConnectWalletButton from "../buttons/ConnectWalletButton";
import UserInfoBalance from "../displays/UserInfoBalance";
import InputFieldWithSliderInputAndLogo from "../inputs/InputFieldWithSliderInputAndLogo";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {PublicKey} from "@solana/web3.js";
import {AllocData} from "../../types/AllocData";

interface Props {
    currencyMint: PublicKey,
    currencyName: string,
    allocationItem: AllocData
}
export default function StakeForm({currencyMint, currencyName, allocationItem}: Props) {

    const rpcProvider: IRpcProvider = useRpc();

    const [displayOnramperModal, setDisplayOnramperModal] = useState<boolean>(false);
    const [valueInUsdc, setValueInUsdc] = useState<number>(0.);

    // TODO: Pass on the assets to be purchased (and their ratio's) as a child to the actionButton
    const getActionButton = () => {
        if (rpcProvider.userAccount) {
            return (
                <PurchaseButton/>
            )
        } else {
            return (
                <ConnectWalletButton/>
            );
        }
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
                                // className={""}
                                // logoPath={"/usdc-logo.png"}
                                // allAssets={qPoolContext.portfolioRatios}
                                displayText={currencyName}
                                setNewValue={setValueInUsdc}  // TODO: Gotta write a new function for this specifically ...
                                // modifiable={true}
                            />
                        </div>
                        <div className={"flex flex-row ml-auto my-auto"}>
                            {getActionButton()}
                        </div>
                    </div>
                    <div className={"flex flex-row mx-1 mt-1"}>
                        <UserInfoBalance
                            currencyMint={currencyMint}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
