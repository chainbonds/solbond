import {BRAND_COLORS} from "../../../const";
import Image from "next/image";

interface Props {
    min: number,
    max: number,
    value: number,
    onChange: (arg0: any) => any,  // Some function, takes in an event as input
    logoPath: string,
    name: string,
    loading: boolean,
    errorMessage: string,
    totalBalance: string,
    maxBalance: string,
}

export default function TokenValueInputField({
                                                 min,
                                                 max,
                                                 value,
                                                 onChange,
                                                 logoPath,
                                                 name,
                                                 loading,
                                                 errorMessage,
                                                 totalBalance,
                                                 maxBalance
                                             }: Props) {

    return (
        <>
            <div className="flex flex-col form-control w-full">
                <div className="mx-auto my-auto p-1 relative text-gray-300 focus-within:text-gray-300 w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 h-full">
                    <div className={"flex w-full my-auto text-center content-center"}>
                        {logoPath && <Image alt={name} src={logoPath} height={34} width={34} className={"rounded-3xl"}/>}
                        <text className={"my-auto text-center content-center mx-2"}>{name}</text>
                    </div>
                    </span>
                    <input
                        className="rounded-lg w-full items-end text-right h-12 p-4"
                        style={{backgroundColor: BRAND_COLORS.slate700}}
                        type="number"
                        id="stake_amount"
                        autoComplete="stake_amount"
                        placeholder="0.0"
                        step={"0.001"}
                        min={min}
                        max={max}
                        value={value}
                        onChange={onChange}
                    />
                </div>
                <div className={"flex flex-col"}>
                    <div className={"items-start justify-start"}>
                        {!loading ?
                            (
                                <div className={"text-gray-500 text-sm font-semibold items-start justify-start"}>
                                    Planning to deposit: {
                                    // (totalInputBalance)?.toFixed(Math.min(8, allocationItems.get(selectedItemKey)?.userWalletAmount?.amount.decimals!))
                                    totalBalance
                                } out of {
                                    maxBalance
                                } {name} in Your Wallet
                                </div>
                            ) : (
                                <div className={"text-gray-500 text-sm font-semibold items-start justify-start"}>
                                    Wallet Loading ...
                                </div>
                            )
                        }
                    </div>
                    <div className={"text-red-500 text-sm font-bold"}>
                        {errorMessage && errorMessage}
                        {!errorMessage && <span>&nbsp;</span>}
                    </div>
                </div>
            </div>
        </>
    );

}
