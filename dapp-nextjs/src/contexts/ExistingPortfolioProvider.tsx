import React, {useState, useContext, useEffect} from 'react';
import {accountExists, registry} from "@qpools/sdk";
import {PositionInfo} from "@qpools/sdk";
import {IRpcProvider, useRpc} from "./RpcProvider";
import {ILoad, useLoad} from "./LoadingContext";
import {AllocData} from "../types/AllocData";
import {UserTokenBalance} from "../types/UserTokenBalance";
import {ISerpius, useSerpiusEndpoint} from "./SerpiusProvider";
import {Property} from "csstype";
import All = Property.All;

export interface IExistingPortfolio {
    positionInfos: Map<string, AllocData>,
    totalPortfolioValueInUsd: number,
}

const defaultValue: IExistingPortfolio = {
    positionInfos: new Map<string, AllocData>(),
    totalPortfolioValueInUsd: 0
}

const ExistingPortfolioContext = React.createContext<IExistingPortfolio>(defaultValue);

export function useExistingPortfolio() {
    return useContext(ExistingPortfolioContext);
}

export function ExistingPortfolioProvider(props: any) {

    const rpcProvider: IRpcProvider = useRpc();
    const serpiusProvider: ISerpius = useSerpiusEndpoint();
    const loadingProvider: ILoad = useLoad();

    const [positionInfos, setPositionInfos] = useState<Map<string, AllocData>>(new Map<string, AllocData>());
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);

    // Load allocData and modify weights according to
    // Retrieve this from the existing portfolio ...
    useEffect(() => {
        calculateAllUsdcValues();
    }, [rpcProvider.userAccount, rpcProvider.provider, rpcProvider.reloadPriceSentinel, serpiusProvider.portfolioRatios]);

    const calculateAllUsdcValues = async () => {
        console.log("#useEffect calculateAllUsdcValues");
        if (rpcProvider.userAccount && rpcProvider.portfolioObject && (await accountExists(rpcProvider.connection!, rpcProvider.portfolioObject.portfolioPDA))) {
            console.log("Going in here ..");
            loadingProvider.increaseCounter();
            let {storedPositions, usdAmount} = await rpcProvider.portfolioObject.getPortfolioUsdcValue();
            loadingProvider.decreaseCounter();
            setTotalPortfolioValueUsd(usdAmount);

            // Change the positions into AllocData Objects
            let newAllocData: Map<string, AllocData> = new Map<string, AllocData>();
            storedPositions.map((x: PositionInfo) => {
                console.log("Pool address is: ", x.mintLp);
                let pool: registry.ExplicitPool = registry.getPoolFromLpMint(x.mintLp);
                let amount: UserTokenBalance = {
                    amount: x.amountLp,
                    ata: x.ataLp,
                    mint: x.mintLp
                }
                // you can probably still get the apy-dates through the serpius endpoint
                let serpiusObject: AllocData = serpiusProvider.portfolioRatios.get(pool.name)!;
                // APY 24h is (if it was loaded already ...)
                console.log("Serpius object is: ", serpiusObject);
                let allocData: AllocData = {
                    apy_24h: serpiusObject.apy_24h,
                    weight: serpiusObject.weight,
                    lp: pool.name,
                    pool: pool,
                    protocol: x.protocol,
                    userInputAmount: amount,
                    userWalletAmount: amount,
                    usdcAmount: x.usdcValueLP
                }
                newAllocData.set(pool.name, allocData);
            });

            setPositionInfos((oldAllocData: Map<string, AllocData>) => {
                return newAllocData;
            });

        } else {
            console.log("Not going in here bcs: ", rpcProvider.userAccount, rpcProvider.portfolioObject, rpcProvider.portfolioObject && (await accountExists(rpcProvider.connection!, rpcProvider.portfolioObject.portfolioPDA)));
        }
        console.log("##useEffect calculateAllUsdcValues");
    }

    const value: IExistingPortfolio = {
        positionInfos,
        totalPortfolioValueInUsd
    };

    return (
        <>
            <ExistingPortfolioContext.Provider value={value}>
                {props.children}
            </ExistingPortfolioContext.Provider>
        </>
    );
}
