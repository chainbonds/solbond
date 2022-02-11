import {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../contexts/QPoolsProvider";
import {delay} from "@qpools/sdk/lib/utils";
import {BN} from "@project-serum/anchor";

export default function Statistics(props: any) {

    // Just run a lop where you update TVL every couple times
    const qPoolContext: IQPool = useQPoolUserTool();
    const [tvl, setTvl] = useState<number>(0.);
    const [totalQPT, setTotalQPT] = useState<number>(0.);
    const [tvlDecimals, setTvlDecimals] = useState<number>(0.);

    const initializeQPoolsAndCalculateTVL = async () => {
        console.log("Loaded qpoolsuser");
        await qPoolContext.initializeQPoolsStatsTool();
        await delay(5000);
    }

    useEffect(() => {
        initializeQPoolsAndCalculateTVL();
    }, []);

    const updateStatistics = () => {
        if (qPoolContext && qPoolContext.qPoolsStats) {

            // if (!qPoolContext.qPoolsStats) {
            //     throw Error("Something went wrong loading qPoolsStats!");
            // }

            if (qPoolContext.qPoolsStats) {

                qPoolContext.qPoolsStats.collectPriceFeed().then(() => {
                    qPoolContext.qPoolsStats!.calculateTVL().then(out => {
                        console.log("Tvl decimals are: ", out.tvlDecimals);
                        setTvl((_) => out.tvl.toNumber());
                        setTotalQPT((_) => out.totalQPT);
                        setTvlDecimals((_) => out.tvlDecimals);
                        delay(5000).then(() => {
                            // delay a bit, and call itself again ...
                            updateStatistics();
                        });
                    })
                });

            } else {
                console.log("Stats now loaded yet!", qPoolContext, qPoolContext.qPoolsStats)
            }

        }
    }

    useEffect(() => {
        updateStatistics();
        delay(5000).then(() => {
            updateStatistics();
        });
    }, [qPoolContext, qPoolContext.qPoolsStats])

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

    const singleBoxDimmed = (title: String, value: String) => {

        return (
            <div className={"m-5 lg:mt-0 lg:ml-0 rounded-lg border-2 border-gray-600 p-5 w-56 h-30"}>
                <h2 className="justify-center text-center lg:left-0 lg:bottom-0 mb-1 text-lg lg:text-2xl text-gray-500">
                    {value}
                </h2>
                <br />
                <h2 className="justify-center text-center lg:left-0 lg:top-0 mb-1 text-lg lg:text-xl text-gray-500">
                    {title}
                </h2>
            </div>
        )

    }

    const emptyBox = () => {

        return (
            <div className={"invisible md:visible m-5 lg:mt-0 lg:ml-0 rounded-lg p-5 w-56 h-30"}></div>
        )

    }

    return (
        <>
            <div className={"flex flex-col md:flex-row items-center lg:items-begin"}>
                {singleBox("Total Value Locked", "$ " + String((tvl / (10 ** tvlDecimals)).toFixed(2) ) + " USD")}
                {singleBoxDimmed("7 Day APY", "Coming Soon")}
                {emptyBox()}
                {/*8.02%*/}
            </div>
        </>
    )

}