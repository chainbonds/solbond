import {BRAND_COLORS} from "../../const";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";

export default function ConnectWalletButton() {

    return (<WalletMultiButton
        style={{
            background: BRAND_COLORS.slate900,
            color: "white",
            width: 150,
            borderStyle : "solid",
            borderWidth : 0.3,
            borderColor : "#6b7280"
        }}
        onClick={() => {
            console.log("click");
        }}
    />)

}