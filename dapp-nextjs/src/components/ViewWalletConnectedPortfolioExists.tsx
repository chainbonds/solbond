import DisplayPieChart from "./common/DisplayPieChart";
import React, {useEffect, useState} from "react";
import RedeemPortfolioView from "./redeemPortfolio/RedeemPortfolioView";
import {AllocData, keyFromAllocData} from "../types/AllocData";
import {IExistingPortfolio, useExistingPortfolio} from "../contexts/ExistingPortfolioProvider";
import SuggestedPortfolioTable from "./createPortfolio/SuggestedPortfolioTable";
import Error from "next/error";
import { Registry } from "@qpools/sdk";

interface Props {
    registry: Registry
}
export const ViewWalletConnectedPortfolioExists = ({registry}: Props) => {

    const existingPortfolioProvider: IExistingPortfolio = useExistingPortfolio();
    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map());

    const setExistingPortfolioAsAllocationData = async () => {
        console.log("#setExistingPortfolioAsAllocationData()");

        // Go through all positionInfos, and create a new Map accordingy ...
        let newAllocationData: Map<string, AllocData> = new Map<string, AllocData>();
        await Promise.all(Array.from(existingPortfolioProvider.positionInfos.values()).map(async (position: AllocData ) => {
            // Assert here that position userInputAmount are not empty (?)
            if (!position.userInputAmount || !position.userWalletAmount) {
                // @ts-ignore
                throw Error("User Amounts were not successfully loaded " + JSON.stringify(position));
            }
            let tmp: AllocData = {
                pool: position.pool,
                weight: position.weight,
                apy_24h: 0.,
                lpIdentifier: position.lpIdentifier,
                protocol: position.protocol,
                userInputAmount: position.userInputAmount,
                userWalletAmount: position.userWalletAmount,
                usdcAmount: position.usdcAmount
            };
            let key: string = keyFromAllocData(position);
            newAllocationData.set(key, tmp);
        }));
        setAllocationData((oldAllocationData: Map<string, AllocData>) => {
            return newAllocationData;
        });
        console.log("##setExistingPortfolioAsAllocationData()");
    }

    useEffect(() => {
        if (existingPortfolioProvider.positionInfos.size > 0) {
            // Overwrite the allocatoin according to position Infos ...
            setExistingPortfolioAsAllocationData();
        }
    }, [existingPortfolioProvider.positionInfos]);

    // Will there be any sort of selected assets
    // console.log("Allocation Data is: ", allocationData, selectedAsset);

    return (
        <div className={"flex flex-col text-center lg:text-left"}>
            <h1 className={"text-4xl font-light"}>
                Your Portfolio
            </h1>
            <h2 className={"mt-5 text-2xl font-light"}>
                See the assets for your current portfolio
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
                        selectedAsset={""}
                        setSelectedAsset={() => {}}
                        assetChooseable={false}
                    />
                </div>
            </div>
            <div className={"my-auto mt-7"}>
                <RedeemPortfolioView/>
            </div>
        </div>
    )

}