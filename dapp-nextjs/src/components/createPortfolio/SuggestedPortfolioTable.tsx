import React, {useEffect, useState} from "react";
import {
    displayTokensFromChartableAsset, displayTokensFromPool,
    getInputToken,
    SelectedToken,
    solscanLink
} from "../../utils/utils";
import Image from "next/image";
import {registry} from "@qpools/sdk";
import {PIECHART_COLORS} from "../../const";
import {PublicKey} from "@solana/web3.js";
import {DisplayToken} from "../../types/DisplayToken";
import {ChartableItemType} from "../../types/ChartableItemType";
import {AllocData} from "../../types/AllocData";
import {Protocol} from "@qpools/sdk";
import TableHeader from "../common/TableHeader";

// I guess this columns is also conditional, actually ...
// TODO: Normalize (rename) the name "selectedAssets"
interface Props {
    tableColumns: (string | null)[],
    selectedAssets: Map<string, AllocData>,
    selectedAsset: string | null,
    setSelectedAsset: React.Dispatch<React.SetStateAction<string>> | null,
    assetChooseable: boolean
}

export default function SuggestedPortfolioTable({tableColumns, selectedAssets, selectedAsset, setSelectedAsset, assetChooseable}: Props) {

    // Instead of the raw pubkeys, store the pyth ID, and then you can look up the price using the pyth sdk ..
    // Much more sustainable also in terms of development

    const [pieChartData, setPieChartData] = useState<ChartableItemType[]>([
        {key: "USDC-USDT", name: "USDC-USDT", value: 500, apy_24h: 0.},
        {key: "USDC-PAI", name: "USDC-PAI", value: 500, apy_24h: 0.},
    ])

    const pieChartLoader = async () => {
        // Change this to async map (?)
        let allocationSum = Array.from(selectedAssets.values()).reduce((sum, current) => sum + current.usdcAmount, 0);
        // : string
        // : AllocData
        let newPieChartData: ChartableItemType[] = await Promise.all(Array.from(selectedAssets.entries()).map(async ([key, current]) => {
            console.log("Value is: ", current.usdcAmount, allocationSum);
            let displayTokens: DisplayToken[] = await displayTokensFromPool(current.pool);
            let inputToken: SelectedToken = await getInputToken(current.pool.tokens);
            let inputTokenLink: string = await registry.getIconFromToken(inputToken.mint);
            let tmp: ChartableItemType = {
                key: key,
                name: Protocol[current.protocol].charAt(0).toUpperCase() + Protocol[current.protocol].slice(1) + " " + current.lp,
                value: allocationSum > 0 ? (100 * current.usdcAmount) / allocationSum : 0,
                apy_24h: current.apy_24h,
                pool: current.pool,
                allocationItem: current,
                displayTokens: displayTokens,
                inputToken: inputToken,
                inputTokenLink: inputTokenLink,
            }
            return tmp;
        }));
        setPieChartData((old: ChartableItemType[]) => {return newPieChartData});
    }

    useEffect(() => {
        pieChartLoader();
    }, [selectedAssets]);

    const tableSingleRow = (item: ChartableItemType, index: number) => {

        // Also add colors to the other portoflio ...
        let color = PIECHART_COLORS[3*index % PIECHART_COLORS.length];

        // I guess we need the rich data ...
        console.log("THEREEEEEEEE", item.pool)
        // Gotta make the switch manually here ...
        if (!item.pool) {
            return (
                <></>
            )
        }

        console.log("Converting display token to this: ", item);
        // TODO: Gotta make this async again ... /// Moved
        // let displayTokens: DisplayToken[] = await displayTokensFromChartableAsset(item);
        console.log("Converting display token to this: (2) ", item);

        let mintLP = new PublicKey(item.pool!.lpToken.address);

        console.log("item :", item.value);
        let theKey = Math.random() + item.value + index;
        console.log("new Key", theKey, "for index", index)

        // Should prob make the types equivalent. Should clean up all types in the front-end repo
        let tailwindOnSelected = "dark:bg-gray-800";
        if (setSelectedAsset && assetChooseable) {
            tailwindOnSelected += " hover:bg-gray-900"
        }
        // TODO: Perhaps it's easier to just hardcode it ...
        // TODO: This shouldn't make any sense ... obviously the LP is not equivalent to the item name
        if (item.key === selectedAsset && assetChooseable) {
            console.log("Matching indeed ...");
            tailwindOnSelected = "dark:bg-gray-900 hover:bg-gray-900";
        } else {
            console.log("Bullshit... not matching lol")
        }
        console.log("Item and selected asset are: ", item.name, selectedAsset);
        console.log("tailwindOnSelected is: ", tailwindOnSelected);

        // Get (the name for) the asset to be inputted ...
        // let inputToken: SelectedToken = await getInputToken(item.pool.tokens);
        // let inputTokenLink: string = await registry.getIconFromToken(inputToken.mint);

        // Add a counter here, depending on how many props there are in the object lol
        // TODO: Solve this more elegantly ...

        return (
                <tr
                    key={theKey}
                    className={tailwindOnSelected}
                    onClick={() => {
                        if (setSelectedAsset) {
                            setSelectedAsset((_: string) => {
                                console.log("Item is:", item.allocationItem);
                                console.log("About to set the selectedAsset to", item);
                                console.log("About to set the selectedAsset to", item.allocationItem);
                                return item.key;
                            });
                        }
                        console.log("Tach Tach");
                    }}
                >
                    {/* Show the icons next to this ... */}
                    <td className="py-4 lg:px-6 text-sm text--center font-normal text-gray-900 whitespace-nowrap dark:text-gray-100">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <div
                                    className={"w-4 h-4 rounded-xl"}
                                    style={{backgroundColor: color}}
                                >{}</div>
                            </div>
                        </div>
                    </td>
                    <td className="py-4 lg:px-6 text-sm text-center font-normal text-gray-500 whitespace-nowrap dark:text-gray-100">
                        {item.inputToken &&
                            <a href={solscanLink(item.inputToken!.mint)} target={"_blank"} rel="noreferrer"
                               className="text-blue-600 dark:text-blue-400 hover:underline">
                                {item.inputTokenLink &&
                                    <Image className={"rounded-3xl"} src={item.inputTokenLink!} width={30} height={30}/>
                                }
                            </a>
                        }
                    </td>
                    <td className="py-4 lg:px-6 text-sm text-center font-normal text-gray-500 whitespace-nowrap dark:text-gray-100">
                        <div className={"flex flex-row"}>
                            <a href={solscanLink(mintLP)} target={"_blank"} rel="noreferrer"
                               className="hover:underline">
                                {/*{shortenedAddressString(mintLP)}*/}
                                {item.name}
                            </a>
                        </div>
                    </td>
                    <td className="py-4 lg:px-6 text-sm text-center font-normal text-gray-500 whitespace-nowrap dark:text-gray-100">
                        {item.displayTokens && item.displayTokens!.map((displayToken: DisplayToken) => {
                            return (
                                <a key={Math.random()} href={displayToken.tokenSolscanLink} target={"_blank"} rel="noreferrer"
                                   className="text-blue-600 dark:text-blue-400 hover:underline">
                                    <Image src={displayToken.tokenImageLink} width={30} height={30}/>
                                </a>
                            )
                        })}
                    </td>
                    <td className="py-4 lg:px-6 text-sm text-center font-normal whitespace-nowrap dark:text-gray-100">
                        {item.value.toFixed(0)}%
                    </td>
                    <td className="py-4 lg:px-6 text-sm text-center whitespace-nowrap">
                        {(item.apy_24h).toFixed(1)}%
                    </td>
                    {(item.allocationItem && item.allocationItem?.userInputAmount?.amount && tableColumns.length > 5) &&
                        <td className="py-4 lg:px-6 text-sm text-center whitespace-nowrap">
                            {/* inputToken.name */}
                            {item.allocationItem?.userInputAmount?.amount.uiAmount && (item.allocationItem?.userInputAmount?.amount.uiAmount).toFixed(2)}
                        </td>
                    }
                    {(item.allocationItem && item.allocationItem.usdcAmount && tableColumns.length > 6) &&
                        <td className="py-4 lg:px-6 text-sm text-center whitespace-nowrap">
                            {/* inputToken.name */}
                            {item.allocationItem?.usdcAmount && (item.allocationItem?.usdcAmount).toFixed(2)}
                        </td>
                    }
                </tr>
        )
    }

    return (
        <>
            <div className="moverflow-x-scroll lg:overflow-hidden ">
                {/*inline-block*/}
                <div className="pb-2 min-w-full overflow-x-scroll">
                    {/* hidden lg:block */}
                    <div className="shadow-md rounded-md overflow-x-scroll">
                        <table className="min-w-full"
                               key={Math.random()}
                        >
                            {/* + pieChartData[0].value */}
                            <TableHeader
                                key={Math.random()}
                                columns={pieChartData ? tableColumns : tableColumns.slice(0, tableColumns.length - 1)}/>
                            <tbody
                                key={Math.random()}>
                                {pieChartData.map((position: ChartableItemType, index: number) => tableSingleRow(position, index))}
                            </tbody>
                        </table>
                    </div>
                    {/*<div className={"grid grid-cols-1 gap-4 lg:hidden"} >*/}
                    {/*</div>*/}
                </div>
            </div>
        </>
    );
}
