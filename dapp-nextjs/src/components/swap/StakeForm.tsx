import React, {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import PurchaseButton from "../buttons/PurchaseButton";
import OnramperModal from "../modals/OnramperModal"
import ConnectWalletButton from "../buttons/ConnectWalletButton";
import UserInfoBalance from "../displays/UserInfoBalance";
import InputFieldWithSliderInputAndLogo from "../inputs/InputFieldWithSliderInputAndLogo";

export default function StakeForm() {

    const qPoolContext: IQPool = useQPoolUserTool();

    const [valueInUsdc, setValueInUsdc] = useState<number>(0.);

    const [depositAmountUsdc, setDepositAmountUsdc] = useState<number>(0.);
    const [depositAmountSol, setDepositAmountSol] = useState<number>(0.);
    const [displayOnramperModal, setDisplayOnramperModal] = useState<boolean>(false);
    const [percentage, setPercentage] = useState<number>(0.);

    useEffect(()=>{
        if(qPoolContext.connection && qPoolContext.userAccount && qPoolContext.userAccount!.publicKey){
            setDepositAmountSol(qPoolContext.walletAmountSol * percentage)
            setDepositAmountUsdc(qPoolContext.walletAmountUsdc * percentage)
        }
    },[percentage])

    const getActionButton = () => {
        if (qPoolContext.userAccount) {
            return (
                <PurchaseButton
                    valueInUsdc={depositAmountUsdc}
                    amountSol = {depositAmountSol}
                />
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
                {/*<div className={"flex flex-row space-x-6"}>*/}
                {/*    <div className={"flex flex-row ml-52 my-auto"}>*/}
                {/*        <InputSlider*/}
                {/*            setPercentage = {setPercentage}*/}
                {/*        />*/}
                {/*        {getActionButton()}*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className={"flex flex-col w-full"}>
                    <div className={"flex flex-row"}>
                        <div className={"flex flex-row w-9/12 mr-4"}>
                            <InputFieldWithSliderInputAndLogo
                                // className={""}
                                // logoPath={"/usdc-logo.png"}
                                // allAssets={qPoolContext.portfolioRatios}
                                displayText={"USDC"}
                                setNewValue={setValueInUsdc}  // TODO: Gotta write a new function for this specifically ...
                                // modifiable={true}
                            />
                        </div>
                        <div className={"flex flex-row ml-auto my-auto"}>
                            {getActionButton()}
                        </div>
                    </div>
                    <div className={"flex flex-row mx-1 mt-1"}>
                        <UserInfoBalance/>
                    </div>
                </div>
            </div>
        </>
    );
}
