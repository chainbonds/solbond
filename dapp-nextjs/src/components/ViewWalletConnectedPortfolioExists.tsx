import DisplayPieChart from "./common/DisplayPieChart";
import React, {useEffect, useState} from "react";
import ExistingPortfolioTable from "./redeemPortfolio/ExistingPortfolioTable";
import RedeemPortfolioView from "./redeemPortfolio/RedeemPortfolioView";
import {AllocData} from "../types/AllocData";
import {IExistingPortfolio, useExistingPortfolio} from "../contexts/ExistingPortfolioProvider";
import {PositionInfo, Protocol} from "@qpools/sdk";

interface Props {

}
export const ViewWalletConnectedPortfolioExists = ({}) => {

    const existingPortfolioProvider: IExistingPortfolio = useExistingPortfolio();
    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map());

    const setExistingPortfolioAsAllocationData = async () => {
        // Go through all positionInfos, and create a new Map accordingy ...
        let newAllocationData: Map<string, AllocData> = new Map<string, AllocData>();
        await Promise.all(existingPortfolioProvider.positionInfos.map(async (position: PositionInfo ) => {
            // Pool is prob not reqired, if we only want to display these ...
            // Also, perhaps also reduce PositionInfo to AllocData, otherwise it's confusing in terms of types ...
            let tmp: AllocData = {
                apy_24h: 0.,
                lp: position.mintLp.toString(),
                protocol: position.protocol,
                userInputAmount: undefined,
                userWalletAmount: undefined,
                weight: position.totalPositionValue
            };
            let key: string = Protocol[position.protocol] + " " + position.mintLp.toString();
            newAllocationData.set(key, tmp);
        }));
        setAllocationData((oldAllocationData: Map<string, AllocData>) => {
            return newAllocationData;
        });
    }

    useEffect(() => {
        if (existingPortfolioProvider.positionInfos.length > 0) {
            // Overwrite the allocatoin according to position Infos ...
            setExistingPortfolioAsAllocationData();
        }
    }, [existingPortfolioProvider.positionInfos]);

    // Will there be any sort of selected assets
    // console.log("Allocation Data is: ", allocationData, selectedAsset);

    return (
        <>
            <div className={"flex flex-row w-full"}>
                <h1 className={"text-3xl font-light"}>
                    Your Portfolio
                </h1>
            </div>
            <div className={"flex flex-row mt-2"}>
                <h2 className={"text-2xl font-light"}>
                    See the assets for your current portfolio
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
                    <ExistingPortfolioTable/>
                </div>
            </div>
            <div className={"flex flex-row my-auto mt-7"}>
                <RedeemPortfolioView/>
            </div>
        </>
    )

}