import React, {ReactNode, useState} from 'react';
import {ComponentStory, ComponentMeta} from '@storybook/react';
import RunCranksModal from "./RunCranksModal";
import {BRAND_COLORS, getConnection} from "../../../const";
import {LocalKeypairProvider} from "../../../contexts/LocalKeypairProvider";
import {ErrorMessageProvider} from "../../../contexts/ErrorMessageContext";
import {ItemsLoadProvider} from "../../../contexts/ItemsLoadingContext";
import {useLoad} from "../../../contexts/LoadingContext";
import {Cluster, getNetworkCluster, Registry} from "../../../../../../qPools-contract/qpools-sdk";
import {Network} from "@saberhq/solana-contrib";
import {SerpiusEndpointProvider} from "../../../contexts/SerpiusProvider";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {RpcProvider} from "../../../contexts/RpcProvider";
import {UserWalletAssetsProvider} from "../../../contexts/UserWalletAssets";
import {ExistingPortfolioProvider} from "../../../contexts/ExistingPortfolioProvider";
import {CrankProvider} from "../../../contexts/CrankProvider";
import {RunDepositCrankButton} from "../../createPortfolio/buttons/RunDepositCrankButton";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Modals/Run Cranks Modal',
    component: RunCranksModal,
} as ComponentMeta<typeof RunCranksModal>;

function LoadingOverlay(props: { spinner: boolean, styles: { wrapper: { overflow: string } }, text: string, active: any, children: ReactNode }) {
    return null;
}

/*
 * Example Button story with React Hooks.
 * See note below related to this example.
 */
export const Example = () => {

    // Maybe add a button if the Modal is not enabled yet ...
    // Sets a click handler to change the label's value
    const {loading} = useLoad();

    // Probably should import all the items here ...
    // Could just create the connection here ..
    const connection = getConnection();
    const registry = new Registry(connection);

    // Perhaps use-registry should be a hook ...

    let defaultNetwork: Network;
    if (getNetworkCluster() === Cluster.DEVNET) {
        defaultNetwork = "devnet";
    } else if (getNetworkCluster() === Cluster.MAINNET) {
        defaultNetwork = "mainnet-beta";
    } else {
        throw Error("Network not specified! " + String(getNetworkCluster()));
    }

    return (
        <>
            <LocalKeypairProvider>
                <ErrorMessageProvider>
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
                                                <LoadingOverlay
                                                    active={loading}
                                                    spinner={true}
                                                    text="Loading..."
                                                    styles={{
                                                        wrapper: {
                                                            overflow: loading ? 'hidden' : 'scroll'
                                                        }
                                                    }}
                                                >
                                                    <div
                                                        className="flex flex-col h-screen w-full w-screen text-white"
                                                        style={{backgroundColor: BRAND_COLORS.slate900}}
                                                    >
                                                        <RunDepositCrankButton/>
                                                    </div>
                                                </LoadingOverlay>
                                            </CrankProvider>
                                        </ExistingPortfolioProvider>
                                    </UserWalletAssetsProvider>
                                </RpcProvider>
                            </WalletKitProvider>
                        </SerpiusEndpointProvider>
                    </ItemsLoadProvider>
                </ErrorMessageProvider>
            </LocalKeypairProvider>
        </>
    );
}

