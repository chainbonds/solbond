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
            margin: "auto"
        }}>
        <OnramperWidget
            defaultAmount={50}
            defaultFiat = "USD"
            defaultAddrs={getWalletAddress()}
            API_KEY="pk_test_eu92eCNlBbOhGlyQ3qOojn9ELvZMHkoVqtTZxAknRlE0"
            filters={{
                onlyCryptos: ["USDC_SOL"]
            }}

        />
        </div>
        </>
    )

}