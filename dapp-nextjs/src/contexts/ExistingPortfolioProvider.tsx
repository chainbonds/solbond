import React, {useState, useContext, useEffect} from 'react';
import {IRpcProvider, useRpc} from "./RpcProvider";
import {ILoad, useLoad} from "./LoadingContext";
import {AllocData, keyFromAllocData, keyFromPoolData} from "../types/AllocData";
import {UserTokenBalance} from "../types/UserTokenBalance";
import {ISerpius, useSerpiusEndpoint} from "./SerpiusProvider";
import {accountExists, PortfolioAccount} from "@qpools/sdk";
import {ExplicitPool, PositionInfo, Registry } from '@qpools/sdk';
import {getWhitelistTokens} from "../../../../qPools-contract/qpools-sdk/src";
import {PublicKey} from "@solana/web3.js";

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

interface Props {
    children: any;
    registry: Registry
}
export function ExistingPortfolioProvider(props: Props) {

    const rpcProvider: IRpcProvider = useRpc();
    const serpiusProvider: ISerpius = useSerpiusEndpoint();
    const loadingProvider: ILoad = useLoad();

    const [positionInfos, setPositionInfos] = useState<Map<string, AllocData>>(new Map<string, AllocData>());
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);

    // Load allocData and modify weights according to
    // Retrieve this from the existing portfolio ...
    // TODO: Again, take out the provider from use-effect
    useEffect(() => {
        calculateAllUsdcValues();
    }, [rpcProvider.userAccount, rpcProvider.provider, rpcProvider.reloadPriceSentinel, serpiusProvider.portfolioRatios]);

    const calculateAllUsdcValues = async () => {
        console.log("#useEffect calculateAllUsdcValues");
        if (rpcProvider.userAccount && rpcProvider.portfolioObject && (await accountExists(rpcProvider.connection!, rpcProvider.portfolioObject.portfolioPDA))) {

            let portfolioAccount: PortfolioAccount | null = await rpcProvider.portfolioObject!.fetchPortfolio();
            if (!portfolioAccount?.fullyCreated) {
                console.log("Portfolio was not fully created just yet!!! ");
                console.log(portfolioAccount);
                console.log(portfolioAccount?.fullyCreated);
                return;
            } else {
                console.log("Portfolio is fully created!");
            }
            // TODO: Should fetch the portfolio, and check if it is fulfilled yet ... otherwise return early ...
            console.log("Going in here (22) ..");
            loadingProvider.increaseCounter();
            let {storedPositions, usdAmount} = await rpcProvider.portfolioObject.getPortfolioUsdcValue();
            console.log("Stored positions are: ", storedPositions);
            loadingProvider.decreaseCounter();
            setTotalPortfolioValueUsd(usdAmount);

            // Change the positions into AllocData Objects
            let newAllocData: Map<string, AllocData> = new Map<string, AllocData>();
            await Promise.all(storedPositions.map(async (x: PositionInfo) => {
                console.log("Pool address is: ", x.mintLp);
                let pool: ExplicitPool | null = await props.registry.getPoolByLpToken(x.mintLp.toString());
                if (!pool) {
                    throw Error("For some reason, the mintLp does not correspond to a pool. Make sure you're using the latest version of the app, and that the devs included all pools that are used!");
                }
                let amount: UserTokenBalance = {
                    amount: x.amountLp,
                    ata: x.ataLp,
                    mint: x.mintLp
                };
                console.log("Displaying individual amounts are: ", amount);
                console.log("usdcValueLp ", x.usdcValueLP);
                // you can probably still get the apy-dates through the serpius endpoint
                // TODO: Should not be pool.name, but should again probably be indexed by the type of protocol, and the id

                // Get whitelisted input token ...
                // Hardcoded, definitely need to code this in!!!
                let whitelistedTokens = getWhitelistTokens();
                // Get the token which is included both in the whitelist, and is tokenA or tokenB
                let inputCurrency: PublicKey;
                if (x.mintA && whitelistedTokens.includes(x.mintA.toString())) {
                    inputCurrency = x.mintA;
                } else if (x.mintB && whitelistedTokens.includes(x.mintA.toString())) {
                    inputCurrency = x.mintB;
                } else {
                    throw Error("Input currency is not one of the tokens A or B!");
                }

                console.log("Key is. (22) ", keyFromPoolData(inputCurrency, pool));
                console.log("Poo is: ", pool);
                console.log("Portfolio Ratios are: ", serpiusProvider.portfolioRatios);

                // TODO: We need to modify this position, s.t. the position also always has a variable "inputToken".
                //  This "inputTokenMint" must be provided on the blockchain account!!
                //  For now we will use a hacky method.


                let serpiusObject: AllocData = serpiusProvider.portfolioRatios.get(keyFromPoolData(inputCurrency, pool))!;
                console.log("Object value is: ", serpiusProvider.portfolioRatios);
                // APY 24h is (if it was loaded already ...)
                console.log("Serpius object is: ", serpiusObject);
                // Quick fix, if the serpius object is empty, just skip it ...
                // probably due to some async concurrency bug ..
                // TODO:, I guess this is why these function usually are run inside the setPositionInfos (because this makes it basically atomic?)
                if (!serpiusObject) {
                    return;
                }
                // The positionInfo is not uniquely mapped to the (inputToken, assetLp) objet. We must change this !!!
                // For now this should be fine, because we do not share any tokens ...
                let allocData: AllocData = {
                    apy_24h: serpiusObject.apy_24h,
                    weight: serpiusObject.weight,
                    lpIdentifier: pool.name,
                    pool: pool,
                    protocol: x.protocol,
                    userInputAmount: amount,
                    userWalletAmount: amount,
                    usdcAmount: x.usdcValueLP,
                    inputToken: serpiusObject.inputToken
                }
                console.log("Pushing allocdata", allocData);
                newAllocData.set(keyFromAllocData(allocData), allocData);
            }));

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
