import React, {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import Image from "next/image";
import {PositionInfo, registry} from "@qpools/sdk";
import {useWallet} from "@solana/wallet-adapter-react";

const tableColumns: (string | null)[] = ["Asset", "Allocation", "Amount", "24H APY"]

export default function ExistingPortfolioTable() {

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
                                    className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
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


    const tableSingleRow = (position: PositionInfo) => {
        if (!position.amountLp.uiAmount && (position.amountLp.uiAmount != 0)) {
            return <></>
        }

        // Get the icon from the registry
        let iconMintA = registry.getIconFromToken(position.mintA);
        let iconMintB = registry.getIconFromToken(position.mintB);

        return (
            <>
                <tr className="dark:bg-gray-800">
                    {/* Show the icons next to this ... */}
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {shortenedAddressString(position.mintLp)}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                        <a href={solscanLink(position.mintA)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-400 hover:underline">
                            <Image src={iconMintA} width={30} height={30} />
                        </a>
                        <a href={solscanLink(position.mintB)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-400 hover:underline">
                            <Image src={iconMintB} width={30} height={30} />
                        </a>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                        {position.amountLp.uiAmount!.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                        <a href={solscanLink(position.ataLp)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-500 hover:underline">See on Solscan</a>
                    </td>
                </tr>
            </>
        )
    }


    return (
        <>
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block pb-2 min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-md sm:rounded-lg">
                            <table className="min-w-full">
                                {tableHeader(tableColumns)}
                                <tbody>
                                    {qPoolContext.positionInfos.map((position: PositionInfo) => tableSingleRow(position))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}