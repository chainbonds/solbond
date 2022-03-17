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


export default function TableSingleRow(props :any)  {


    // Also add colors to the other portoflio ...
    let color = COLORS[props.index % COLORS.length];

    // I guess we need the rich data ...
    console.log("THEREEEEEEEE", props.item.pool)
    // Gotta make the switch manually here ...
    if (!props.item.pool) {
        return (
            <></>
        )
    }

    console.log("HEREEEEEEEE")

    // Gotta make sure it's fine
    let mintA = new PublicKey(props.item.pool!.tokens[0].address);
    let mintB = new PublicKey(props.item.pool!.tokens.length > 1 ? props.item.pool!.tokens[1].address : props.item.pool!.tokens[0].address);
    let mintLP = new PublicKey(props.item.pool!.lpToken.address);

    // Get the icon from the registry
    // let iconMintA = registry.getIconFromToken(mintA);
    // let iconMintB = registry.getIconFromToken(mintB);
    let iconMintA = "https://spl-token-icons.static-assets.ship.capital/icons/101/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png";
    let iconMintB = "https://spl-token-icons.static-assets.ship.capital/icons/101/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png";
    if (mintA.equals(new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"))){
        iconMintA = "https://spl-token-icons.static-assets.ship.capital/icons/101/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png";
        iconMintB = "https://spl-token-icons.static-assets.ship.capital/icons/101/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png";
    } else {
        console.log("mint a and b are: 3", mintA.toString(), mintB.toString());
        iconMintA = registry.getIconFromToken(mintA);
        iconMintB = registry.getIconFromToken(mintB);
    }
    console.log("Icon A Icon B 3 ", iconMintA, iconMintB)


    console.log("iconmint A ", iconMintA)
    console.log("iconmint B ", iconMintB)
    console.log("mintA ", mintA)
    console.log("mintB", mintB)
    console.log("mintLP", mintLP)

    let style = {backgroundColor: color};

    return (
        <>
            <tr className="dark:bg-gray-800">
                {/* Show the icons next to this ... */}
                <td className="py-4 px-6 text-sm text--center font-normal text-gray-900 whitespace-nowrap dark:text-white">
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
                        {props.item.name}
                    </a>
                </td>
                <td className="py-4 px-6 text-sm text-center font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                    <a href={solscanLink(mintA)} target={"_blank"} rel="noreferrer"
                       className="text-blue-600 dark:text-blue-400 hover:underline mr-1">
                        <Image src={iconMintA} width={30} height={30} />
                    </a>
                    <a href={solscanLink(mintB)} target={"_blank"} rel="noreferrer"
                       className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                        <Image src={iconMintB} width={30} height={30} />
                    </a>
                </td>
                <td className="py-4 px-6 text-sm text-center font-normal  whitespace-nowrap dark:text-gray-400">
                    {props.item.value.toFixed(0)}%
                </td>
                <td className="py-4 px-6 text-sm text-center text-right whitespace-nowrap">
                    {(props.item.apy_24h).toFixed(1)}%
                </td>
                {/*<td className="py-4 px-6 text-sm text-right whitespace-nowrap">*/}
                {/*    ${(0.01 * row.value * totalAmountInUsdc).toFixed(2)}*/}
                {/*</td>*/}
            </tr>
        </>
    )
}
