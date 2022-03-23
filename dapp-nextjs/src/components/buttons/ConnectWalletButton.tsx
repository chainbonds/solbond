import {BRAND_COLORS} from "../../const";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {useWallet} from '@solana/wallet-adapter-react';
import React, {useEffect, useState} from "react";

export default function ConnectWalletButton() {

    const walletContext: any = useWallet();
    // TODO: This is incredibly weird logic. Should improve this
    const [connected, setConnected] = useState<number>(0);

    useEffect(() => {
        if (walletContext.publicKey) {
            setConnected(20)
        }
    }, [walletContext.publicKey]);

    return (
        <WalletMultiButton
            style={{
                background: BRAND_COLORS.slate900,
                color: "white",
                width: 150 + connected,
                borderStyle: "solid",
                borderWidth: 0.3,
                borderColor: "#6b7280"
            }}
        />
    )

}