import React from "react";
import type {AppProps} from "next/app";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "../styles/App.css";
import {RpcProvider} from "../contexts/RpcProvider";
import {LoadProvider} from "../contexts/LoadingContext";
import {ItemsLoadProvider} from "../contexts/ItemsLoadingContext";
import {LocalKeypairProvider} from "../contexts/LocalKeypairProvider";
import {CrankProvider} from "../contexts/CrankProvider";
import {SerpiusEndpointProvider} from "../contexts/SerpiusProvider";
import {UserWalletAssetsProvider} from "../contexts/UserWalletAssets";
import {ExistingPortfolioProvider} from "../contexts/ExistingPortfolioProvider";
import {ErrorMessageProvider} from "../contexts/ErrorMessageContext";
import * as qpools from "@qpools/sdk";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {Network} from "@saberhq/solana-contrib";
import {getConnection} from "../const";

function MyApp({Component, pageProps}: AppProps) {

    // Could just create the connection here ..
    const connection = getConnection();
    const registry = new qpools.helperClasses.Registry(connection);

    // Perhaps use-registry should be a hook ...

    let defaultNetwork: Network;
    if (qpools.network.getNetworkCluster() === qpools.network.Cluster.DEVNET) {
        defaultNetwork = "devnet";
    } else if (qpools.network.getNetworkCluster() === qpools.network.Cluster.MAINNET) {
        defaultNetwork = "mainnet-beta";
    } else {
        throw Error("Network not specified! " + String(qpools.network.getNetworkCluster()));
    }

    return (
        <>
            <LocalKeypairProvider>
                <ErrorMessageProvider>
                    <LoadProvider>
                        <ItemsLoadProvider>
                            <SerpiusEndpointProvider registry={registry}>
                                <WalletKitProvider
                                    defaultNetwork={defaultNetwork}
                                    app={{name: "qPools with Goki"}}
                                >
                                    <RpcProvider registry={registry}>
                                        <UserWalletAssetsProvider registry={registry}>
                                            <ExistingPortfolioProvider registry={registry}>
                                                <CrankProvider>
                                                    <Component {...pageProps}/>
                                                </CrankProvider>
                                            </ExistingPortfolioProvider>
                                        </UserWalletAssetsProvider>
                                    </RpcProvider>
                                </WalletKitProvider>
                            </SerpiusEndpointProvider>
                        </ItemsLoadProvider>
                    </LoadProvider>
                </ErrorMessageProvider>
            </LocalKeypairProvider>
        </>
    );
}

export default MyApp;
