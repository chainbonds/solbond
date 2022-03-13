import { JupiterProvider } from "@jup-ag/react-hook";
import { useWallet, ConnectionProvider } from "@solana/wallet-adapter-react";
import {clusterApiUrl, Connection } from "@solana/web3.js";
import {useEffect, useState } from "react";
import {IQPool, useQPoolUserTool } from "./QPoolsProvider";

const JupiterApp = ({ children }: any) => {

    const qPoolContext: IQPool = useQPoolUserTool();
    const wallet = useWallet();

    const [connection, setConnection] = useState<Connection>(new Connection(clusterApiUrl("devnet")));

    return (
        <JupiterProvider
            cluster="devnet"
            connection={connection}
            userPublicKey={wallet.publicKey || undefined}
        >
            {children}
        </JupiterProvider>
    );

};
export default JupiterApp;