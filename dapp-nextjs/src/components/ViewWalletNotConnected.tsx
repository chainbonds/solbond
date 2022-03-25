import {useEffect, useState} from "react";
import {AllocData} from "../types/AllocData";
import {Protocol} from "@qpools/sdk";

interface Props {
    portfolioRatios: AllocData[],

}
export const ViewWalletNotConnected = ({portfolioRatios}: any) => {

    const [allocationData, setAllocationData] = useState<Map<string, AllocData>>(new Map());

    // Maybe set loading until we are able to read the serpius API
    useEffect(() => {
        // Yet another option would be to load the assets from the portfolio position ...
        setAllocationData((_: Map<string, AllocData>) => {
            console.log("The new allocation (serpius) data is: ", portfolioRatios);
            // TODO: Replace the assets here (form a map from an Array)
            let out: Map<string, AllocData> = new Map<string, AllocData>();
            portfolioRatios.map((x: AllocData) => {
                let key: string = Protocol[x.protocol] + " " + x.lp;
                out.set(key, x);
            });
            return out;
        });
    }, [portfolioRatios]);

    return (
        <>
        </>
    )

}