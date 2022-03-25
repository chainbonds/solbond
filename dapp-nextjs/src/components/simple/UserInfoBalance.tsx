import {PublicKey} from "@solana/web3.js";
import {registry} from "@qpools/sdk";

interface Props {
    currencyMint: PublicKey,
    currencyName: string,
    currencyBalance: number | null,
    solBalance: number | null
}
export default function UserInfoBalance({currencyMint, currencyName, currencyBalance, solBalance}: Props) {

    // If the currency mint is wrapped SOL, also add the SOL amount to this ... 8
    // or actually, just take the SOL amount directly ...
    // Perhaps also display the wrapped SOL + SOL, if the key is the wrapped SOL key ...
    if (!currencyBalance) {
        return <></>
    }

    if (currencyMint.equals(registry.getWrappedSolMint()) && solBalance) {
        return (
            <>
                <div
                    className={"flex flex-col md:flex-row items-center lg:items-begin text-gray-500 text-sm font-semibold "}>
                    <div>
                        Wallet Balance: {currencyBalance.toFixed(2)} {currencyName}
                    </div>
                    <div>
                        SOL Balance: {solBalance.toFixed(2)}
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <div
                className={"flex flex-col md:flex-row items-center lg:items-begin text-gray-500 text-sm font-semibold "}>
                Wallet Balance: {currencyBalance.toFixed(2)} {currencyName}
            </div>
        </>
    )

}
