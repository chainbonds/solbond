import React, {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import Image from "next/image";
import {PositionInfo, registry} from "@qpools/sdk";
import {useWallet} from "@solana/wallet-adapter-react";
import {PublicKey} from "@solana/web3.js";

const tableColumns: (string | null)[] = ["Pool", "Assets", "USDC Value", null]

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
                                    className="py-3 px-6 text-center text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
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
        let iconMintA = "https://spl-token-icons.static-assets.ship.capital/icons/101/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png";
        let iconMintB = "https://spl-token-icons.static-assets.ship.capital/icons/101/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png";
        if (position.mintA.equals(new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"))){
            iconMintA = "https://spl-token-icons.static-assets.ship.capital/icons/101/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png";
            iconMintB = "https://spl-token-icons.static-assets.ship.capital/icons/101/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png";
        } else {
            iconMintA = registry.getIconFromToken(position.mintA);
            iconMintB = registry.getIconFromToken(position.mintB);
        }
        // let iconMintA = registry.getIconFromToken(position.mintA);
        // let iconMintB = registry.getIconFromToken(position.mintB);
        console.log("Icon A Icon B ", iconMintA, iconMintB)

        return (
            <>
                <tr className="dark:bg-gray-800">
                    {/* Show the icons next to this ... */}
                    <td className="py-4 px-6 text-center text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <a href={solscanLink(position.mintLp)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-500 hover:underline">
                            {/*{registry.getPool(position.poolAddress)?.name}*/}
                            {shortenedAddressString(position.mintLp)}
                            {/* TODO: Change to registry name perhaps    */}
                        </a>
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                        <a href={solscanLink(position.mintA)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-400 hover:underline">
                            <Image src={iconMintA} width={30} height={30} />
                        </a>
                        <a href={solscanLink(position.mintB)} target={"_blank"} rel="noreferrer"
                           className="text-blue-600 dark:text-blue-400 hover:underline">
                            <Image src={iconMintB} width={30} height={30} />
                        </a>
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-gray-500 whitespace-nowrap dark:text-gray-400">
                        {position.amountLp.uiAmount!.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-right whitespace-nowrap">
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
                <div className="overflow-x-auto">
                    <div className="inline-block pb-2 min-w-full">
                        <div className="overflow-hidden sm:rounded-lg">
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
