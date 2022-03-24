import React, {useState, useContext, useEffect} from 'react';
import {DisplayPortfolios} from "@qpools/sdk";
import axios from "axios";
import {registry, Protocol} from "@qpools/sdk";
import {AllocData} from "../types/AllocData";

export interface ISerpius {
    displayPortfolio: DisplayPortfolios | undefined,
    portfolioRatios: AllocData[],
}

const hardcodedApiResponse = [
    {
        "lp": "USDC-USDT",
        "weight": 1000,
        "protocol": Protocol.saber,
        "apy_24h": 0.
    }
]

const defaultValue: ISerpius = {
    displayPortfolio: undefined,
    portfolioRatios: hardcodedApiResponse
}

const SerpiusContext = React.createContext<ISerpius>(defaultValue);

export function useSerpiusEndpoint() {
    return useContext(SerpiusContext);
}

export function SerpiusEndpointProvider(props: any) {

    /**
     * App-dependent variables
     */
    const [displayPortfolio, setDisplayPortfolio] = useState<DisplayPortfolios | undefined>(undefined);
    const [portfolioRatios, setPortfolioRatios] = useState<AllocData[]>(hardcodedApiResponse);

    /**
     * Somewhat legacy, will fix and clear these items at a later stage ...
     */
    const fetchAndParseSerpiusEndpoint = async () => {
            console.log("#useEffect getSerpiusEndpoint");
            console.log("Loading the weights");
            //registry.getSerpiusEndpoint()
            //"https://qpools.serpius.com/weight_status_v2.json"
            // let response = await axios.get<any>(getSerpiusEndpoint());
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
                let _data = response.data["opt_port"];
                let data: AllocData[] = _data.map((x: any) => {return {...x, protocol: Protocol[x.protocol]}});
                console.log("After..");
                // setPortfolioRatios(data);
                console.log("(2) Data and type is: ", typeof data, data);

                // Fetch the additional token account for each data item in AllocData
                setPortfolioRatios((_: AllocData[]) => {

                    // Replace the allocData through

                    // Now add the information about the ExplicitSaberPool into it as well
                    let newData = data.map((dataItem: AllocData) => {
                        console.log("data lp is: ", dataItem.lp);

                        // For a quick fix, rename the UST-USDC to USDC-USDT
                        // TODO: Remove for devnet ...
                        if (dataItem.lp === "UST-USDC") {
                            dataItem.lp = "USDC-USDT"
                        } else if (dataItem.lp === "mSOL") {
                            dataItem.lp = "marinade"
                        }

                        dataItem.pool = registry.getPoolFromSplStringId(dataItem.lp);
                        console.log("data item is", dataItem)
                        return dataItem;
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
        displayPortfolio,
    };

    return (
        <>
            <SerpiusContext.Provider value={value}>
                {props.children}
            </SerpiusContext.Provider>
        </>
    );
}
