import {useEffect, useState} from "react";
import {calculateTVL} from "@qpools/sdk/lib/statistics";
import {IQPool, useQPoolUserTool} from "../contexts/QPoolsProvider";

export default function Statistics(props: any) {

    // Just run a lop where you update TVL every couple times
    const qPoolContext: IQPool = useQPoolUserTool();
    const [Tvl, setTvl] = useState<number>(0.);

    useEffect(() => {
        console.log("Loaded qpoolsuser");
        // Initialize the qpoolStats
        qPoolContext.initializeQPoolsStatsTool();
    }, []);

    useEffect(() => {
        // let tvl = qPoolContext.qPoolsStats?.calculateTVL();
        // console.log("TVL is: ", tvl);
        if (
            qPoolContext.qPoolsStats &&
            qPoolContext.qPoolsStats!.currencyMint &&
            qPoolContext.qPoolsStats!.qPoolCurrencyAccount
        ) {
            qPoolContext.initializeQPoolsStatsTool().then(() => {
                qPoolContext.qPoolsStats!.calculateTVL().then(tvl => {
                    setTvl((_) => tvl);
                })
            })
        }
    }, [qPoolContext.qPoolsStats, qPoolContext.qPoolsStats?.currencyMint])

    const singleBox = (title: String, value: String) => {

        return (
            <div className={"m-5 lg:mt-0 lg:ml-0 rounded-lg border-2 border-gray-200 p-5 w-56 h-30"}>
                <h2 className="justify-center text-center lg:left-0 lg:bottom-0 mb-1 text-lg lg:text-2xl">
                    {value}
                </h2>
                <br />
                <h2 className="justify-center text-center lg:left-0 lg:top-0 mb-1 text-lg lg:text-xl text-gray-300">
                    {title}
                </h2>
            </div>
        )

    }

    return (
        <>
            <div className={"flex flex-col md:flex-row items-center lg:items-begin"}>
                {singleBox("Total Value Locked", "$" + String(Tvl) + " USD")}
                {singleBox("Total QTP Minted", "712.03 QTP")}
                {singleBox("7 Day APY", "8.02%")}
            </div>
        </>
    )

}