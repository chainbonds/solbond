import React, {useEffect, useState} from "react";
import {AllocData} from "../types/AllocData";
import DisplayPieChart from "./common/DisplayPieChart";
import SuggestedPortfolioTable from "./createPortfolio/SuggestedPortfolioTable";
import SelectWallet from "./createPortfolio/buttons/SelectWallet";
import {ISerpius, useSerpiusEndpoint} from "../contexts/SerpiusProvider";

interface Props {}
export const ViewWalletNotConnected = ({}: Props) => {

    const serpiusProvider: ISerpius = useSerpiusEndpoint();
    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map());
    // Selected assets should be set to null here ...

    useEffect(() => {
        // Yet another option would be to load the assets from the portfolio position ...
        setAllocationData((_: Map<string, AllocData>) => {
            console.log("The new allocation (serpius) data is: ", serpiusProvider.portfolioRatios!);
            let out: Map<string, AllocData> = new Map<string, AllocData>();
            Array.from(serpiusProvider.portfolioRatios!.values()).map((x: AllocData) => {
                let key: string = x.lp; //  Protocol[x.protocol] + " " +
                out.set(key, x);
            });
            return out;
        });
    }, [serpiusProvider.portfolioRatios]);

    console.log("Allocation Data is: ", allocationData, null);

    // Cannot talk much about yields, risks etc. _yet_
    return (
        <>
            <div className={"flex flex-row w-full"}>
                <h1 className={"text-4xl font-light"}>
                    Want to earn some passive income?
                </h1>
            </div>
            <div className={"flex flex-row mt-5"}>
                <h2 className={"text-2xl font-light"}>
                    Please Connect your Wallet First!
                </h2>
            </div>
            <div className={"flex flex-row mt-8"}>
                <div className={"flex my-auto mx-auto p-8"}>
                    <DisplayPieChart
                        showPercentage={false}
                        allocationInformation={allocationData}
                        displayInput={false}
                    />
                </div>
                <div className="flex flex-col text-gray-300 my-auto divide-y divide-white">
                    <SuggestedPortfolioTable
                        tableColumns={[null, "Pay-In Asset", "Product", "Underlying Asset", "Allocation", "24H APY"]}
                        selectedAssets={allocationData}
                        selectedAsset={null}
                        setSelectedAsset={null}
                        assetChooseable={false}
                    />
                </div>
            </div>
            <div className={"flex flex-row my-auto mt-7"}>
                <SelectWallet/>
            </div>
        </>
    )

}