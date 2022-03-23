import React, {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import Image from "next/image";
import {ProtocolType, registry} from "@qpools/sdk";
import {useWallet} from "@solana/wallet-adapter-react";
import {COLORS} from "../../const";
import {PublicKey} from "@solana/web3.js";
import {DisplayToken} from "../../types/DisplayToken";
import {ChartableItemType} from "../../types/ChartableItemType";
import {AllocData} from "../../types/AllocData";

const tableColumns: (string | null)[] = [null, "Asset", null, "Allocation", "24H APY"]


export default function SuggestedPortfolioTable() {

    // Instead of the raw pubkeys, store the pyth ID, and then you can look up the price using the pyth sdk ..
    // Much more sustainable also in terms of development

    // Perhaps create a "Loaded Portfolio Component"
    const qPoolContext: IQPool = useQPoolUserTool();
    const walletContext: any = useWallet();
    // TODO: Whenever the portfolio-ratios are downloaded, update this asset as well
    const [selectedAsset, setSelectedAsset] = useState<ChartableItemType | null>(null);

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
            <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
                {
                    columns.map((x: (string | null)) => {
                        if (x) {
                            return (
                                <th scope="col"
                                    className="py-3 px-6 mx-auto text-xs text-center font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400">
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

    // I see what was hardcoded here, haha
    // TODO: Make these chartableItemTypes also all uniform, perhaps use AllocData, and map it in the final iteration ....
    const [ratios, setRatios] = useState<AllocData[] | null>(null);
    const [pieChartData, setPieChartData] = useState<ChartableItemType[]>([
        {name: "USDC-USDT", value: 500, apy_24h: 0.},
        {name: "USDC-PAI", value: 500, apy_24h: 0.},
    ])
    // Make sure types conform ...
    useEffect(() => {
        setRatios((_: AllocData[] | null) => {
            console.log(" CAMOOOOOOOOOOON THIS FUNCTION SHOULD WORK")
            console.log(" CAMOOOOOOOOOOON ", qPoolContext.portfolioRatios)
            return qPoolContext.portfolioRatios!;
        });
    }, [qPoolContext.connection, qPoolContext.userAccount, qPoolContext.portfolioRatios]);

    useEffect(() => {
        console.log("DUDE 1", ratios)
        console.log(ratios)
        if (!ratios) return;
        console.log("DUDE 2", ratios)
        console.log(ratios)
        // Sum is a
        let sum = ratios.reduce((sum: number, current: AllocData) => sum + current.weight, 0);
        console.log("xyz", sum)
        setPieChartData((_: any) => {
                return ratios.map((current: AllocData) => {
                    console.log("asdaf", {
                        name: current.protocol.charAt(0).toUpperCase() + current.protocol.slice(1) + " " + current.lp,
                        value: ((100 * current.weight) / sum),
                        apy_24h: current.apy_24h,
                        pool: registry.getPoolFromSplStringId(current.lp)
                    })
                    console.log("protocol : ", current.protocol);
                    console.log("pool : ", current.lp);
                    console.log("BOOLEAN  : ", (current.protocol == 'marinade'));
                    console.log("DUDE 3", ratios)
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
        console.log("THEREEEEEEEE", item.pool)
        // Gotta make the switch manually here ...
        if (!item.pool) {
            return (
                <></>
            )
        }

        let displayTokens: DisplayToken[] = [];
        console.log("About to unpack item: ", item);
        if (item.pool.poolType === ProtocolType.DEXLP) {
            let displayTokenItemA: DisplayToken = {
                tokenImageLink: registry.getIconFromToken(new PublicKey(item.pool.tokens[0].address)),
                tokenSolscanLink: solscanLink(new PublicKey(item.pool.tokens[0].address))
            };
            displayTokens.push(displayTokenItemA);
            let displayTokenItemB: DisplayToken = {
                tokenImageLink: registry.getIconFromToken(new PublicKey(item.pool.tokens[1].address)),
                tokenSolscanLink: solscanLink(new PublicKey(item.pool.tokens[1].address))
            };
            displayTokens.push(displayTokenItemB);
        } else if (item.pool.poolType === ProtocolType.Staking) {
            let displayTokenItem: DisplayToken = {
                tokenImageLink: registry.getIconFromToken(new PublicKey(item.pool.lpToken.address)),
                tokenSolscanLink: solscanLink(new PublicKey(item.pool.lpToken.address))
            };
            displayTokens.push(displayTokenItem);
        } else if (item.pool.poolType === ProtocolType.Lending) {
            throw Error("Where does lending come from? We haven't even implement anything in this direction!" + JSON.stringify(item));
        } else {
            throw Error("Type of borrow lending not found" + JSON.stringify(item.pool.poolType) + " helo " + JSON.stringify(item.pool));
        }

        let mintLP = new PublicKey(item.pool!.lpToken.address);

        console.log("item :", item.value);
        let theKey = Math.random() + item.value + index;
        console.log("new Key", theKey, "for index", index)

        // Should prob make the types equivalent. Should clean up all types in the front-end repo
        let tailwindOnSelected = "dark:bg-gray-800 hover:bg-gray-900";
        // TODO: Perhaps it's easier to just hardcode it ...
        if (item.name === selectedAsset?.name) {
            console.log("Matching indeed ...");
            tailwindOnSelected = "dark:bg-gray-900 hover:bg-gray-900";
        }
        console.log("Item and selected asset are: ", item.name, selectedAsset?.name);
        console.log("tailwindOnSelected is: ", tailwindOnSelected);

        return (
            <>
                {/* border-base-100 border-b */}
                <tr
                    key={theKey}
                    className={tailwindOnSelected}
                    onClick={() => {
                        setSelectedAsset(item);
                        console.log("Tach Tach");
                    }}
                >
                    {/* Show the icons next to this ... */}
                    <td className="py-4 px-6 text-sm text--center font-normal text-gray-900 whitespace-nowrap dark:text-white">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <div
                                    className={"w-4 h-4 rounded-xl"}
                                    style={{backgroundColor: color}}
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
                        {displayTokens.map((displayToken: DisplayToken) => {
                            return (
                                <a href={displayToken.tokenSolscanLink} target={"_blank"} rel="noreferrer"
                                   className="text-blue-600 dark:text-blue-400 hover:underline">
                                    <Image src={displayToken.tokenImageLink} width={30} height={30}/>
                                </a>
                            )
                        })}
                    </td>
                    <td className="py-4 px-6 text-sm text-center font-normal  whitespace-nowrap dark:text-gray-400">
                        {item.value.toFixed(0)}%
                    </td>
                    <td className="py-4 px-6 text-sm text-center text-right whitespace-nowrap">
                        {(item.apy_24h).toFixed(1)}%
                    </td>
                </tr>
            </>
        )
    }


    return (
        <>
            <div className="flex flex-col">
                <div className="overflow-x-auto w-full">
                    <div className="inline-block pb-2 min-w-full">
                        <div className="overflow-hidden shadow-md sm:rounded-lg">
                            <table className="min-w-full">
                                {tableHeader(tableColumns)}
                                {/* key={Math.random() + pieChartData[0].value} */}
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
