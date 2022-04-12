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
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {Network} from "@saberhq/solana-contrib";
import {getConnection} from "../const";
import {network} from "@qpools/sdk/src";
import {Registry} from "@qpools/sdk/src/frontend-friendly";

function MyApp({Component: MyComponent, pageProps}: AppProps) {

    // Could just create the connection here ..
    const connection = getConnection();
    const registry = new Registry(connection);

    // Perhaps use-registry should be a hook ...

    let defaultNetwork: Network;
    if (network.getNetworkCluster() === network.Cluster.DEVNET) {
        defaultNetwork = "devnet";
    } else if (network.getNetworkCluster() === network.Cluster.MAINNET) {
        defaultNetwork = "mainnet-beta";
    } else {
        throw Error("Network not specified! " + String(network.getNetworkCluster()));
    }

    pageProps = {registry: registry, ...pageProps};

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
                                                    <MyComponent {...pageProps} />
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
