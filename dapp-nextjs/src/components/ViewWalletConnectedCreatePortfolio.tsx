import DisplayPieChart from "./common/DisplayPieChart";
import React, {useEffect, useState} from "react";
import SuggestedPortfolioTable from "./createPortfolio/SuggestedPortfolioTable";
import CreatePortfolioView from "./createPortfolio/CreatePortfolioView";
import {AllocData} from "../types/AllocData";
import {BN} from "@project-serum/anchor";
import {UserTokenBalance} from "../types/UserTokenBalance";
import {IUserWalletAssets, useUserWalletAssets} from "../contexts/UserWalletAssets";
import {ExplicitPool, Protocol, Registry} from "@qpools/sdk";
import {TokenAmount} from "@solana/web3.js";
import {getTokenAmount} from "../utils/utils";
import {multiplyAmountByPythprice} from "@qpools/sdk";

interface Props {
    registry: Registry
}
export const ViewWalletConnectedCreatePortfolio = ({registry}: Props) => {

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
    const modifyIndividualAllocationItem = async (currentlySelectedKey: string, absoluteBalance: number): Promise<number | null> => {

        // TODO: This shit will break for sure ..
        if (currentlySelectedKey === "") {
            return null;
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

        /**
         * Honestly, for now just lock whatever the user puts in. Bind the user that he cannot input more than the maximum amount
         * (i.e. add this as a constraint ...)
         *
         * Also, when pulling the wallet information, put it all into the most popular wallet
         */
        // Return the full array, replace the one element that was replaced ...
        // Modify the key as well (?)
        // Also add another key prop (one id for us, one key for react maybe?) to force re-rendering ...
        let updatedMap = new Map<string, AllocData>(allocationData);
        updatedMap.set(selectedAsset, newAsset)
        // allocationsToBeModified.map((x: AllocData) => {
        //     updatedMap.set(x.lp, x);
        // })

        // Finally, make a check if this arrangement goes above what the user want to allocate ...
        // let allAllocationsWithThisToken = (await registry.getPoolsByInputToken(userInputAmount.mint.toString()))
        //     .filter((x: ExplicitPool) => {
        //         // Gotta create the id same as when loading the data. Create a function for this...
        //         let id = String(Protocol[x.protocol]) + " " + x.id;
        //         if (allocationData.has(id)) {
        //             return true
        //         } else {
        //             console.log("Name not found!", id, x, allocationData);
        //             return false
        //         }
        //     })
        //     .map((x: ExplicitPool) => {
        //         let id = String(Protocol[x.protocol]) + " " + x.id;
        //         let inputAmount = new BN(allocationData.get(id)!.userInputAmount!.amount.amount);
        //         return inputAmount;
        //     });
        // let totalInputtedAmount: BN = new BN(0);
        // allAllocationsWithThisToken.map((current: BN) => {
        //     totalInputtedAmount = totalInputtedAmount.add(current)
        // });
        // // Do not allow the user to prnumberInclDecimalsoceed, if this total amount is higher than the wallet's amount
        // let totalAvailableAmount: BN = new BN(currentlySelectedAsset.userWalletAmount!.amount.amount);
        // if (totalInputtedAmount.gt(totalAvailableAmount)) {
        //     // Maybe show a small error somewhere, or lock it ....
        //     console.log("Total amount is not ok! ", totalInputtedAmount.toString(), totalAvailableAmount.toString());
        //     return absoluteBalance;
        // } else {
        //     console.log("Total amount is still ok! ", totalInputtedAmount.toString(), totalAvailableAmount.toString());
        // }

        // Now set the stuff ...
        setAllocationData((oldAllocationData: Map<string, AllocData>) => {
            console.log("Updated Map is: ", updatedMap);
            return updatedMap;
        });

        // If all is successful, return the new, updated balance
        // return totalInputtedAmount.toNumber();

        // /**
        //  * Now implement the logic which (based on the amount that was there last time), re-distributes the portfolio to all other elements
        //  */
        // let oldNumberInclDecimals: BN = new BN(currentlySelectedAsset.userInputAmount!.amount.amount);
        // let percentageChange: number = absoluteDiff(oldNumberInclDecimals, numberInclDecimals).toNumber() / numberInclDecimals.toNumber();
        //
        // // TODO: Now subtract (in percentage), uniformly across all other assets
        // // Maybe transpose this operation, might be faster (but not needed right now  ...)
        // let allocationsToBeModified: AllocData[] = await Promise.all((await registry.getPoolsByInputToken(userInputAmount.mint.toString()))
        //     .filter((x: ExplicitPool) => {
        //         // Gotta create the id same as when loading the data. Create a function for this...
        //         if (allocationData.has(x.name)) {
        //             return true
        //         } else {
        //             console.log("Name not found!", x.name, allocationData);
        //             return false
        //         }
        //     })
        //     .map(async (x: ExplicitPool) => {
        //         // Create an alloc-data from this
        //         // Gotta have more uniform names ...
        //         // TODO: Unify how to create ids ... perhaps just use the mint of the lp token / certificate...
        //         let newAsset = {...allocationData.get(x.name)}
        //         // TODO: Calculate the numberInclDecimals, take the old one, and percentage-wise substract it from the new inputs ...
        //         // let percentageDifference: BN = ();
        //         let numberInclDecimals: BN = (new BN(absoluteBalance * (10 ** currentlySelectedAsset.userInputAmount!.amount.decimals)));
        //         let tokenAmount: TokenAmount = getTokenAmount(numberInclDecimals, currentlySelectedAsset.userInputAmount!.amount.decimals);
        //         newAsset.userInputAmount = {
        //             mint: newAsset.userInputAmount!.mint,
        //             ata: newAsset.userInputAmount!.ata,
        //             amount: tokenAmount
        //         };
        //         let usdcAmount = await multiplyAmountByPythprice(
        //             userInputAmount.amount.uiAmount!,
        //             userInputAmount.mint
        //         );
        //         newAsset.usdcAmount = usdcAmount;
        //         return newAsset;
        //     })
        // );

    }

    console.log("Allocation Data is: (111)", allocationData, selectedAsset);

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
                        registry={registry}
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