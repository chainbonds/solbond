import React, {FC} from "react";
import {FaBroom} from "react-icons/fa";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {useLoad} from "../../contexts/LoadingContext";

/**
 * TODO: Perhaps you should have a button somewhere near the input field
 * "experiencing interruptions with displaying your position... run crank"
 * @constructor
 */
export const RunFulfillCrankButton: FC = ({}) => {

    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();

    // Onclick, alert that the user must connect his wallet first!
    const airdropCurrency = async () => {
        console.log("Requesting airdrop...");

        if (!qPoolContext.userAccount || !qPoolContext.userAccount!.publicKey || !qPoolContext.crankRpcTool || !qPoolContext.crankRpcTool.solbondProgram ) {
            alert("Please connect your wallet first!");
            return
        }
        // Also make sure that the portfolio was loaded ...
        if (!qPoolContext.portfolioRatios) {
            alert("Please try again in a couple of seconds (We should really fix this error message)");
            return
        }
        if (!qPoolContext.portfolioRatios[0].pool) {
            alert("Please try again in a couple of seconds (We should really fix this error message) 2");
            return
        }

        await loadContext.increaseCounter();
        await qPoolContext.crankRpcTool!.fullfillAllPermissionless();
        await qPoolContext.makePriceReload();
        await loadContext.decreaseCounter();
    };

    return (
        <>
            <button
                // style={{ backgroundColor: "#1a202c" }}
                className="border border-gray-500 text-white font-bold py-3 px-7 rounded "
                onClick={() => airdropCurrency()}
            >
                <div className={"flex flex-row"}>
                    <div className={"py-auto my-auto pr-3"}>
                        {/* Could also be FaCarrot, FaCandyCane, FaFaucet, FaGavel, FaDraftingCompass */}
                        <FaBroom />
                    </div>
                    RUN FULLFILL CRANK
                </div>
            </button>
        </>
    );
};
