import OnramperWidget from "@onramper/widget";
import {useWallet} from '@solana/wallet-adapter-react';


export default function Onramper() {

    const walletContext: any = useWallet();

    const getWalletAddress = () => {
        if (walletContext.publicKey) {
            return({
                USDC_SOL: { address: walletContext.publicKey.toString() }
            })}
        else{
                return({
                    USDC_SOL: { address: ""}
                })
            }
    }
    
    return (
        <>
        <div
        style={{
            width: "440px",
            height: "595px",
            boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            margin: "auto",
            fontFamily: "Roboto sans-serif",
            color: "black"
        }} className={"z-0"}>

        <OnramperWidget
            defaultAmount={50}
            defaultFiat = "USD"
            defaultAddrs={""}
            API_KEY="pk_prod_JEwfnwPsVPy6gOeHuV3xxjdQesmGvdKHObbWwzGlak40"
            filters={{
                onlyCryptos: ["USDC_SOL"]
            }}
        />
        </div>
        </>
    )

}