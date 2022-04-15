import React, {useState, useContext, useEffect} from 'react';
import axios from "axios";
import {AllocData, keyFromAllocData} from "../types/AllocData";
import {ExplicitPool, ExplicitToken, Protocol, Registry} from '@qpools/sdk';
import {PublicKey} from "@solana/web3.js";

export interface ISerpius {
    portfolioRatios: Map<string, AllocData>,
}

const hardcodedApiResponse = new Map<string, AllocData>();

const defaultValue: ISerpius = {
    portfolioRatios: hardcodedApiResponse
}

const SerpiusContext = React.createContext<ISerpius>(defaultValue);

export function useSerpiusEndpoint() {
    return useContext(SerpiusContext);
}

interface SerpiusInput {
    inputToken: SerpiusToken,
    assets: SerpiusPool[],
}

interface SerpiusToken {
    "address": string,
    "decimals": number,
    "logoURI": string,
    "name": string,
    "symbol": string
}
interface SerpiusPool {
    lp: string,
    weight: number,
    protocol: string,
    apy_24h: number
}

interface Props {
    children: any;
    registry: Registry
}
export function SerpiusEndpointProvider(props: Props) {

    /**
     * App-dependent variables
     */
    const [portfolioRatios, setPortfolioRatios] = useState<Map<string, AllocData>>(hardcodedApiResponse);

    /**
     * Somewhat legacy, will fix and clear these items at a later stage ...
     * You can find all endpoints in notion Docs/Serpius Endpoint Links
     */
    const fetchAndParseSerpiusEndpoint = async () => {
            console.log("#useEffect getSerpiusEndpoint");
            console.log("Loading the weights");
            let response: any = await axios.get<any>(props.registry.getSerpiusEndpoint());
            console.log("Here is the data :");
            console.log(typeof response.data);
            console.log(JSON.stringify(response.data));
            console.log("Next!?");

            if ("allocations" in response.data) {
                console.log("Trying to get the data ...");
                console.log("response.data", response.data);
                console.log("response.data.allocations", response.data["allocations"]);
                console.log("Now loading again ...")
                let data: SerpiusInput[] = response.data["allocations"];

                // TODO: Instead of doing this, maybe fetch the data, and then push it into the map directry ...
                // For now, I will leave it like this
                // let data: SerpiusInput[] = _data.map((x: any) => {return {...x, protocol: Protocol[x.protocol]}});

                console.log("Data is: ", data);
                console.log("After..");
                // setPortfolioRatios(data);
                console.log("(2) Data and type is: ", typeof data, data);

                // Fetch the additional token account for each data item in AllocData

                // Replace the allocData through

                // Now add the information about the ExplicitSaberPool into it as well
                let newData: Map<string, AllocData> = new Map<string, AllocData>();
                await Promise.all(data.map(async (dataItem: SerpiusInput) => {
                    console.log("Parsing serpius item: ", dataItem);
                    let token: SerpiusToken = dataItem.inputToken;
                    let inputToken: ExplicitToken | null = await props.registry.getToken(token.address);
                    if (!inputToken) {
                        console.log("bad data item is: ", dataItem);
                        throw Error("Serpius APi is going bs! " + token.address);
                    }

                    await Promise.all(dataItem.assets.map(async (asset: SerpiusPool) => {
                        console.log("Parsing asset item: ", asset);
                        // TODO: Remove for mainnet / devnet...
                        // TODO: Also add case-distinction for the protocol ...
                        if (asset.lp === "USDC-USDT" && asset.protocol === "saber") {
                            asset.lp = "usdc_usdt"
                        } else if (asset.lp === "mSOL" && asset.protocol === "marinade") {
                            asset.lp = "marinade"
                        } else if (asset.lp === "USDC-CASH" && asset.protocol === "saber") {
                            asset.lp = "usdc_cash"
                        } else if (asset.lp === "USDT-CASH" && asset.protocol === "saber") {
                            asset.lp = "usdt_cash"
                        } else if (asset.lp === "USDC-PAI" && asset.protocol === "saber") {
                            asset.lp = "usdc_pai"
                        } else if (asset.lp === "SOL" && asset.protocol === "solend") {
                            asset.lp = "SOL"
                            // was previously cSOL. ID should be set from the registry, however !!! (and for solend, the id is the Symbol)
                        }

                        console.log("Registry is: ", props.registry);
                        console.log("Getting from getPoolSplStringId (1)");
                        let pool: ExplicitPool | null = await props.registry.getPoolFromSplStringId(asset.lp);
                        console.log("Getting from getPoolSplStringId (2)");
                        if (!pool) {
                            throw Error("The Id that the serpius endpoint provides was not found in the registry ...: " + asset.lp);
                        }
                        // Also create an input amount with the given currency ...
                        // or add another field "input currency
                        // and put the token in there ...?
                        // and
                        let out: AllocData = {
                            apy_24h: asset.apy_24h,
                            weight: asset.weight,
                            lpIdentifier: asset.lp,
                            pool: pool,
                            // @ts-ignore
                            protocol: Protocol[asset.protocol],   // Gotta convert the string to an enum ...
                            usdcAmount: (100 / (data.length)),
                            inputToken: inputToken!
                        };
                        console.log("data item is", out);
                        newData.set(keyFromAllocData(out), out);
                    }));
                }));

                setPortfolioRatios((_: Map<string, AllocData>) => {
                    console.log("Updating new portfolio ratios ...");
                    return newData
                });
            } else {
                console.log("allocations port not found in data!");
            }
            console.log("##useEffect getSerpiusEndpoint");
        }

    /**
     * We do a GET request at the very beginning of the application.
     * Once is enough, the endpoint will update every 12 hours
     */
    useEffect(() => {
        fetchAndParseSerpiusEndpoint();
    }, []);

    const value: ISerpius = {
        portfolioRatios,
    };

    return (
        <>
            <SerpiusContext.Provider value={value}>
                {props.children}
            </SerpiusContext.Provider>
        </>
    );
}
