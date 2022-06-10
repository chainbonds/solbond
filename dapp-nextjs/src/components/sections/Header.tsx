import React, {FC, useState} from "react";
import {LogoWithTitle} from "../common/basic/LogoWithTitle";
import BuyMoreAssetsOptionalModal from "../common/modal/BuyMoreAssetsOptionalModal";
import SelectWallet from "../common/buttons/SelectWallet";
import {FaucetButton} from "../createPortfolio/buttons/FaucetButton";

function BuyMoreButton(props: { show: boolean, setShow: (value: (((prevState: boolean) => boolean) | boolean)) => void }) {
    return null;
}

function DevnetButton() {
    return null;
}

interface Props {
    showFaucet: boolean,
    showConnectWallet: boolean
};
export const Header = ({showFaucet, showConnectWallet}: Props) => {

    const [showFaucetModal, setShowFaucetModal] = useState<boolean>(false);

    return (
        <>
            <BuyMoreAssetsOptionalModal
                showModal={showFaucetModal}
                setShowModal={setShowFaucetModal}
                onClose={() => {setShowFaucetModal(false)}}
            />
            <div
                id={"header-buy-bonds"}
                className="w-full left-0 top-0 py-6 px-6 lg:px-20 lg:py-12"
            >
                <div className="flex flex-col md:flex-row justify-center md:justify-between">
                    {/*TODO Implement Devnet show (and also faucet maybe)*/}
                    {/*  On mainnet, instead of Faucet, perhaps include a button "buy crypto" ... */}
                    <div className={"md:mx-0 my-auto"}>
                        <LogoWithTitle/>
                    </div>
                    <div className={"flex my-auto py-auto mx-auto md:mx-0"}>
                        <div className={"flex flex-col md:flex-row"}>
                            {showFaucet &&
                                <div className={"py-2 mx-auto md:mx-2 md:py-0 md:py-auto md:my-auto"}>
                                    {/*<BuyMoreButton show setShow={setShowFaucetModal}/>*/}
                                    <FaucetButton activated={true}/>
                                </div>
                            }
                            {/*<div className={"px-2 py-2 mx-auto md:py-0 md:py-auto md:my-auto text-center justify-center"}>*/}
                            {/*    <div className={"mr-2"}>*/}
                            {/*        <DevnetButton />*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            {showConnectWallet &&
                                <div className={"mt-2"}>
                                    <SelectWallet walletContext={null}/>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}
