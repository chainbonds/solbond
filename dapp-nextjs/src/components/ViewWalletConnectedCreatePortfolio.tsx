import DisplayPieChart from "./common/DisplayPieChart";
import React, {useEffect, useState} from "react";
import SuggestedPortfolioTable from "./createPortfolio/SuggestedPortfolioTable";
import CreatePortfolioView from "./createPortfolio/CreatePortfolioView";
import {AllocData, keyFromAllocData} from "../types/AllocData";
import {IUserWalletAssets, useUserWalletAssets} from "../contexts/UserWalletAssets";
import BuyMoreAssetsModal from "./common/BuyMoreAssetsModal";
import {BN} from "@project-serum/anchor";
import { Registry } from "@qpools/sdk";

interface Props {
    registry: Registry
}
export const ViewWalletConnectedCreatePortfolio = ({registry}: Props) => {

    const userWalletAssetsProvider: IUserWalletAssets = useUserWalletAssets();
    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map<string, AllocData>());
    const [selectedAsset, setSelectedAsset] = useState<string>("");
    const [showFaucetModal, setShowFaucetModal] = useState<boolean>(false);

    // If the user wallets assets were loaded, but the user has no assets, then show him this modal
    useEffect(() => {
        if (allocationData && allocationData.size > 0 && (selectedAsset === null)) {
            let firstItem = Array.from(allocationData.keys());
            setSelectedAsset(firstItem[0]);

            // Also, if the user is broke, allow him to buy some assets (this could later on be changed by an on-ramped
            // TODO: This must be lamports always !!!
            let existingAmounts = new BN(0);
            Array.from(allocationData.entries()).map(([key, value]) => {
                if (value.userWalletAmount && value.userWalletAmount!.amount.amount) {
                    existingAmounts.add( new BN(value.userWalletAmount!.amount.amount));
                }
            });
            if (existingAmounts.lten(0)) {
                setShowFaucetModal(true);
            } else {
                setShowFaucetModal(false);
            }
        }
    }, [allocationData]);

    /**
     * Set the Portfolio to resemble the user's Wallet
     */
    useEffect(() => {
        console.log("Assets are changing (1) ...", userWalletAssetsProvider.walletAssets);
        if (
            userWalletAssetsProvider.walletAssets &&
            userWalletAssetsProvider.walletAssets.size > 0
            // && allocationData.size < 1
        ) {
            setAllocationData((_: Map<string, AllocData>) => {
                console.log("The new allocation (wallet) data is: ", userWalletAssetsProvider.walletAssets);
                let out: Map<string, AllocData> = new Map<string, AllocData>();
                // Take the wallet assets at spin-up,
                // After that, take the user input assets ...
                Array.from(userWalletAssetsProvider.walletAssets!.values()).map((x: AllocData) => {
                    let key: string = keyFromAllocData(x);
                    out.set(key, x);
                });
                console.log("Updated Map (1) is: ", out);
                return out;
            });
        } else {
            console.log("Fuck it ain't got no assets", userWalletAssetsProvider.walletAssets);
        }
        console.log("Assets are changing ...", userWalletAssetsProvider.walletAssets);
    }, [userWalletAssetsProvider.walletAssets]);

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
                <BuyMoreAssetsModal
                    showModal={showFaucetModal}
                    setShowModal={setShowFaucetModal}
                    onClose={() => {}}
                />
                <CreatePortfolioView
                    allocationItems={allocationData}
                    selectedItemKey={selectedAsset}
                    setAllocationItems={setAllocationData}
                    registry={registry}
                />
            </div>
        </div>
    )

}