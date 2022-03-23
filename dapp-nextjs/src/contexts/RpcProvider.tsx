import React, {useState, useContext, useEffect} from 'react';
import {Provider} from "@project-serum/anchor";
import {Connection, Keypair} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {solbondProgram} from "../programs/solbond";
import {WalletI} from "easy-spl";
import {PortfolioFrontendFriendlyChainedInstructions} from "@qpools/sdk";
import {MOCK} from "@qpools/sdk";
import {getConnectionString} from "../const";
import {useWallet, WalletContextState} from "@solana/wallet-adapter-react";


export interface IRpcProvider {
    portfolioObject: PortfolioFrontendFriendlyChainedInstructions | undefined,
    initialize: any,
    reloadPriceSentinel: boolean,
    connection: Connection | undefined,
    provider: Provider | undefined,
    _solbondProgram: any,
    makePriceReload: any,
    userAccount: WalletI | undefined,
    currencyMint: Token | undefined,
}

const defaultValue: IRpcProvider = {
    portfolioObject: undefined,
    reloadPriceSentinel: false,
    makePriceReload: () => console.log("Error not loaded yet!"),
    initialize: () => console.log("Error not loaded yet!"),
    connection: undefined,
    provider: undefined,
    _solbondProgram: () => console.error("attempting to use AuthContext outside of a valid provider"),
    userAccount: undefined,
    currencyMint: undefined,
}

const RpcContext = React.createContext<IRpcProvider>(defaultValue);

export function useRpc() {
    return useContext(RpcContext);
}

export function RpcProvider(props: any) {

    /**
     * Generic state for RPC Calls
     */
    const walletContext: WalletContextState = useWallet();
    const [connection, setConnection] = useState<Connection | undefined>(undefined);
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [_solbondProgram, setSolbondProgram] = useState<any>(null);
    const [userAccount, setUserAccount] = useState<WalletI | undefined>(undefined);

    /**
     * Helper objects for RPC Calls
     */
    const [backendApi, setBackendApi] = useState<PortfolioFrontendFriendlyChainedInstructions | undefined>(undefined);

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
        console.log("Wallet Pubkey Re-Loaded wallet is:", walletContext.publicKey?.toString());
        // Gotta have wallet context for sure ...
        if (walletContext.wallet) {
            initialize();
        }
    }, [walletContext.publicKey]);

    const initialize = () => {
        console.log("#initialize");
        console.log("Cluster URL is: ", String(process.env.NEXT_PUBLIC_CLUSTER_URL));
        let _connection: Connection = getConnectionString();
        // // @ts-ignore  // For some reason this typing is ok ...
        // let wallet: Wallet = walletContext.wallet;
        // @ts-ignore
        const _provider = new anchor.Provider(_connection, walletContext, anchor.Provider.defaultOptions());
        anchor.setProvider(_provider);
        const _solbondProgram: any = solbondProgram(_connection, _provider);
        console.log("Solbond ProgramId is: ", _solbondProgram.programId.toString());
        const _userAccount: WalletI = _provider.wallet;

        // @ts-expect-error
        let payer = _provider.wallet.payer as Keypair;
        let _currencyMint = new Token(
            _connection,
            MOCK.DEV.SABER_USDC,
            TOKEN_PROGRAM_ID,
            payer
        );

        // console.log("All items are: ")
        // console.log(payer);
        // console.assert(payer);
        console.log(_solbondProgram);
        console.assert(_solbondProgram);
        console.log(_provider);
        console.assert(_provider);
        console.log(_connection);
        console.assert(_connection);

        let backendApi = new PortfolioFrontendFriendlyChainedInstructions(_connection, _provider, _solbondProgram);

        // Do a bunch of setstate, and wait ...
        setConnection(() => _connection);
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
