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
import {white} from "colorette";

export enum HeroFormState {
    ShowSuggestedPortfolio,
    ShowExistingPortfolio
}
export enum PortfolioSuggestion {
    ShowWalletAsPortfolio
}
export const Main: FC = ({}) => {

    const walletContext: WalletContextState = useWallet();

    const [displayForm, setDisplayForm] = useState<HeroFormState>(HeroFormState.ShowSuggestedPortfolio);
    const rpcProvider: IRpcProvider = useRpc();
    const serpiusProvider: ISerpius = useSerpiusEndpoint();
    const userWalletAssetsProvider: IUserWalletAssets = useUserWalletAssets();

    const [allocationData, setAllocationData] = useState<AllocData[]>([]);
    // Set a state for a selected item ..
    const [selectedAsset, setSelectedAsset] = useState<AllocData | null>(null);

    // Whenever the allocationData changes, set the selecte item back
    useEffect(() => {
        if (allocationData && allocationData.length > 0 && (selectedAsset === null)) {
            setSelectedAsset(allocationData[0])
        }
    }, [allocationData]);

    // Maybe set loading until we are able to read the serpius API
    useEffect(() => {
        // Yet another option would be to load the assets from the portfolio position ...
        if (
            userWalletAssetsProvider.walletAssets &&
            userWalletAssetsProvider.walletAssets.length > 0
        ) {
            setAllocationData((_: AllocData[]) => {
                console.log("The new allocation (wallet) data is: ", userWalletAssetsProvider.walletAssets);
                return userWalletAssetsProvider.walletAssets!;
            });
        } else if (serpiusProvider.portfolioRatios) {
            setAllocationData((_: AllocData[]) => {
                console.log("The new allocation (serpius) data is: ", serpiusProvider.portfolioRatios);
                return serpiusProvider.portfolioRatios;
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
    const formComponent = (asset: AllocData | null) => {
        if (displayForm === HeroFormState.ShowSuggestedPortfolio) {
            if (walletContext.publicKey && asset && asset.pool) {

                console.log("Asset is: ", asset);
                console.log("Pool is: ", asset.pool);

                let selectedAssetTokens = asset.pool!.tokens;
                let whitelistedTokenStrings = new Set<string>(registry.getWhitelistTokens());

                interface SelectedToken {
                    name: string,
                    mint: PublicKey
                }
                console.log("Whitelist tokens are: ", registry.getWhitelistTokens());
                let filteredTokens: registry.ExplicitToken[] = selectedAssetTokens.filter((x: registry.ExplicitToken) => {
                    // console.log("Looking at the token: ", x);
                    console.log("Looking at the token: ", x.address);
                    // return whitelistedTokens.has(new PublicKey(x.address))
                    console.log("Does it have it: ", whitelistedTokenStrings.has(x.address));
                    return whitelistedTokenStrings.has(x.address)
                })
                console.log("Initial set of input tokens is: ", filteredTokens);
                let inputTokens = filteredTokens.map((x: registry.ExplicitToken) => {
                    return {
                        name: x.name,
                        mint: new PublicKey(x.address)
                    }
                })
                console.log("Input tokens are: ", inputTokens);

                // Gotta assert that at least one of the tokens is an input token:
                if (inputTokens.length < 1) {
                    console.log("Whitelist tokens are: ", registry.getWhitelistTokens());
                    console.log("SelectedAssetToken: ", selectedAssetTokens);
                    throw Error("Somehow this pool has no whitelisted input tokens!");
                };
                let inputToken = inputTokens[0];
                console.log("Input token in: ", inputToken);

                return (<>
                        <StakeForm
                            currencyMint={inputToken.mint}
                            currencyName={inputToken.name}
                            allocationItem={asset}
                        />
                    </>
                );
            } else if (walletContext.publicKey && asset) {
                console.log("Pool is empty!!");
                console.log(asset);
            } else {
                console.log("No asset selected...!!");
                console.log(asset);
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
                    />
                </>
            )
        }
    }

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
