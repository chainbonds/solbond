import DisplayPieChart from "./common/DisplayPieChart";
import React, {useEffect, useState} from "react";
import SuggestedPortfolioTable from "./createPortfolio/SuggestedPortfolioTable";
import CreatePortfolioView from "./createPortfolio/CreatePortfolioView";
import {AllocData} from "../types/AllocData";
import {BN} from "@project-serum/anchor";
import {UserTokenBalance} from "../types/UserTokenBalance";
import {IUserWalletAssets, useUserWalletAssets} from "../contexts/UserWalletAssets";
import {Protocol} from "@qpools/sdk";

export const ViewWalletConnectedCreatePortfolio = ({}) => {

    const userWalletAssetsProvider: IUserWalletAssets = useUserWalletAssets();
    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map());
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
        // TODO: If the user has no assets (!), then ask him if he wants to buy some crypto
        // Yet another option would be to load the assets from the portfolio position ...
        if (
            userWalletAssetsProvider.walletAssets &&
            userWalletAssetsProvider.walletAssets.length > 0
        ) {
            setAllocationData((_: Map<string, AllocData>) => {
                console.log("The new allocation (wallet) data is: ", userWalletAssetsProvider.walletAssets);
                let out: Map<string, AllocData> = new Map<string, AllocData>();
                userWalletAssetsProvider.walletAssets!.map((x: AllocData) => {
                    let key: string = Protocol[x.protocol] + " " + x.lp;
                    out.set(key, x);
                });
                return out;
            });
        }
    }, [userWalletAssetsProvider.walletAssets]);

    /**
     * This function is pretty huge, for doing this so dynamically ....
     * Perhaps I should find a way to do this more efficiently ... not entirely sure how though
     * Also I think from a react-perspective this is the right approach, because the key of the object needs to change
     *
     * @param currentlySelectedAsset
     * @param absoluteBalance
     */
    const modifyIndividualAllocationItem = (currentlySelectedKey: string, absoluteBalance: number) => {

        // TODO: This shit will break for sure ..
        if (currentlySelectedKey === "") {
            return;
        }
        if (!allocationData.has(currentlySelectedKey)) {
            throw Error("The key you're trying to modify does not exist for some reason! " + currentlySelectedKey);
        }
        let currentlySelectedAsset: AllocData = {...allocationData.get(currentlySelectedKey)!};

        // TODO: Gotta find a way to deal with the absolute balance ...
        let numberInclDecimals = (new BN(absoluteBalance * (10 ** currentlySelectedAsset.userInputAmount!.amount.decimals)));
        let uiAmount = (numberInclDecimals.toNumber() / (10 ** currentlySelectedAsset.userInputAmount!.amount.decimals));

        let userInputAmount: UserTokenBalance = {
            mint: currentlySelectedAsset.userInputAmount!.mint,
            ata: currentlySelectedAsset.userInputAmount!.ata,
            amount: {
                amount: numberInclDecimals.toString(),
                decimals: currentlySelectedAsset.userInputAmount!.amount.decimals,
                uiAmount: uiAmount,
                uiAmountString: String(uiAmount)
            }
        };
        let newAsset: AllocData = {
            apy_24h: currentlySelectedAsset.apy_24h,
            lp: currentlySelectedAsset.lp,
            pool: currentlySelectedAsset.pool,
            protocol: currentlySelectedAsset.protocol,
            userInputAmount: userInputAmount,
            userWalletAmount: currentlySelectedAsset.userWalletAmount,
            weight: currentlySelectedAsset.weight
        };

        // Now set the stuff ...
        setAllocationData((oldAllocationData: Map<string, AllocData>) => {
            // Return the full array, replace the one element that was replaced ...
            // Modify the key as well (?)
            // Also add another key prop (one id for us, one key for react maybe?) to force re-rendering ...
            let updatedMap = new Map<string, AllocData>(oldAllocationData);
            updatedMap.set(selectedAsset, newAsset)
            return updatedMap;
        });

    }

    console.log("Allocation Data is: ", allocationData, selectedAsset);

    return (
        <>
            <div className={"flex flex-row w-full"}>
                <h1 className={"text-3xl font-light"}>
                    Please Select Your Portfolio
                </h1>
            </div>
            <div className={"flex flex-row mt-2"}>
                <h2 className={"text-2xl font-light"}>
                    This will be the allocation in which your assets generate yields
                </h2>
            </div>
            <div className={"flex flex-row mt-8"}>
                <div className={"flex my-auto mx-auto p-8"}>
                    <DisplayPieChart
                        showPercentage={false}
                        allocationInformation={allocationData}
                    />
                </div>
                <div className="flex flex-col text-gray-300 my-auto divide-y divide-white">
                    <SuggestedPortfolioTable
                        tableColumns={[null, "Pay-In Asset", "Product", "Underlying Asset", "Allocation", "24H APY", "Absolute Amount"]}
                        selectedAssets={allocationData}
                        selectedAsset={selectedAsset}
                        setSelectedAsset={setSelectedAsset}
                        // modifyAllocationData={modifyIndividualAllocationItem}
                    />
                </div>
            </div>
            <div className={"flex flex-row my-auto mt-7"}>
                <CreatePortfolioView
                    allocationItems={allocationData}
                    selectedItemKey={selectedAsset}
                    modifyIndividualAllocationItem={modifyIndividualAllocationItem}
                />
            </div>
        </>
    )

}