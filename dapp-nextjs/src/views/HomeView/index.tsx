import React, {FC} from "react";
import {Main} from "../../components/Main";
// @ts-ignore @ts-expect-error
import LoadingOverlay from "react-loading-overlay";
import {useLoad} from "../../contexts/LoadingContext";
import {BRAND_COLORS, getConnection} from "../../const";
import {Network} from "@saberhq/solana-contrib";
import {LocalKeypairProvider} from "../../contexts/LocalKeypairProvider";
import {ErrorMessageProvider} from "../../contexts/ErrorMessageContext";
import {ItemsLoadProvider} from "../../contexts/ItemsLoadingContext";
import {SerpiusEndpointProvider} from "../../contexts/SerpiusProvider";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {RpcProvider} from "../../contexts/RpcProvider";
import {ExistingPortfolioProvider} from "../../contexts/ExistingPortfolioProvider";
import {CrankProvider} from "../../contexts/CrankProvider";
import {UserWalletAssetsProvider} from "../../contexts/UserWalletAssets";
import {Cluster, getNetworkCluster, Registry } from "@qpools/sdk";
import {Footer} from "../../components/sections/Footer";
import {Header} from "../../components/sections/Header";

interface Props {
    registry: Registry
}

export const HomeView: FC = ({}) => {

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
                                                            style={{ backgroundColor: BRAND_COLORS.slate900 }}
                                                        >
                                                            <Header />
                                                            <Main registry={registry}/>
                                                            <Footer/>
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
};
