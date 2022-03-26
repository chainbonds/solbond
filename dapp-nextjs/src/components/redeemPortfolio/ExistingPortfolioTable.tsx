import React from "react";
import {displayTokensFromPositionInfo, shortenedAddressString, solscanLink} from "../../utils/utils";
import Image from "next/image";
import {PositionInfo} from "@qpools/sdk";
import {DisplayToken} from "../../types/DisplayToken";
import {IExistingPortfolio, useExistingPortfolio} from "../../contexts/ExistingPortfolioProvider";
import TableHeader from "../common/TableHeader";

interface Props {
    tableColumns: (string | null)[],
}
export default function ExistingPortfolioTable({tableColumns}: Props) {

    const existingPortfolioProvider: IExistingPortfolio = useExistingPortfolio();

    const tableSingleRow = (position: PositionInfo) => {
        if (position.amountLp && !position.amountLp.uiAmount && (position.amountLp.uiAmount != 0)) {
            return <></>
        }

        // TODO: Should prob merge the stuff from Ahmet ...

        console.log("mintLP is: ", position.mintLp);
        console.log("mintA is: ", position.mintA);
        console.log("mintB is: ", position.mintB);

        // TODO: I guess depending on staking, and borrow & lending, gotta display the mint-token or the underlying tokens
        let displayTokens: DisplayToken[] = displayTokensFromPositionInfo(position);

        console.log("Icon A Icon B ", displayTokens);
        console.log("Printing the position to be printed now: ", position);

        return (
            <>
                <tr className="dark:bg-gray-800">
                    {/* Show the icons next to this ... */}
                    <td className="py-4 px-6 text-center text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {position.mintLp &&
                        <a href={solscanLink(position.mintLp)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-500 hover:underline">
                            {shortenedAddressString(position.mintLp)}
                        </a>
                        }
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                        {displayTokens.map((displayToken: DisplayToken) => {
                            return (
                                <a href={displayToken.tokenSolscanLink} target={"_blank"} rel="noreferrer"
                                   className="text-blue-600 dark:text-blue-400 hover:underline">
                                    <Image src={displayToken.tokenImageLink} width={30} height={30}/>
                                </a>
                            )
                        })}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                        {position.totalPositionValue && position.totalPositionValue.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-right whitespace-nowrap">
                        {position.ataLp &&
                        <a href={solscanLink(position.ataLp)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-500 hover:underline">See on Solscan</a>
                        }
                    </td>
                </tr>
            </>
        )
    }

    return (
        <>
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block pb-2 min-w-full">
                        <div className="overflow-hidden sm:rounded-lg">
                            <table className="min-w-full">
                                <TableHeader columns={tableColumns} />
                                <tbody>
                                {existingPortfolioProvider.positionInfos.map((position: PositionInfo) => tableSingleRow(position))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}