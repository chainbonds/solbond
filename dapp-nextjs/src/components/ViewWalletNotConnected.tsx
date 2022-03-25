import React, {useEffect, useState} from "react";
import {AllocData} from "../types/AllocData";
import {Protocol} from "@qpools/sdk";
import {BRAND_COLORS} from "../const";
import LoadingItemsModal from "./common/LoadingItemsModal";
import DisplayPieChart from "./common/DisplayPieChart";
import SuggestedPortfolioTable from "./createPortfolio/SuggestedPortfolioTable";
import SelectWallet from "./createPortfolio/buttons/SelectWallet";
import {ISerpius, useSerpiusEndpoint} from "../contexts/SerpiusProvider";

interface Props {}
export const ViewWalletNotConnected = ({}: Props) => {

    const serpiusProvider: ISerpius = useSerpiusEndpoint();
    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map());
    // Selected assets should be set to null here ...

    // Maybe set loading until we are able to read the serpius API
    // TODO: Probably will have to move this up-level again ...
    useEffect(() => {
        // Yet another option would be to load the assets from the portfolio position ...
        setAllocationData((_: Map<string, AllocData>) => {
            console.log("The new allocation (serpius) data is: ", serpiusProvider.portfolioRatios!);
            // TODO: Replace the assets here (form a map from an Array)
            let out: Map<string, AllocData> = new Map<string, AllocData>();
            serpiusProvider.portfolioRatios!.map((x: AllocData) => {
                let key: string = Protocol[x.protocol] + " " + x.lp;
                out.set(key, x);
            });
            return out;
        });
    }, [serpiusProvider.portfolioRatios]);

    console.log("Allocation Data is: ", allocationData, null);

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
                        selectedAssets={allocationData}
                        selectedAsset={null}
                        setSelectedAsset={null}
                        // modifyAllocationData={modifyIndividualAllocationItem}
                    />
                </div>
            </div>
            <div className={"flex flex-row my-auto mt-7"}>
                <SelectWallet/>
            </div>
        </>
    )

}