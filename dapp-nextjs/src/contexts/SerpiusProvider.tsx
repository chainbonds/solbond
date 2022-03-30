import React, {useState, useContext, useEffect} from 'react';
import axios from "axios";
import {registry, Protocol} from "@qpools/sdk";
import {AllocData} from "../types/AllocData";

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
    lp: string,
    weight: number,
    protocol: string,
    apy_24h: number
}

export function SerpiusEndpointProvider(props: any) {

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
            let response = await axios.get<any>(registry.getSerpiusEndpoint());
            console.log("Here is the data :");
            console.log(typeof response.data);
            console.log(JSON.stringify(response.data));
            console.log("Next!?");

            if ("opt_port" in response.data) {
                console.log("Trying to get the data ...");
                console.log("response.data", response.data);
                console.log("response.data.opt_port", response.data["opt_port"]);
                console.log("Now loading again ...")
                let data: SerpiusInput[] = response.data["opt_port"];

                // TODO: Instead of doing this, maybe fetch the data, and then push it into the map directry ...
                // For now, I will leave it like this
                // let data: SerpiusInput[] = _data.map((x: any) => {return {...x, protocol: Protocol[x.protocol]}});

                console.log("After..");
                // setPortfolioRatios(data);
                console.log("(2) Data and type is: ", typeof data, data);

                // Fetch the additional token account for each data item in AllocData
                setPortfolioRatios((_: Map<string, AllocData>) => {

                    // Replace the allocData through

                    // Now add the information about the ExplicitSaberPool into it as well
                    let newData: Map<string, AllocData> = new Map<string, AllocData>();
                    data.map((dataItem: SerpiusInput) => {
                        console.log("data lp is: ", dataItem.lp);
                        // TODO: Remove for mainnet / devnet...
                        if (dataItem.lp === "UST-USDC") {
                            dataItem.lp = "USDC-USDT"
                        } else if (dataItem.lp === "mSOL") {
                            dataItem.lp = "marinade"
                        }

                        let pool = registry.getPoolFromSplStringId(dataItem.lp);
                        let out: AllocData = {
                            apy_24h: dataItem.apy_24h,
                            lp: dataItem.lp,
                            pool: pool,
                            // @ts-ignore
                            protocol: Protocol[dataItem.protocol],   // Gotta convert the string to an enum ...
                            usdcAmount: (100 / (data.length))
                        };
                        console.log("data item is", out);
                        newData.set(out.lp, out);
                    });

                    console.log("Updating new portfolio ratios ...");
                    return newData
                });
            } else {
                console.log("opt port not found in data!");
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
