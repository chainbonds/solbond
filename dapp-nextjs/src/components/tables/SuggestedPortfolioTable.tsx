import React, {useEffect, useState} from "react";
import {
    displayTokensFromChartableAsset,
    getInputToken,
    SelectedToken,
    shortenedAddressString,
    solscanLink
} from "../../utils/utils";
import Image from "next/image";
import {registry} from "@qpools/sdk";
import {COLORS} from "../../const";
import {PublicKey} from "@solana/web3.js";
import {DisplayToken} from "../../types/DisplayToken";
import {ChartableItemType} from "../../types/ChartableItemType";
import {AllocData} from "../../types/AllocData";
import TableHeader from "./TableHeader";

// I guess this columns is also conditional, actually ...
const tableColumns: (string | null)[] = [null, "Pay-In Asset", "Product", "Underlying Asset", "Allocation", "24H APY", "Absolute Amount"]

interface Props {
    selectedAssets: Map<string, AllocData>,
    selectedAsset: string,
    setSelectedAsset:  React.Dispatch<React.SetStateAction<string>>,
    // modifyIndividualAllocationItem: (currentlySelectedKey: string, absoluteBalance: number) => void,  // How to convert this to a setter function signature,
}
export default function SuggestedPortfolioTable({selectedAssets, selectedAsset, setSelectedAsset}: Props) {

    // Instead of the raw pubkeys, store the pyth ID, and then you can look up the price using the pyth sdk ..
    // Much more sustainable also in terms of development

    // I see what was hardcoded here, haha
    // TODO: Make these chartableItemTypes also all uniform, perhaps use AllocData, and map it in the final iteration ....
    const [pieChartData, setPieChartData] = useState<ChartableItemType[]>([
        {key: "USDC-USDT", name: "USDC-USDT", value: 500, apy_24h: 0.},
        {key: "USDC-PAI", name: "USDC-PAI", value: 500, apy_24h: 0.},
    ])
    // Make sure types conform ...

    useEffect(() => {
        if (!selectedAssets) return;
        let sum = Array.from(selectedAssets.values()).reduce((sum: number, current: AllocData) => sum + current.weight, 0);
        setPieChartData((old: ChartableItemType[]) => {
                let out: ChartableItemType[] = [];
                selectedAssets.forEach((current: AllocData, key: string) => {
                    let tmp = {
                        key: key,
                        name: current.protocol.charAt(0).toUpperCase() + current.protocol.slice(1) + " " + current.lp,
                        value: ((100 * current.weight) / sum),
                        apy_24h: current.apy_24h,
                        pool: registry.getPoolFromSplStringId(current.lp),
                        allocationItem: current
                    }
                    out.push(tmp)
                });
                return out
            }
        )
    }, [selectedAssets]);

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

        let displayTokens: DisplayToken[] = displayTokensFromChartableAsset(item);

        let mintLP = new PublicKey(item.pool!.lpToken.address);

        console.log("item :", item.value);
        let theKey = Math.random() + item.value + index;
        console.log("new Key", theKey, "for index", index)

        // Should prob make the types equivalent. Should clean up all types in the front-end repo
        let tailwindOnSelected = "dark:bg-gray-800 hover:bg-gray-900";
        // TODO: Perhaps it's easier to just hardcode it ...
        // TODO: This shouldn't make any sense ... obviously the LP is not equivalent to the item name
        if (item.key === selectedAsset) {
            console.log("Matching indeed ...");
            tailwindOnSelected = "dark:bg-gray-900 hover:bg-gray-900";
        } else {
            console.log("Bullshit... not matching lol")
        }
        console.log("Item and selected asset are: ", item.name, selectedAsset);
        console.log("tailwindOnSelected is: ", tailwindOnSelected);

        // Get (the name for) the asset to be inputted ...
        let inputToken: SelectedToken = getInputToken(item.pool.tokens);
        let inputTokenLink: string = registry.getIconFromToken(inputToken.mint);

        return (
            <>
                {/* border-base-100 border-b */}
                <tr
                    key={theKey}
                    className={tailwindOnSelected}
                    onClick={() => {
                        setSelectedAsset((_: string) => {
                            console.log("Item is:", item.allocationItem);
                            console.log("About to set the selectedAsset to", item);
                            console.log("About to set the selectedAsset to", item.allocationItem);
                            return item.key;
                        });
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
                    <td className="py-4 px-6 text-sm text-center font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                        <a href={solscanLink(inputToken.mint)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-400 hover:underline">
                            <Image className={"rounded-3xl"} src={inputTokenLink} width={30} height={30}/>
                        </a>
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
                    <td className="py-4 px-6 text-sm text-center whitespace-nowrap">
                        {(item.apy_24h).toFixed(1)}%
                    </td>
                    {item.allocationItem &&
                        <td className="py-4 px-6 text-sm text-center whitespace-nowrap">
                            {/* inputToken.name */}
                            {item.allocationItem?.userInputAmount?.amount.uiAmount && (item.allocationItem?.userInputAmount?.amount.uiAmount).toFixed(2)}
                        </td>
                    }
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
                                <TableHeader columns={pieChartData ? tableColumns: tableColumns.slice(0, tableColumns.length - 1)} />
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
