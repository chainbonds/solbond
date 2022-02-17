import React, {useEffect, useState} from "react";
import Image from "next/image";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {AllocateParams, PublicKey, TokenAmount} from "@solana/web3.js";
import ConnectWalletPortfolioRow from "./ConnectWalletPortfolioRow";
import PortfolioDiagram from "./DetailedDiagram";
import {PositionAccount} from "../../../../../qPools-contract/qpools-sdk/src/types/positionAccount";

export interface UsdValuePosition {
    totalPositionValue: number,
    usdValueA: number,
    usdValueB: number,
    usdValueLp: number,
};

export default function SinglePortfolioCard(props: any) {

    interface AccountOutput {
        index: number,
        poolAddress: PublicKey,
        owner: PublicKey,
        // portfolio: PublicKey,
        positionPda: PublicKey,
        mintA: PublicKey,
        ataA: PublicKey,
        amountA: TokenAmount,
        mintB: PublicKey,
        ataB: PublicKey,
        amountB: TokenAmount,
        mintLp: PublicKey,
        ataLp: PublicKey,
        amountLp: TokenAmount,
    };

    const qPoolContext: IQPool = useQPoolUserTool();
    const [pnlPercent, setPnlPercent] = useState<number>(-5.);
    const [allocatedAccounts, setAllocatedAccounts] = useState<AccountOutput[]>([]);
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);
    const [positionValuesInUsd, setPositionValuesInUsd] = useState<UsdValuePosition[]>([]);

    useEffect(() => {
        setPnlPercent(props.value)
    }, []);

    // Calculate all usdc values
    const calculateAllUsdcValues = async () => {
        let usdcResponses: UsdValuePosition[] = await Promise.all(allocatedAccounts.map(async (position: AccountOutput) => {
            return getUserUsdcForPosition(position);
        }));
        setPositionValuesInUsd(usdcResponses);
        let totalPortfolioValue = 0.;
        usdcResponses.map((x) => {
            totalPortfolioValue += x.totalPositionValue;
        })
        setTotalPortfolioValueUsd(totalPortfolioValue);
    }

    useEffect(() => {
        calculateAllUsdcValues();
    }, [allocatedAccounts]);

    // Get all the accounts from the

    const getPortfolioInformation = async () => {

        if (
            !qPoolContext.connection ||
            !qPoolContext.userAccount ||
            !qPoolContext.portfolioObject ||
            !qPoolContext.portfolioObject ||
            !qPoolContext.qPoolsUser
        ) {
            console.log("Portfolio Object not loaded yet! Gotta make sure to load it first ...")
        }

        // let [portfolioPDA, _] = await PublicKey.findProgramAddress(
        //     [this.owner.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode(SEED.PORTFOLIO_ACCOUNT))],
        //     this.solbondProgram.programId
        // );

        let portfolio = await qPoolContext.portfolioObject!.fetchPortfolio();
        let positions = await qPoolContext.portfolioObject!.fetchAllPositions();

        let allAmounts = await Promise.all(positions.map(async (position: PositionAccount, index: number): Promise<AccountOutput> => {
            // Get all the positions (perhaps combine this in a single get statement at some point
            let tokenAAmount = (await qPoolContext.connection!.getTokenAccountBalance(position.ownerTokenAccountA)).value;
            let tokenBAmount = (await qPoolContext.connection!.getTokenAccountBalance(position.ownerTokenAccountB)).value;
            let tokenLPAmount = (await qPoolContext.connection!.getTokenAccountBalance(position.ownerTokenAccountLp)).value;

            // Also add pool address to this
            // Perhaps also get the stableswap state ? Probably cleaner if we get this in retrospect

            return {
                index: index,
                poolAddress: qPoolContext.portfolioObject!.poolAddresses[index],
                owner: position.owner,
                // portfolio: portfolioPDA,
                positionPda: position.poolPda,
                mintA: position.mintA,
                ataA: position.ownerTokenAccountA,
                amountA: tokenAAmount,
                mintB: position.mintB,
                ataB: position.ownerTokenAccountB,
                amountB: tokenBAmount,
                mintLp: position.mintLp,
                ataLp: position.ownerTokenAccountLp,
                amountLp: tokenLPAmount
            }

        }));

        console.log("All fetched data is: ");
        allAmounts = allAmounts.sort((a: AccountOutput, b: AccountOutput) => {
            return Number(a.ataLp.toBytes());
        })
        console.log("All elements are: ");
        allAmounts.forEach((x: any) => {
            console.log(x);
        });

        setAllocatedAccounts(allAmounts);

        // Calculate total sum of items
        // From all accounts except the LP accounts, Collect the amounts
        let usdAmount = 0.;
        allAmounts.map((position) => {
            // If object is null, then skip!
            usdAmount += position.amountA.uiAmount!;
            usdAmount += position.amountB.uiAmount!;

            // Find a way to convert the LP amount to the real amount!
            // position.amountLp

        });
    };


    /**
     * Right now, this is a very approximate value
     * I would assume that the true function is a bit more involved.
     */
    const getUserUsdcForPosition = async (position: AccountOutput): Promise<UsdValuePosition> => {

        // Get the pool
        console.log("Pool addresses are: ", qPoolContext.portfolioObject!.poolAddresses);
        // Get the pool account
        console.log("Pool account is: ", position.poolAddress);
        // For the saber stableswap, get the stableswap states
        const stableSwapState = await qPoolContext.portfolioObject!.getPoolState(position.poolAddress);
        const {state} = stableSwapState;

        // Get Reserve A
        console.log("Token account address is: ", state.tokenA.reserve);
        let amountReserveA = (await qPoolContext.connection!.getTokenAccountBalance(state.tokenA.reserve)).value.uiAmount;
        // Get Reserve B
        console.log("Token account address is: ", state.tokenA.reserve);
        let amountReserveB = (await qPoolContext.connection!.getTokenAccountBalance(state.tokenB.reserve)).value.uiAmount;

        if (!amountReserveA || !amountReserveB) {
            throw Error("One of the reserve values is null!" + String(amountReserveA) + " " +  String(amountReserveB));
        }
        // Convert Reserve A to it's USD value
        // Convert Reserve B to it's USD value
        // Convert to the USD currency (We can skip this step because we focus on USD stablecoins for now..)

        // Add these up, to get an idea of how much total value is in the pool
        let poolContentsInUsdc = amountReserveA + amountReserveB;

        // Now, get the total LP supply
        // Get total LP supply
        let supplyLpToken = (await qPoolContext.connection!.getTokenSupply(state.poolTokenMint)).value.uiAmount;
        // Get guys' LP tokens
        let amountUserLp = position.amountLp.uiAmount;

        if (!supplyLpToken) {
            throw Error("One of the LP information values is null or zero!" + String(supplyLpToken));
        }
        // This case is totall fine, actually
        if ((!amountUserLp) && ((amountUserLp != 0))) {
            throw Error("One of the LP information values is null or zero!" + String(amountUserLp));
        }

        // Calculate the exchange rate between lp tokens, and the total reserve values
        let exchangeRate = poolContentsInUsdc / supplyLpToken;
        let usdValueUserLp = amountUserLp * exchangeRate;
        console.log("User portfolio value is: ", usdValueUserLp);

        // Also add the individual tokens held by that portfolio ...
        // Finally, get the user's reserves
        // Get Reserve A
        console.log("Token account address is: ", state.tokenA.reserve);
        let amountUserA = position.amountA.uiAmount;
        // Get Reserve B
        console.log("Token account address is: ", state.tokenB.reserve);
        let amountUserB = position.amountB.uiAmount;

        if ((!amountUserA && amountUserA != 0) || (!amountUserB && amountUserB != 0)) {
            throw Error("One of the reserve values is null!" + String(amountUserA) + " " +  String(amountUserB));
        }

        // Also convert here to USD,
        let usdValueUserA = amountUserA;
        let usdValueUserB = amountUserB;

        // We can skip this step, bcs again, we only use stablecoins for now
        let userPositionValue = usdValueUserA + usdValueUserB + usdValueUserLp;

        // Pick the one address, where the LP corresponds to
        // Get the exchange rate of LP per USD Value
        // Multiply guys' LP tokens by exchange rate

        // TODO: Maybe also add information on the title of the pool, etc.
        let out: UsdValuePosition = {
            totalPositionValue: userPositionValue,
            usdValueA: amountUserA,
            usdValueB: amountUserB,
            usdValueLp: usdValueUserLp
        };
        return out;
    }


    useEffect(() => {
        getPortfolioInformation();
    }, [qPoolContext.userAccount]);

    const displayReturn = () => {

        if (pnlPercent >= 0.) {
            return (
                <div className={"flex w-full mx-auto px-auto justify-end text-green-500"}>
                    + {pnlPercent} %
                </div>
            );
        } else {
            return (
                <div className={"flex w-full mx-auto px-auto justify-end text-red-500"}>
                    - {-1. * pnlPercent} %
                </div>
            );
        }
    }

    const displaySinglePosition = (position: AccountOutput) => {
        if (!position) {
            console.log("Not ready to load just yet..");
            return (
                <></>
            )
        }
        if (positionValuesInUsd.length != allocatedAccounts.length) {
            console.log("Lengths do not confirm!");
            return (
                <></>
            )
        }

        // Check which one is the Currency-mint, and based on that, print better strings
        return (
            <div className="p-6">
                <h5 className="text-gray-900 text-xl font-medium mb-2">
                    Portfolio Value is: {positionValuesInUsd[position.index].totalPositionValue}
                </h5>
                <p className="text-gray-700 text-base mb-1">
                    LP Token <a href={solscanLink(position.ataLp)} target={"_blank"}>{shortenedAddressString(position.mintLp)}</a> {position.amountLp.uiAmountString}
                </p>
                <p className="text-gray-700 text-base">
                    Token A <a href={solscanLink(position.ataA)} target={"_blank"}>{shortenedAddressString(position.mintA)}</a> {position.amountA.uiAmountString}
                </p>
                <p className="text-gray-700 text-base mb-1">
                    Token B <a href={solscanLink(position.ataB)} target={"_blank"}>{shortenedAddressString(position.mintB)}</a> {position.amountB.uiAmountString}
                </p>
                {/* Redeem button could go here? */}
            </div>
        )
    }

    const shortenedAddressString = (_address: PublicKey) => {
        let address: string = _address.toString();
        if (address.length < 6) {
            return address
        }
        let out: string = address.substring(0, 3);
        out += "..";
        out += address.substring(address.length - 3, address.length);
        return out;
    }
    const solscanLink = (address: PublicKey) => {
        let out = "https://solscan.io/account/";
        out += address.toString();
        out += "?cluster=devnet";
        return out;
    }

    const displaySinglePortfolio = (i: number) => {
        console.log("Displaying allocated Accounts: ", allocatedAccounts);
        if (allocatedAccounts.length === 0) {
            return (
                <ConnectWalletPortfolioRow
                    text={"You have not created any positions yet!"}
                />
            );
        } else {
            return (
                <div className="flex items-center justify-center w-full h-full">

                    <div className="block rounded-lg shadow-lg bg-white max-w-sm text-center">
                        <div className="py-3 px-6 border-b border-gray-300 text-gray-900 text-xl font-medium mb-2">
                            Portfolio #{i} ${totalPortfolioValueInUsd}
                        </div>

                        <PortfolioDiagram
                            values={positionValuesInUsd}
                        />

                        {/* Display all positions now ... */}
                        {allocatedAccounts.map((position) => {
                            console.log("Displaying position", position);
                            return displaySinglePosition(position)
                        })}
                        <div className="py-3 px-6 border-t border-gray-300 text-gray-600">
                            <button type="button" className=" inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
                                Redeem back to USDC
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <>
            {/*
                Working on a row with two elements
            */}


            <div className="flex items-center justify-center w-full h-full">

                {displaySinglePortfolio(0)}

                {/*<div className="relative text-gray-400 focus-within:text-gray-400 w-full h-full">*/}
                {/*    <div className="flex rounded-lg w-full bg-gray-900 items-end text-right h-14 p-4">*/}
                {/*        /!* Two elements here again? One front, one end*!/*/}
                {/*        <div className={"flex w-full mx-auto px-auto justify-start"}>*/}
                {/*            {props.address}*/}
                {/*        </div>*/}
                {/*        <div className={"flex w-full mx-auto px-auto justify-center"}>*/}
                {/*            {props.time}*/}
                {/*        </div>*/}
                {/*        {displayReturn()}*/}
                {/*        /!*<div className={"flex w-full mx-auto px-auto justify-end text-green-500"}>*!/*/}
                {/*        /!*    {props.value}*!/*/}
                {/*        /!*</div>*!/*/}
                {/*        /!*<div className={"flex flex-row w-full items-end"}>*!/*/}
                {/*        /!*    {props.value}*!/*/}
                {/*        /!*</div>*!/*/}
                {/*    </div>*/}
                {/*</div>*/}

            </div>
        </>
    );
}
