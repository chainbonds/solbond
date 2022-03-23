import React, {useState, useContext, useEffect} from 'react';
import {Provider} from "@project-serum/anchor";
import {Connection, Keypair} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {solbondProgram} from "../programs/solbond";
import {WalletI} from "easy-spl";
import {
    DisplayPortfolios,
    PortfolioFrontendFriendlyChainedInstructions
} from "@qpools/sdk";
import delay from "delay";
import {accountExists} from "@qpools/sdk";
import {PositionInfo} from "@qpools/sdk";
import {MOCK} from "@qpools/sdk";
import {getConnectionString} from "../const";
import {AllocData} from "../types/AllocData";


export interface IQPool {
    portfolioObject: PortfolioFrontendFriendlyChainedInstructions | undefined,
    initializeQPoolsUserTool: any,
    reloadPriceSentinel: boolean,
    connection: Connection | undefined,
    provider: Provider | undefined,
    _solbondProgram: any,
    makePriceReload: any,
    userAccount: WalletI | undefined,
    currencyMint: Token | undefined,
}

const hardcodedApiResponse = [
    {
        "lp": "USDC-USDT",
        "weight": 1000,
        "protocol": "Saber",
        "apy_24h": 0.
    }
]

const defaultValue: IQPool = {
    portfolioObject: undefined,
    reloadPriceSentinel: false,
    makePriceReload: () => console.log("Error not loaded yet!"),
    initializeQPoolsUserTool: () => console.log("Error not loaded yet!"),
    connection: undefined,
    provider: undefined,
    _solbondProgram: () => console.error("attempting to use AuthContext outside of a valid provider"),
    userAccount: undefined,
    currencyMint: undefined,
}

const QPoolContext = React.createContext<IQPool>(defaultValue);

export function useQPoolUserTool() {
    return useContext(QPoolContext);
}

export function QPoolsProvider(props: any) {

    /**
     * Generic state for RPC Calls
     */
    const [connection, setConnection] = useState<Connection | undefined>(undefined);
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [_solbondProgram, setSolbondProgram] = useState<any>(null);
    const [userAccount, setUserAccount] = useState<WalletI | undefined>(undefined);

    /**
     * Helper objects for RPC Calls
     */
    const [portfolioObject, setPortfolioObject] = useState<PortfolioFrontendFriendlyChainedInstructions | undefined>(undefined);

    /**
     * App-dependent variables
     */
    const [currencyMint, setCurrencyMint] = useState<Token | undefined>(undefined);
    const [reloadPriceSentinel, setReloadPriceSentinel] = useState<boolean>(false);

    const makePriceReload = async () => {
        console.log("#useEffect makePriceReload");
        setReloadPriceSentinel(!reloadPriceSentinel);
        console.log("##useEffect makePriceReload");
    }

    // Make a creator that loads the qPoolObject if it not created yet
    const initializeQPoolsUserTool = async (walletContext: any) => {
        console.log("#initializeQPoolsUserTool");
        console.log("Cluster URL is: ", String(process.env.NEXT_PUBLIC_CLUSTER_URL));
        let _connection: Connection = getConnectionString();
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

        // @ts-ignore
        let _portfolio = new PortfolioFrontendFriendlyChainedInstructions(_connection, _provider, _solbondProgram, payer);
        let newQpoolsDisplay = new DisplayPortfolios(_connection, _provider, _solbondProgram);

        // Do a bunch of setstate, and wait ...
        setConnection(() => _connection);
        setProvider(() => _provider);
        setSolbondProgram(() => _solbondProgram);
        setUserAccount(() => _userAccount);
        setCurrencyMint(() => _currencyMint);
        setPortfolioObject(() => _portfolio);

        // Wait for the setState to take effect. I know this is hacky, but for now should suffice
        await delay(1000);
        console.log("##initializeQPoolsUserTool");
    };

    const value: IQPool = {
        portfolioObject,
        initializeQPoolsUserTool,
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
            <QPoolContext.Provider value={value}>
                {props.children}
            </QPoolContext.Provider>
        </>
    );
}
