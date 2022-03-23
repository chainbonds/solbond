import React, {useState, useContext, useEffect} from 'react';
import {DisplayPortfolios} from "@qpools/sdk";
import {accountExists} from "@qpools/sdk";
import {PositionInfo} from "@qpools/sdk";
import {IRpcProvider, useRpc} from "./RpcProvider";


export interface IExistingPortfolio {
    positionInfos: PositionInfo[],
    totalPortfolioValueInUsd: number,
    displayPortfolio: DisplayPortfolios | undefined
}

const defaultValue: IExistingPortfolio = {
    displayPortfolio: undefined,
    positionInfos: [],
    totalPortfolioValueInUsd: 0
}

const ExistingPortfolioContext = React.createContext<IExistingPortfolio>(defaultValue);

export function useExistingPortfolio() {
    return useContext(ExistingPortfolioContext);
}

export function ExistingPortfolioProvider(props: any) {

    const rpcProvider: IRpcProvider = useRpc();

    const [positionInfos, setPositionInfos] = useState<PositionInfo[]>([]);
    const [displayPortfolio, setDisplayPortfolio] = useState<DisplayPortfolios | undefined>(undefined);
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);

    useEffect(() => {
        calculateAllUsdcValues();
    }, [rpcProvider.userAccount, rpcProvider.provider, rpcProvider.reloadPriceSentinel]);

    // Calculate all usdc values
    const calculateAllUsdcValues = async () => {
        console.log("#useEffect calculateAllUsdcValues");
        if (rpcProvider.userAccount && rpcProvider.portfolioObject && (await accountExists(rpcProvider.connection!, rpcProvider.portfolioObject.portfolioPDA))) {
            console.log("Going in here ..");
            let {storedPositions, usdAmount} = await rpcProvider.portfolioObject.getPortfolioUsdcValue();
            setTotalPortfolioValueUsd(usdAmount);
            setPositionInfos(storedPositions);
        } else {
            console.log("Not going in here bcs: ", rpcProvider.userAccount, rpcProvider.portfolioObject, rpcProvider.portfolioObject && (await accountExists(rpcProvider.connection!, rpcProvider.portfolioObject.portfolioPDA)));
        }
        console.log("##useEffect calculateAllUsdcValues");
    }

    const value: IExistingPortfolio = {
        positionInfos,
        totalPortfolioValueInUsd,
        displayPortfolio
    };

    return (
        <>
            <ExistingPortfolioContext.Provider value={value}>
                {props.children}
            </ExistingPortfolioContext.Provider>
        </>
    );
}
