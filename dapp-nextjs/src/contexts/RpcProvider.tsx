import React, {useState, useContext, useEffect} from 'react';
import {Provider} from "@project-serum/anchor";
import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {solbondProgram} from "../programs/solbond";
import {WalletI} from "easy-spl";
import {ExplicitPool, PortfolioFrontendFriendlyChainedInstructions, Protocol} from "@qpools/sdk";
import {MOCK} from "@qpools/sdk";
import {getConnectionString} from "../const";
import {useWallet, WalletContextState} from "@solana/wallet-adapter-react";
import {DisplayToken} from "../types/DisplayToken";
import {solscanLink} from "../utils/utils";
import {Registry} from "@qpools/sdk";


export interface IRpcProvider {
    portfolioObject: PortfolioFrontendFriendlyChainedInstructions | undefined,
    initialize: any,
    reloadPriceSentinel: boolean,
    connection: Connection | undefined,
    provider: Provider | undefined,
    registry: Registry | undefined;
    _solbondProgram: any,
    makePriceReload: any,
    userAccount: WalletI | undefined,
    currencyMint: Token | undefined,
    displayTokensFromPool: any
}

const defaultValue: IRpcProvider = {
    portfolioObject: undefined,
    reloadPriceSentinel: false,
    registry: undefined,
    makePriceReload: () => console.log("Error not loaded yet!"),
    initialize: () => console.log("Error not loaded yet!"),
    connection: undefined,
    provider: undefined,
    _solbondProgram: () => console.error("attempting to use AuthContext outside of a valid provider"),
    userAccount: undefined,
    currencyMint: undefined,
    displayTokensFromPool: () => console.log("Error not loaded yet!")
}

const RpcContext = React.createContext<IRpcProvider>(defaultValue);

export function useRpc() {
    return useContext(RpcContext);
}

export function RpcProvider(props: any) {

    const walletContext: WalletContextState = useWallet();
    const [connection, setConnection] = useState<Connection | undefined>(undefined);
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [_solbondProgram, setSolbondProgram] = useState<any>(null);
    const [userAccount, setUserAccount] = useState<WalletI | undefined>(undefined);
    const [backendApi, setBackendApi] = useState<PortfolioFrontendFriendlyChainedInstructions | undefined>(undefined);
    const [registry, setRegistry] = useState<Registry | undefined>(undefined);

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
        let _registry: Registry = new Registry();
        _registry.initializeRegistry();
        let _connection: Connection = getConnectionString();
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

        console.log(_registry);
        console.assert(_registry);
        console.log(_solbondProgram);
        console.assert(_solbondProgram);
        console.log(_provider);
        console.assert(_provider);
        console.log(_connection);
        console.assert(_connection);

        let backendApi = new PortfolioFrontendFriendlyChainedInstructions(_connection, _provider, _solbondProgram);

        // Do a bunch of setstate, and wait ...
        setRegistry(() => _registry);
        setConnection(() => _connection);
        setConnection(() => _connection);
        setProvider(() => _provider);
        setSolbondProgram(() => _solbondProgram);
        setUserAccount(() => _userAccount);
        setCurrencyMint(() => _currencyMint);
        setBackendApi(() => backendApi);
        // Wait for the setState to take effect. I know this is hacky, but for now should suffice
        console.log("##initialize");
    };

    const displayTokensFromPool = async (pool: ExplicitPool): Promise<DisplayToken[]> => {

        let displayTokens: DisplayToken[] = [];

        if (!pool) {
            return []
        }

        if (pool.protocol === Protocol.saber) {
            let displayTokenItemA: DisplayToken = {
                tokenImageLink: await registry!.getIconUriFromToken(pool.tokens[0].address),
                tokenSolscanLink: solscanLink(new PublicKey(pool.tokens[0].address))
            };
            displayTokens.push(displayTokenItemA);
            let displayTokenItemB: DisplayToken = {
                tokenImageLink: await registry!.getIconUriFromToken(pool.tokens[1].address),
                tokenSolscanLink: solscanLink(new PublicKey(pool.tokens[1].address))
            };
            displayTokens.push(displayTokenItemB);
        } else if (pool.protocol === Protocol.marinade) {
            let displayTokenItem: DisplayToken = {
                tokenImageLink: await registry!.getIconUriFromToken(pool.lpToken.address),
                tokenSolscanLink: solscanLink(new PublicKey(pool.lpToken.address))
            };
            displayTokens.push(displayTokenItem);
        } else if (pool.protocol === Protocol.solend) {
            // TODO: Double check if the lp-token actually has any icon ...
            // If not, then the LP-Token was not added as an Token to the list of all possible tokens ...
            let displayTokenItem: DisplayToken = {
                tokenImageLink: await registry!.getIconUriFromToken(pool.lpToken.address),
                tokenSolscanLink: solscanLink(new PublicKey(pool.lpToken.address))
            };
            displayTokens.push(displayTokenItem);
        } else {
            console.log("pool", pool);
            throw Error("Protocol not found" + JSON.stringify(pool));
        }

        return displayTokens;
    }

    const value: IRpcProvider = {
        portfolioObject: backendApi,
        initialize,
        connection,
        provider,
        registry,
        _solbondProgram,
        userAccount,
        currencyMint,
        makePriceReload,
        reloadPriceSentinel,
        displayTokensFromPool
    };

    return (
        <>
            <RpcContext.Provider value={value}>
                {props.children}
            </RpcContext.Provider>
        </>
    );
}
