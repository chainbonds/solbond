import {useEffect, useState} from "react";
import {PublicKey} from "@solana/web3.js";

interface Props {
    currencyMint: PublicKey,
    balance: number | null,
    solBalance: number | null
}
export default function UserInfoBalance({currencyMint, balance, solBalance}: Props) {

    const [currencyBalance, setCurrencyBalance] = useState<number>(0.);

    // If the currency mint is wrapped SOL, also add the SOL amount to this ... 8
    // or actually, just take the SOL amount directly ...
    useEffect(() => {
        if (balance && currencyMint) {
            if (
                currencyMint.equals(new PublicKey("So11111111111111111111111111111111111111112")) && solBalance
            ) {
                setCurrencyBalance(solBalance);
            } else {
                setCurrencyBalance(balance)
            }
        }
    }, [currencyMint, balance]);

    if (!currencyBalance) {
        return <></>
    }

    return (
        <>
            <div
                className={"flex flex-col md:flex-row items-center lg:items-begin text-gray-500 text-sm font-semibold "}>
                {/*Wallet Balance: {currencyBalance.toFixed(2)} USDC*/}
                Wallet Balance: {currencyBalance.toFixed(2)} USDC
            </div>
        </>
    )

}
