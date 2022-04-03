import React, {useMemo} from "react";
import type {AppProps} from "next/app";
import dynamic from "next/dynamic";
import {ConnectionProvider} from "@solana/wallet-adapter-react";
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
import {Registry} from "../../../../qPools-contract/qpools-sdk";

const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;
const network = SOLANA_NETWORK;

const WalletProvider = dynamic(
    () => import("../contexts/ClientWalletProvider"),
    {
        ssr: false,
    }
);

function MyApp({Component, pageProps}: AppProps) {
    const endpoint = useMemo(() => clusterApiUrl(network), []);
    const registry = new Registry();

    return (
        <LocalKeypairProvider>
            <ErrorMessageProvider>
                <LoadProvider>
                    <ItemsLoadProvider>
                        <SerpiusEndpointProvider registry={registry}>
                            <ConnectionProvider endpoint={endpoint}>
                                <WalletProvider>
                                    <RpcProvider>
                                        <UserWalletAssetsProvider>
                                            <ExistingPortfolioProvider registry={registry}>
                                                <CrankProvider>
                                                    <Component {...pageProps} registry={registry} />
                                                </CrankProvider>
                                            </ExistingPortfolioProvider>
                                        </UserWalletAssetsProvider>
                                    </RpcProvider>
                                </WalletProvider>
                            </ConnectionProvider>
                        </SerpiusEndpointProvider>
                    </ItemsLoadProvider>
                </LoadProvider>
            </ErrorMessageProvider>
        </LocalKeypairProvider>
    );
}

export default MyApp;
