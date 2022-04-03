import DisplayPieChart from "./common/DisplayPieChart";
import React, {useEffect, useState} from "react";
import SuggestedPortfolioTable from "./createPortfolio/SuggestedPortfolioTable";
import CreatePortfolioView from "./createPortfolio/CreatePortfolioView";
import {AllocData} from "../types/AllocData";
import {BN} from "@project-serum/anchor";
import {UserTokenBalance} from "../types/UserTokenBalance";
import {IUserWalletAssets, useUserWalletAssets} from "../contexts/UserWalletAssets";
import {Protocol} from "@qpools/sdk";
import {TokenAmount} from "@solana/web3.js";
import {getTokenAmount} from "../utils/utils";
import {multiplyAmountByPythprice} from "@qpools/sdk";

export const ViewWalletConnectedCreatePortfolio = ({}) => {

    const userWalletAssetsProvider: IUserWalletAssets = useUserWalletAssets();
    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map<string, AllocData>());
    const [selectedAsset, setSelectedAsset] = useState<string>("");

    useEffect(() => {
        if (allocationData && allocationData.size > 0 && (selectedAsset === null)) {
            let firstItem = Array.from(allocationData.keys());
            setSelectedAsset(firstItem[0]);
        }
    }, [allocationData]);

    /**
     * Set the Portfolio to resemble the user's Wallet
     */
    useEffect(() => {
        if (
            userWalletAssetsProvider.walletAssets &&
            userWalletAssetsProvider.walletAssets.size > 0 &&
            allocationData.size < 1
        ) {
            setAllocationData((_: Map<string, AllocData>) => {
                console.log("The new allocation (wallet) data is: ", userWalletAssetsProvider.walletAssets);
                let out: Map<string, AllocData> = new Map<string, AllocData>();
                // Take the wallet assets at spin-up,
                // After that, take the user input assets ...
                Array.from(userWalletAssetsProvider.walletAssets!.values()).map((x: AllocData) => {
                    let key: string = Protocol[x.protocol] + " " + x.lp;
                    out.set(key, x);
                });
                console.log("Updated Map (1) is: ", out);
                return out;
            });
        }
    }, [userWalletAssetsProvider.walletAssets]);

    /**
     * This function is pretty huge, for doing this so dynamically ....
     * Perhaps I should find a way to do this more efficiently ... not entirely sure how though
     * Also I think from a react-perspective this is the right approach, because the key of the object needs to change
     *
     * @param currentlySelectedKey
     * @param absoluteBalance
     */
    const modifyIndividualAllocationItem = async (currentlySelectedKey: string, absoluteBalance: number) => {

        // TODO: This shit will break for sure ..
        if (currentlySelectedKey === "") {
            return;
        }
        if (!allocationData.has(currentlySelectedKey)) {
            throw Error("The key you're trying to modify does not exist for some reason! " + currentlySelectedKey);
        }
        let currentlySelectedAsset: AllocData = {...allocationData.get(currentlySelectedKey)!};
        console.log("Currently Selected is: ", currentlySelectedAsset);

        let numberInclDecimals: BN = (new BN(absoluteBalance * (10 ** currentlySelectedAsset.userInputAmount!.amount.decimals)));
        let tokenAmount: TokenAmount = getTokenAmount(numberInclDecimals, currentlySelectedAsset.userInputAmount!.amount.decimals);

        let userInputAmount: UserTokenBalance = {
            mint: currentlySelectedAsset.userInputAmount!.mint,
            ata: currentlySelectedAsset.userInputAmount!.ata,
            amount: tokenAmount
        };

        // re-calculate the usdc value according to the mint and input amount
        let usdcAmount = await multiplyAmountByPythprice(
            userInputAmount.amount.uiAmount!,
            userInputAmount.mint
        );

        let newAsset: AllocData = {
            weight: currentlySelectedAsset.weight,
            apy_24h: currentlySelectedAsset.apy_24h,
            lp: currentlySelectedAsset.lp,
            pool: currentlySelectedAsset.pool,
            protocol: currentlySelectedAsset.protocol,
            userInputAmount: userInputAmount,
            userWalletAmount: currentlySelectedAsset.userWalletAmount,
            usdcAmount: usdcAmount
        };

        // Now set the stuff ...
        setAllocationData((oldAllocationData: Map<string, AllocData>) => {
            // Return the full array, replace the one element that was replaced ...
            // Modify the key as well (?)
            // Also add another key prop (one id for us, one key for react maybe?) to force re-rendering ...
            let updatedMap = new Map<string, AllocData>(oldAllocationData);
            updatedMap.set(selectedAsset, newAsset)
            console.log("Updated Map is: ", updatedMap);
            return updatedMap;
        });

    }

    console.log("Allocation Data is: ", allocationData, selectedAsset);

    return (
        <div className={"flex flex-col text-center lg:text-left"}>
            <h1 className={"text-3xl font-light"}>
                Please Select Your Portfolio
            </h1>
            <h2 className={"text-2xl font-light"}>
                This will be the allocation in which your assets generate yields
            </h2>
            <div className={"flex flex-col lg:flex-row mt-8"}>
                <div className={"my-auto mx-auto p-8"}>
                    <DisplayPieChart
                        showPercentage={false}
                        allocationInformation={allocationData}
                    />
                </div>
                <div className="my-auto">
                    <SuggestedPortfolioTable
                        tableColumns={[null, "Currency", "Product", "Exposure", "Allocation", "24H APY", "Amount", "USDC Value"]}
                        selectedAssets={allocationData}
                        selectedAsset={selectedAsset}
                        setSelectedAsset={setSelectedAsset}
                        assetChooseable={true}
                    />
                </div>
            </div>
            <div className={"my-auto mt-7"}>
                <CreatePortfolioView
                    allocationItems={allocationData}
                    selectedItemKey={selectedAsset}
                    modifyIndividualAllocationItem={modifyIndividualAllocationItem}
                />
            </div>
        </div>
    )

}