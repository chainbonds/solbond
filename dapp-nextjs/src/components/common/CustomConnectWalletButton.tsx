import {BRAND_COLORS} from "../../const";
// import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import React from "react";
import {ConnectWalletButton} from "@gokiprotocol/walletkit";

interface Props {}
export default function CustomConnectWalletButton({}: Props) {

    return (
        <>
            <ConnectWalletButton
                //     style={{
                //         background: BRAND_COLORS.pink700,
                //         // color: "white",
                //         // width: 150 + connected,
                //         // borderStyle: "solid",
                //         // borderWidth: 0.1,
                //         // borderColor: "#6b7280"
                //         // borderColor: "#be185d"
                //     }}
            />
        </>
    )

}
