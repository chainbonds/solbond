import React, {useMemo} from "react";
import type {AppProps} from "next/app";
// import dynamic from "next/dynamic";
// import {ConnectionProvider} from "@solana/wallet-adapter-react";
import {clusterApiUrl} from "@solana/web3.js";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
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

const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;

function MyApp({Component, pageProps}: AppProps) {
    const registry = new qpools.helperClasses.Registry();

    return (
        <LocalKeypairProvider>
            <ErrorMessageProvider>
                <LoadProvider>
                    <ItemsLoadProvider>
                        <SerpiusEndpointProvider registry={registry}>
                            <WalletKitProvider
                                defaultNetwork="devnet"
                                app={{name: "qPools with Goki"}}
                            >
                                <RpcProvider registry={registry}>
                                    <UserWalletAssetsProvider registry={registry}>
                                        <ExistingPortfolioProvider registry={registry}>
                                            <CrankProvider>
                                                <Component {...pageProps} registry={registry} />
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
    );
}

export default MyApp;
