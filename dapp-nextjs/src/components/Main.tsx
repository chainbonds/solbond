import React, {FC, useEffect, useState} from "react";
import LoadingItemsModal from "./modals/LoadingItemsModal";
import StakeForm from "./swap/StakeForm";
import UnstakeForm from "./swap/UnstakeForm";
import {BRAND_COLORS} from "../const";
import {IRpcProvider, useRpc} from "../contexts/RpcProvider";
import {AllocData} from "../types/AllocData";
import {ISerpius, useSerpiusEndpoint} from "../contexts/SerpiusProvider";
import {IUserWalletAssets, useUserWalletAssets} from "../contexts/UserWalletAssets";
import ExistingPortfolioTable from "./tables/ExistingPortfolioTable";
import SuggestedPortfolioTable from "./tables/SuggestedPortfolioTable";
import DisplayPieChart from "./charts/DisplayPieChart";
import {registry} from "@qpools/sdk";
import {PublicKey} from "@solana/web3.js";
import {useWallet, WalletContextState} from "@solana/wallet-adapter-react";
import SelectWalletForm from "./swap/SelectWalletForm";
import {BN} from "@project-serum/anchor";
import {UserTokenBalance} from "../types/UserTokenBalance";
import {getInputToken, SelectedToken} from "../utils/utils";

export enum HeroFormState {
    ShowSuggestedPortfolio,
    ShowExistingPortfolio
}
// To be specific, right now this is the only mode that is active
export enum PortfolioSuggestion {
    ShowWalletAsPortfolio
}
export const Main: FC = ({}) => {

    const walletContext: WalletContextState = useWallet();

    const [displayForm, setDisplayForm] = useState<HeroFormState>(HeroFormState.ShowSuggestedPortfolio);
    const rpcProvider: IRpcProvider = useRpc();
    const serpiusProvider: ISerpius = useSerpiusEndpoint();
    const userWalletAssetsProvider: IUserWalletAssets = useUserWalletAssets();

    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map());
    // Set a state for a selected item ..
    const [selectedAsset, setSelectedAsset] = useState<string>("");

    // Whenever the allocationData changes, set the selecte item back
    useEffect(() => {
        if (allocationData && allocationData.size > 0 && (selectedAsset === null)) {
            let firstItem = Array.from(allocationData.keys());
            setSelectedAsset(firstItem[0]);
        }
    }, [allocationData]);

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
            mint:  currentlySelectedAsset.userInputAmount!.mint,
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

    // Maybe set loading until we are able to read the serpius API
    useEffect(() => {
        // Yet another option would be to load the assets from the portfolio position ...
        if (
            userWalletAssetsProvider.walletAssets &&
            userWalletAssetsProvider.walletAssets.length > 0
        ) {
            setAllocationData((_: Map<string, AllocData>) => {
                console.log("The new allocation (wallet) data is: ", userWalletAssetsProvider.walletAssets);
                let out: Map<string, AllocData> = new Map<string, AllocData>();
                userWalletAssetsProvider.walletAssets!.map((x: AllocData) => {
                    let key: string = x.protocol + " " + x.lp;
                    out.set(key, x);
                });
                return out;
            });
        } else if (serpiusProvider.portfolioRatios) {
            setAllocationData((_: Map<string, AllocData>) => {
                console.log("The new allocation (serpius) data is: ", serpiusProvider.portfolioRatios);
                // TODO: Replace the assets here (form a map from an Array)
                let out: Map<string, AllocData> = new Map<string, AllocData>();
                serpiusProvider.portfolioRatios.map((x: AllocData) => {
                    let key: string = x.protocol + " " + x.lp;
                    out.set(key, x);
                });
                return out;
            });
        }
    }, [serpiusProvider.portfolioRatios, userWalletAssetsProvider.walletAssets]);

    const fetchAndDisplay = async () => {
        if (rpcProvider.portfolioObject) {
            let isFulfilled = await rpcProvider.portfolioObject.portfolioExists();
            if (isFulfilled) {
                setDisplayForm(HeroFormState.ShowExistingPortfolio);
            } else {
                setDisplayForm(HeroFormState.ShowSuggestedPortfolio);
            }
        }
    };

    useEffect(() => {
        // Check if the account exists, and if it was fulfilled
        fetchAndDisplay();
    }, [rpcProvider.portfolioObject, rpcProvider.makePriceReload]);

    // TODO: currencyName and Mint should be the intersection of token-whitelist + pool.tokens
    const formComponent = (selectKey: string) => {
        if (displayForm === HeroFormState.ShowSuggestedPortfolio) {
            if (walletContext.publicKey) {

                // let asset = allocationData.get(selectKey)!;
                // console.log("Asset is: ", asset);
                // console.log("Pool is: ", asset.pool);
                // let selectedAssetTokens = asset.pool!.tokens;
                // let inputToken: SelectedToken = getInputToken(selectedAssetTokens);
                // console.log("Input token in: ", inputToken);
                // console.log("Asset that we're looking at is: ", asset);

                // TODO: I guess the deposit button should be separate from the input forms ...

                return (<>
                        <StakeForm
                            // currencyMint={inputToken.mint}
                            // currencyName={inputToken.name}
                            allocationItems={allocationData}
                            selectedItemKey={selectedAsset}
                            modifyIndividualAllocationItem={modifyIndividualAllocationItem}
                        />
                    </>
                );
            } else if (walletContext.publicKey && allocationData.has(selectKey)) {
                console.log("Pool is empty!!");
                console.log(selectKey, allocationData);
            } else {
                console.log("No asset selected...!!");
                console.log(selectKey, allocationData);
                return (
                    <>
                        <SelectWalletForm />
                    </>
                )
            }
        } else if (displayForm === HeroFormState.ShowExistingPortfolio) {
            return (
                <UnstakeForm/>
            );
        }
    }

    const titleString = () => {
        if (displayForm === HeroFormState.ShowSuggestedPortfolio) {
            return "Please Select Your Portfolio";
        } else if (displayForm === HeroFormState.ShowExistingPortfolio) {
            return "Your Portfolio";
        }
    }

    const descriptionString = () => {
        if (displayForm === HeroFormState.ShowSuggestedPortfolio) {
            return "This will be the allocation in which your assets generate yields";
        } else if (displayForm === HeroFormState.ShowExistingPortfolio) {
            return "See the assets for your current portfolio";
        }
    }

    const portfolioChart = () => {
        if (displayForm === HeroFormState.ShowExistingPortfolio) {
            return (
                <>
                    <ExistingPortfolioTable
                    />
                </>
            )
        } else if (displayForm === HeroFormState.ShowSuggestedPortfolio) {
            return (
                <>
                    <SuggestedPortfolioTable
                        selectedAssets={allocationData}
                        selectedAsset={selectedAsset}
                        setSelectedAsset={setSelectedAsset}
                        // modifyAllocationData={modifyIndividualAllocationItem}
                    />
                </>
            )
        }
    }

    console.log("Allocation Data is: ", allocationData, selectedAsset);

    return (
        <div
            id="content"
            className={"flex flex-col grow my-auto"}
            style={{ backgroundColor: BRAND_COLORS.slate900 }}
        >
            <LoadingItemsModal />
            <div className={"flex flex-col grow w-full my-auto"}>
                <div className={"flex flex-col mx-auto "}>
                    <div className={"flex flex-row w-full"}>
                        <h1 className={"text-3xl font-light"}>
                            {titleString()}
                        </h1>
                    </div>
                    <div className={"flex flex-row mt-2"}>
                        <h2 className={"text-2xl font-light"}>
                            {descriptionString()}
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
                            {portfolioChart()}
                        </div>
                    </div>
                    <div className={"flex flex-row my-auto mt-7"}>
                        {formComponent(selectedAsset)}
                    </div>
                </div>
            </div>
        </div>
    );

}
