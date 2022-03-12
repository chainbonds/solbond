import React, {FC} from "react";
import {FaBroom} from "react-icons/fa";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {useLoad} from "../../contexts/LoadingContext";
import {PortfolioAccount} from "@qpools/sdk";

export const RunCrankButton: FC = ({}) => {

    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();

    // Onclick, alert that the user must connect his wallet first!
    const airdropCurrency = async () => {
        console.log("Requesting airdrop...");

        if (!qPoolContext.userAccount || !qPoolContext.userAccount!.publicKey || !qPoolContext.crankRpcTool ) {
            alert("Please connect your wallet first!");
            return
        }
        await loadContext.increaseCounter();
        let portfolio: PortfolioAccount = await qPoolContext.portfolioObject!.fetchPortfolio();
        for (let index = 0; index < portfolio.numPositions; index++) {
            await qPoolContext.crankRpcTool!.permissionlessFulfillSaber(index);
        }
        await loadContext.decreaseCounter();
    };

    return (
        <>
            <button
                style={{ backgroundColor: "#1a202c" }}
                className="border border-gray-500 text-white font-bold py-3 px-7 rounded "
                onClick={() => airdropCurrency()}
            >
                <div className={"flex flex-row"}>
                    <div className={"py-auto my-auto pr-3"}>
                        {/* Could also be FaCarrot, FaCandyCane, FaFaucet, FaGavel, FaDraftingCompass */}
                        <FaBroom />
                    </div>
                    RUN CRANK
                </div>
            </button>
        </>
    );
};
