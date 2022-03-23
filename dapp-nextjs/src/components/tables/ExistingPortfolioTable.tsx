import React, {useEffect} from "react";
import {shortenedAddressString, solscanLink} from "../../utils/utils";
import Image from "next/image";
import {PositionInfo, ProtocolType, registry} from "@qpools/sdk";
import {useWallet} from "@solana/wallet-adapter-react";
import {DisplayToken} from "../../types/DisplayToken";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {IExistingPortfolio, useExistingPortfolio} from "../../contexts/ExistingPortfolioProvider";

const tableColumns: (string | null)[] = ["Pool", "Assets", "USDC Value", null]

export default function ExistingPortfolioTable() {

    // Perhaps create a "Loaded Portfolio Component"
    const rpcProvider: IRpcProvider = useRpc();
    const walletContext: any = useWallet();
    const existingPortfolioProvider: IExistingPortfolio = useExistingPortfolio();

    useEffect(() => {
        if (walletContext.publicKey) {
            console.log("Wallet pubkey wallet is:", walletContext.publicKey.toString());
            // TODO: Just gotta load the wallet, and re-initialize anytime the wallet-context is changing ...
            rpcProvider.initializeQPoolsUserTool(walletContext);
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
        if (position.amountLp && !position.amountLp.uiAmount && (position.amountLp.uiAmount != 0)) {
            return <></>
        }

        // TODO: Should prob merge the stuff from Ahmet ...

        console.log("mintLP is: ", position.mintLp);
        console.log("mintA is: ", position.mintA);
        console.log("mintB is: ", position.mintB);

        // TODO: I guess depending on staking, and borrow & lending, gotta display the mint-token or the underlying tokens
        let displayTokens: DisplayToken[] = [];
        if (position.protocolType === ProtocolType.DEXLP) {
            let displayTokenItemA: DisplayToken = {
                tokenImageLink: registry.getIconFromToken(position.mintA),
                tokenSolscanLink: solscanLink(position.mintA)
            };
            displayTokens.push(displayTokenItemA);
            let displayTokenItemB: DisplayToken = {
                tokenImageLink: registry.getIconFromToken(position.mintB),
                tokenSolscanLink: solscanLink(position.mintB)
            };
            displayTokens.push(displayTokenItemB);
        } else if (position.protocolType === ProtocolType.Staking) {
            let displayTokenItem: DisplayToken = {
                tokenImageLink: registry.getIconFromToken(position.mintLp),
                tokenSolscanLink: solscanLink(position.mintLp)
            };
            displayTokens.push(displayTokenItem);
        } else if (position.protocolType === ProtocolType.Lending) {
            throw Error("Where does lending come from? We haven't even implement anything in this direction!" + JSON.stringify(position));
        } else {
            throw Error("Type of borrow lending not found" + JSON.stringify(position));
        }

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
                                {tableHeader(tableColumns)}
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
