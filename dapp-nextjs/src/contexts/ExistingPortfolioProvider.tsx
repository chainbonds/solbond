import React, {useState, useContext, useEffect} from 'react';
import {DisplayPortfolios} from "@qpools/sdk";
import {accountExists} from "@qpools/sdk";
import {PositionInfo} from "@qpools/sdk";
import {useQPoolUserTool} from "./QPoolsProvider";


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

    const qPoolsTool = useQPoolUserTool();

    const [positionInfos, setPositionInfos] = useState<PositionInfo[]>([]);
    const [displayPortfolio, setDisplayPortfolio] = useState<DisplayPortfolios | undefined>(undefined);
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);

    useEffect(() => {
        calculateAllUsdcValues();
    }, [qPoolsTool.userAccount, qPoolsTool.provider, qPoolsTool.reloadPriceSentinel]);

    // Calculate all usdc values
    const calculateAllUsdcValues = async () => {
        console.log("#useEffect calculateAllUsdcValues");
        if (qPoolsTool.userAccount && qPoolsTool.portfolioObject && (await accountExists(qPoolsTool.connection!, qPoolsTool.portfolioObject.portfolioPDA))) {
            console.log("Going in here ..");
            let {storedPositions, usdAmount} = await qPoolsTool.portfolioObject.getPortfolioUsdcValue();
            setTotalPortfolioValueUsd(usdAmount);
            setPositionInfos(storedPositions);
        } else {
            console.log("Not going in here bcs: ", qPoolsTool.userAccount, qPoolsTool.portfolioObject, qPoolsTool.portfolioObject && (await accountExists(qPoolsTool.connection!, qPoolsTool.portfolioObject.portfolioPDA)));
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
