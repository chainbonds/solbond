import React, {useState, useContext, useEffect} from 'react';
import {Provider} from "@project-serum/anchor";
import {Connection, Keypair} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {solbondProgram} from "../programs/solbond";
import {WalletI} from "easy-spl";
import * as qpools from "@qpools/sdk";
import {getConnectionString} from "../const";
import {useConnectedWallet, useSolana} from "@saberhq/use-solana";

export interface IRpcProvider {
    portfolioObject: qpools.helperClasses.PortfolioFrontendFriendlyChainedInstructions | undefined,
    initialize: any,
    reloadPriceSentinel: boolean,
    connection: Connection,
    provider: Provider | undefined,
    _solbondProgram: any,
    makePriceReload: any,
    userAccount: WalletI | undefined,
    currencyMint: Token | undefined
}

const defaultValue: IRpcProvider = {
    portfolioObject: undefined,
    reloadPriceSentinel: false,
    makePriceReload: () => console.log("Error not loaded yet!"),
    initialize: () => console.log("Error not loaded yet!"),
    connection: getConnectionString(),
    provider: undefined,
    _solbondProgram: () => console.error("attempting to use AuthContext outside of a valid provider"),
    userAccount: undefined,
    currencyMint: undefined
}

const RpcContext = React.createContext<IRpcProvider>(defaultValue);

export function useRpc() {
    return useContext(RpcContext);
}

interface Props {
    registry: qpools.helperClasses.Registry
    children: any
}
export function RpcProvider(props: Props) {

    // const walletContext: WalletContextState = useWallet();
    const walletContext = useConnectedWallet();
    const { walletProviderInfo, disconnect, providerMut, network, setNetwork } = useSolana();
    const [connection, setConnection] = useState<Connection>(getConnectionString());
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [_solbondProgram, setSolbondProgram] = useState<any>(null);
    const [userAccount, setUserAccount] = useState<WalletI | undefined>(undefined);
    const [backendApi, setBackendApi] = useState<qpools.helperClasses.PortfolioFrontendFriendlyChainedInstructions | undefined>(undefined);

    /**
     * App-dependent variables
     */
    const [currencyMint, setCurrencyMint] = useState<Token | undefined>(undefined);
    const [reloadPriceSentinel, setReloadPriceSentinel] = useState<boolean>(false);

    // TODO: Move into a separate context ...?
    const makePriceReload = async () => {
        console.log("#useEffect makePriceReload");
        setReloadPriceSentinel(!reloadPriceSentinel);
        console.log("##useEffect makePriceReload");
    }

    // Make a creator that loads the qPoolObject if it not created yet
    useEffect(() => {
        console.log("Wallet Provider Info is: ", walletProviderInfo);
        console.log("Wallet Pubkey Re-Loaded wallet is:", walletContext);
        console.log("Provider mut is: ", providerMut);
        // throw Error("Helloo!");
        // Gotta have wallet context for sure ...
        if (walletContext && walletContext!.publicKey) {
            initialize();
        }
    }, [walletContext?.publicKey]);

    const initialize = () => {
        console.log("#initialize");
        console.log("Cluster URL is: ", String(process.env.NEXT_PUBLIC_CLUSTER_URL));
        // TODO: How to create a provider ... just take it from the walelt (?)
        // TODO: Figure out how to get a provider from the wallet ....
        // // @ts-ignore
        // If the user is not yet connected, just create a provider with an empty wallet ...
        // @ts-ignore
        let _provider = new anchor.Provider(connection, null, anchor.Provider.defaultOptions());
        if (providerMut?.wallet) {
            _provider = new anchor.Provider(connection, providerMut.wallet, anchor.Provider.defaultOptions());
        }
        anchor.setProvider(_provider);
        const _solbondProgram: any = solbondProgram(connection, _provider);
        console.log("Solbond ProgramId is: ", _solbondProgram.programId.toString());
        const _userAccount: WalletI = _provider.wallet;

        // @ts-expect-error
        let payer = _provider.wallet.payer as Keypair;
        let _currencyMint = new Token(
            connection,
            qpools.constDefinitions.MOCK.DEV.SABER_USDC,
            TOKEN_PROGRAM_ID,
            payer
        );

        console.log(_solbondProgram);
        console.assert(_solbondProgram);
        console.log(_provider);
        console.assert(_provider);

        let backendApi = new qpools.helperClasses.PortfolioFrontendFriendlyChainedInstructions(connection, _provider, _solbondProgram, props.registry);

        // Do a bunch of setstate, and wait ...
        setProvider(() => _provider);
        setSolbondProgram(() => _solbondProgram);
        setUserAccount(() => _userAccount);
        setCurrencyMint(() => _currencyMint);
        setBackendApi(() => backendApi);
        // Wait for the setState to take effect. I know this is hacky, but for now should suffice
        console.log("##initialize");
    };

    const value: IRpcProvider = {
        portfolioObject: backendApi,
        initialize,
        connection,
        provider,
        _solbondProgram,
        userAccount,
        currencyMint,
        makePriceReload,
        reloadPriceSentinel
    };

    return (
        <>
            <RpcContext.Provider value={value}>
                {props.children}
            </RpcContext.Provider>
        </>
    );
}
