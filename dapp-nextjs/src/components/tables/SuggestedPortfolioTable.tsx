import React, {useEffect, useState} from "react";
import {AllocData, IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import Image from "next/image";
import {PositionInfo, registry} from "@qpools/sdk";
import {useWallet} from "@solana/wallet-adapter-react";
import {COLORS} from "../../const";
import {PublicKey} from "@solana/web3.js";

const tableColumns: (string | null)[] = [null, "Asset", null, "Allocation", "24H APY"]

export interface ChartableItemType {
    name: string,
    value: number,
    apy_24h: number,
    pool?: registry.ExplicitSaberPool
}

export default function SuggestedPortfolioTable() {

    // Perhaps create a "Loaded Portfolio Component"
    const qPoolContext: IQPool = useQPoolUserTool();
    const walletContext: any = useWallet();

    useEffect(() => {
        if (walletContext.publicKey) {
            console.log("Wallet pubkey wallet is:", walletContext.publicKey.toString());
            qPoolContext.initializeQPoolsUserTool(walletContext);
        }
    }, [walletContext.publicKey]);


    /**
     * Header for the Table
     * Should also split up into different
     */
    const tableHeader = (columns: (string | null)[]) => {
        return (
            <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
                {
                    columns.map((x: (string | null)) => {
                        if (x) {
                            return (
                                <th scope="col"
                                    className="py-3 px-6 text-xs font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400">
                                    {x}
                                </th>
                            )
                        } else {
                            return (
                                <th scope="col" className="relative py-3 px-6">
                                    <span className="sr-only">Edit</span>
                                </th>
                            )
                        }
                    })
                }
            </tr>
            </thead>
        )
    }

    const [ratios, setRatios] = useState<AllocData[] | null>(null);
    const [pieChartData, setPieChartData] = useState<ChartableItemType[]>([
        {name: "USDC-USDT", value: 500, apy_24h: 0.},
        {name: "USDC-PAI", value: 500, apy_24h: 0.},
    ])
    // Make sure types conform ...
    useEffect(() => {
        setRatios((_: AllocData[] | null) => {
            return qPoolContext.portfolioRatios!;
        });
    }, [qPoolContext.portfolioRatios]);

    useEffect(() => {
        if (!ratios) return;

        // Sum is a
        let sum = ratios.reduce((sum: number, current: AllocData) => sum + current.weight, 0);
        setPieChartData((_: any) => {
                return ratios.map((current: AllocData) => {
                    return {
                        name: current.protocol.charAt(0).toUpperCase() + current.protocol.slice(1) + " " + current.lp,
                        value: ((100 * current.weight) / sum),
                        apy_24h: current.apy_24h,
                        pool: registry.getPoolFromSplStringId(current.lp)
                    }
                });
            }
        )

    }, [ratios]);

    const tableSingleRow = (item: ChartableItemType, index: number) => {

        // Also add colors to the other portoflio ...
        let color = COLORS[index % COLORS.length];

        // I guess we need the rich data ...

        // Gotta make the switch manually here ...
        if (!item.pool) {
            return (
                <></>
            )
        }

        // Gotta make sure it's fine
        let mintA = new PublicKey(item.pool!.tokens[0].address);
        let mintB = new PublicKey(item.pool!.tokens[1].address);
        let mintLP = new PublicKey(item.pool!.lpToken.address);

        // Get the icon from the registry
        let iconMintA = registry.getIconFromToken(mintA);
        let iconMintB = registry.getIconFromToken(mintB);

        let style = {backgroundColor: color};

        return (
            <>
                <tr className="dark:bg-gray-800">
                    {/* Show the icons next to this ... */}
                    <td className="py-4 px-6 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <div
                                    className={"w-4 h-4 rounded-xl"}
                                    style={style}
                                >{}</div>
                            </div>
                        </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-center font-normal text-gray-900 whitespace-nowrap dark:text-white">
                        <a href={solscanLink(mintLP)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-500 hover:underline">
                            {/*{shortenedAddressString(mintLP)}*/}
                            {item.name}
                        </a>
                    </td>
                    <td className="py-4 px-6 text-sm text-center font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                        <a href={solscanLink(mintA)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-400 hover:underline">
                            <Image src={iconMintA} width={30} height={30} />
                        </a>
                        <a href={solscanLink(mintB)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-400 hover:underline">
                            <Image src={iconMintB} width={30} height={30} />
                        </a>
                    </td>
                    <td className="py-4 px-6 text-sm text-center font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                        {item.value.toFixed(0)}%
                    </td>
                    <td className="py-4 px-6 text-sm text-center text-right whitespace-nowrap">
                        {(item.apy_24h).toFixed(1)}%
                    </td>
                    {/*<td className="py-4 px-6 text-sm text-right whitespace-nowrap">*/}
                    {/*    ${(0.01 * row.value * totalAmountInUsdc).toFixed(2)}*/}
                    {/*</td>*/}
                </tr>
            </>
        )
    }


    return (
        <>
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block pb-2 min-w-full">
                        <div className="overflow-hidden shadow-md sm:rounded-lg">
                            <table className="min-w-full">
                                {tableHeader(tableColumns)}
                                <tbody>
                                    {pieChartData.map((position: ChartableItemType, index: number) => tableSingleRow(position, index))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}
