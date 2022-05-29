import React, {useEffect, useState} from "react";
import {AllocData, keyFromAllocData} from "../types/AllocData";
import SuggestedPortfolioTable from "./createPortfolio/SuggestedPortfolioTable";
import {ISerpius, useSerpiusEndpoint} from "../contexts/SerpiusProvider";
import { Registry } from "@qpools/sdk";
import DisplayPieChart from "./common/visualization/DisplayPieChart";

interface Props {
    registry: Registry
}
export const ViewWalletNotConnected = ({registry}: Props) => {

    const serpiusProvider: ISerpius = useSerpiusEndpoint();
    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map());
    // Selected assets should be set to null here ...

    useEffect(() => {
        // Yet another option would be to load the assets from the portfolio position ...
        setAllocationData((_: Map<string, AllocData>) => {
            console.log("The new allocation (serpius) data is: ", serpiusProvider.portfolioRatios!);
            let out: Map<string, AllocData> = new Map<string, AllocData>();
            Array.from(serpiusProvider.portfolioRatios!.values()).map((x: AllocData) => {
                let key: string = keyFromAllocData(x);
                out.set(key, x);
            });
            return out;
        });
    }, [serpiusProvider.portfolioRatios]);

    console.log("Allocation Data is: ", allocationData, null);

    // Cannot talk much about yields, risks etc. _yet_
    return (
        <div className={"text-center lg:text-left"}>
            <h1 className={"text-4xl font-light"}>
                Create your decentralized Portfolio
            </h1>
            <h2 className={"mt-5 text-2xl font-light"}>
                Please Connect your Wallet First!
            </h2>
            <div className={"flex flex-col lg:flex-row mt-8"}>
                <div className={"my-auto mx-auto p-8"}>
                    <DisplayPieChart
                        showPercentage={false}
                        allocationInformation={allocationData}
                    />
                </div>
                <div className="my-auto overflow-x-scroll">
                    <SuggestedPortfolioTable
                        registry={registry}
                        tableColumns={[null, "Currency", "Product", "Exposure", "Allocation", "24H APY"]}
                        selectedAssets={allocationData}
                        selectedAsset={null}
                        setSelectedAsset={null}
                        assetChooseable={false}
                    />
                </div>
            </div>
            <div className={"flex flex-row my-auto mt-7"}>
                {/*<SelectWallet/>*/}
            </div>
        </div>
    )

}