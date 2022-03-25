import {BRAND_COLORS} from "../../const";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import React from "react";

export default function ConnectWalletButton() {

    return (
        <WalletMultiButton
            style={{
                background: "#be185d",  // BRAND_COLORS.slate900,
                // color: "white",
                // width: 150 + connected,
                // borderStyle: "solid",
                // borderWidth: 0.1,
                // borderColor: "#6b7280"
                // borderColor: "#be185d"
            }}
        />
    )

}
