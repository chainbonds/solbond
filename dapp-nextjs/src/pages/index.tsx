import type {NextPage} from "next";
import Head from "next/head";
import {HomeView} from "../views";
import Script from 'next/script';
import {getConnection} from "../const";
import {Registry} from "../../../../qPools-contract/qpools-sdk/src/frontend-friendly";
import {Network} from "@saberhq/solana-contrib";
import {network} from "../../../../qPools-contract/qpools-sdk/src";
import {LocalKeypairProvider} from "../contexts/LocalKeypairProvider";
import {ErrorMessageProvider} from "../contexts/ErrorMessageContext";
import {LoadProvider} from "../contexts/LoadingContext";
import {ItemsLoadProvider} from "../contexts/ItemsLoadingContext";
import {SerpiusEndpointProvider} from "../contexts/SerpiusProvider";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {RpcProvider} from "../contexts/RpcProvider";
import {UserWalletAssetsProvider} from "../contexts/UserWalletAssets";
import {ExistingPortfolioProvider} from "../contexts/ExistingPortfolioProvider";
import {CrankProvider} from "../contexts/CrankProvider";

// interface Props extends PropsWithChildren<{}> {
//     // key: ,
//     // children: ,
//     // type: ,
//     // props
//     registry: qpools.helperClasses.Registry
// }
const Home: NextPage = () => {

    // Probably should import all the items here ...
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

    return (
        <>
            <Head>
                <title>qPools | Generate Yields, Adjust Risk | The most convenient way to generate passive income
                    without locking in liquidity. Built on #Solana</title>
                <meta
                    name="description"
                    content="qPools | Generate Yields - Stay Liquid | The most convenient way to generate passive income without locking in liquidity. Built on #Solana"
                />
                {/*// <!-- Global site tag (gtag.js) - Google Analytics -->*/}
            </Head>
            <div className={"h-screen w-screen bg-gray-800"}>

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
                                                        <HomeView registry={registry}/>
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

                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-P5225TV5V8"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
    
                        gtag('config', 'G-P5225TV5V8');
                    `}
                </Script>
                <Script id={"twitter-analytics"} type="text/javascript" strategy="afterInteractive">
                    {`
                        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
                        },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
                        a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
                        // Insert Twitter Pixel ID and Standard Event data below
                        twq('init','o7dy9');
                        twq('track','PageView');
                    `}
                </Script>
                {/*// <!-- Begin Inspectlet Asynchronous Code -->*/}
                <Script id="inspectlet" type="text/javascript" strategy="afterInteractive">
                    {` 
                            (function() {
                            window.__insp = window.__insp || [];
                            __insp.push(['wid', 171188381]);
                            var ldinsp = function(){
                            if(typeof window.__inspld != "undefined") return; window.__inspld = 1; var insp = document.createElement('script'); insp.type = 'text/javascript'; insp.async = true; insp.id = "inspsync"; insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js?wid=171188381&r=' + Math.floor(new Date().getTime()/3600000); var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(insp, x); };
                            setTimeout(ldinsp, 0);
                        })();
                    `}
                </Script>
            </div>
        </>
    );
};

export default Home;
