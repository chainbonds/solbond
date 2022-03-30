
interface Props {
    currencyName: string,
    currencyBalance: number | null
}
export default function UserInfoBalance({currencyName, currencyBalance}: Props) {

    // If the currency mint is wrapped SOL, also add the SOL amount to this ... 8
    // or actually, just take the SOL amount directly ...
    // Perhaps also display the wrapped SOL + SOL, if the key is the wrapped SOL key ...
    if (!currencyBalance) {
        return <></>
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
