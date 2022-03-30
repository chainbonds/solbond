import React, {useState, useContext, useEffect} from 'react';
import {accountExists} from "@qpools/sdk";
import {PositionInfo} from "@qpools/sdk";
import {IRpcProvider, useRpc} from "./RpcProvider";
import {ILoad, useLoad} from "./LoadingContext";

export interface IExistingPortfolio {
    positionInfos: PositionInfo[],
    totalPortfolioValueInUsd: number,
}

const defaultValue: IExistingPortfolio = {
    positionInfos: [],
    totalPortfolioValueInUsd: 0
}

const ExistingPortfolioContext = React.createContext<IExistingPortfolio>(defaultValue);

export function useExistingPortfolio() {
    return useContext(ExistingPortfolioContext);
}

export function ExistingPortfolioProvider(props: any) {

    const rpcProvider: IRpcProvider = useRpc();
    const loadingProvider: ILoad = useLoad();

    const [positionInfos, setPositionInfos] = useState<PositionInfo[]>([]);
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);

    // Load allocData and modify weights according to


    // Retrieve this from the existing portfolio ...
    useEffect(() => {
        calculateAllUsdcValues();
    }, [rpcProvider.userAccount, rpcProvider.provider, rpcProvider.reloadPriceSentinel]);

    // Calculate all usdc values
    const calculateAllUsdcValues = async () => {
        console.log("#useEffect calculateAllUsdcValues");
        if (rpcProvider.userAccount && rpcProvider.portfolioObject && (await accountExists(rpcProvider.connection!, rpcProvider.portfolioObject.portfolioPDA))) {
            console.log("Going in here ..");
            loadingProvider.increaseCounter();
            let {storedPositions, usdAmount} = await rpcProvider.portfolioObject.getPortfolioUsdcValue();
            loadingProvider.decreaseCounter();
            setTotalPortfolioValueUsd(usdAmount);
            setPositionInfos(storedPositions);
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
