import React, {FC, useState} from "react";
import {LogoWithTitle} from "./common/LogoWithTitle";
import {FaucetButton} from "./createPortfolio/buttons/FaucetButton";
import {DevnetButton} from "./createPortfolio/buttons/DevnetButton";
import SelectWallet from "./createPortfolio/buttons/SelectWallet";
import {BuyMoreButton} from "./createPortfolio/buttons/BuyMoreButton";
import BuyMoreAssetsModal from "./common/BuyMoreAssetsModal";

export const Header: FC = ({}) => {

    const [showFaucetModal, setShowFaucetModal] = useState<boolean>(false);

    return (
        <>
            <BuyMoreAssetsModal
                showModal={showFaucetModal}
                setShowModal={setShowFaucetModal}
                onClose={() => {setShowFaucetModal(false)}}
            />
            <div
                id={"header-buy-bonds"}
                className="w-full left-0 top-0 py-6 px-6 lg:px-20 lg:py-12"
            >
                <div className="flex flex-col md:flex-row justify-center md:justify-between">
                    <div className={"mx-auto px-auto md:mx-0 md:px-0 md:my-auto md:py-auto"}>
                        <LogoWithTitle/>
                    </div>
                    <div className={"flex-1 px-2 mx-2"}>
                    </div>
                    {/*TODO Implement Devnet show (and also faucet maybe)*/}
                    {/*  On mainnet, instead of Faucet, perhaps include a button "buy crypto" ... */}
                    <div className={"flex my-auto py-auto mx-auto md:mx-0"}>
                        <div className={"flex flex-col md:flex-row"}>
                            <div className={"px-2 py-2 mx-auto md:py-0 md:py-auto md:my-auto"}>
                                <BuyMoreButton  show setShow={setShowFaucetModal}/>
                                {/*<FaucetButton/>*/}
                            </div>
                            <div className={"px-2 py-2 mx-auto md:py-0 md:py-auto md:my-auto text-center justify-center"}>
                                <div className={"mr-2"}>
                                    <DevnetButton />
                                </div>
                            </div>
                            <SelectWallet />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}
