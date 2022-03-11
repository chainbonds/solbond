import React, {useState, useContext, useEffect} from 'react';
import {Provider} from "@project-serum/anchor";
import {clusterApiUrl, Connection, Keypair, PublicKey} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {solbondProgram} from "../programs/solbond";
import {WalletI} from "easy-spl";
import {MOCK} from "@qpools/sdk/src/const";
import {
    airdropAdmin,
    DisplayPortfolios,
    PortfolioFrontendFriendlyChainedInstructions
} from "@qpools/sdk";
import delay from "delay";
import axios from "axios";
import {UsdValuePosition} from "../types/UsdValuePosition";
import {registry} from "@qpools/sdk";
import {PositionInfo} from "@qpools/sdk";
import {position} from "dom-helpers";
import {Promise} from "es6-promise";

export interface AllocData {
    lp: string,
    weight: number,
    protocol: string,
    apy_24h: number
};

export interface IQPool {
    portfolioObject: PortfolioFrontendFriendlyChainedInstructions | undefined,
    positionInfos: PositionInfo[],
    positionValuesInUsd: UsdValuePosition[],
    totalPortfolioValueInUsd: number,
    initializeQPoolsUserTool: any,
    initializeQPoolsStatsTool: any,
    reloadPriceSentinel: boolean,
    connection: Connection | undefined,
    displayPortfolio: DisplayPortfolios | undefined,
    portfolioRatios: AllocData[],
    provider: Provider | undefined,
    _solbondProgram: any,
    makePriceReload: any,
    userAccount: WalletI | undefined,
    currencyMint: Token | undefined,
    QPTokenMint: Token | undefined,
}

const hardcodedApiResponse = [
    {
        "lp": "JSOL-SOL",
        "weight": 1000,
        "protocol": "saber",
        "apy_24h": 0.
    },
    {
        "lp": "HBTC-renBTC",
        "weight": 1000,
        "protocol": "saber",
        "apy_24h": 0.
    },
    {
        "lp": "eSOL-SOL",
        "weight": 1000,
        "protocol": "saber",
        "apy_24h": 0.
    }
]

const defaultValue: IQPool = {
    portfolioObject: undefined,
    displayPortfolio: undefined,
    reloadPriceSentinel: false,
    makePriceReload: () => console.log("Error not loaded yet!"),
    initializeQPoolsUserTool: () => console.log("Error not loaded yet!"),
    initializeQPoolsStatsTool: () => console.log("Error not loaded yet!"),
    positionInfos: [],
    positionValuesInUsd: [],
    totalPortfolioValueInUsd: 0,
    portfolioRatios: hardcodedApiResponse,
    connection: undefined,
    provider: undefined,
    _solbondProgram: () => console.error("attempting to use AuthContext outside of a valid provider"),
    userAccount: undefined,
    currencyMint: undefined,
    QPTokenMint: undefined,
}

const QPoolContext = React.createContext<IQPool>(defaultValue);

export function useQPoolUserTool() {
    return useContext(QPoolContext);
}

const hardcodedProgramIds = {
    "stableSwapProgramId": new PublicKey("SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ"),
};

const hardcodedPools = {
    USDC_USDT: {
        pubkey: new PublicKey("VeNkoB1HvSP6bSeGybQDnx9wTWFsQb2NBCemeCDSuKL"),
    },
    USDC_CASH: {
        pubkey: new PublicKey("B94iYzzWe7Q3ksvRnt5yJm6G5YquerRFKpsUVUvasdmA"),
    },
    USDC_TEST: {
        pubkey: new PublicKey("AqBGfWy3D9NpW8LuknrSSuv93tJUBiPWYxkBrettkG7x"),
    },
};

function getConnectionString(): Connection {
    let _connection;
    let clusterName = String(process.env.NEXT_PUBLIC_CLUSTER_NAME);console.log("Cluster name is: ", clusterName);
    if (clusterName === "localnet") {
        let localClusterUrl = String(process.env.NEXT_PUBLIC_CLUSTER_URL);
        _connection = new Connection(localClusterUrl, 'confirmed');
    } else if (clusterName === "devnet") {
        _connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    } else if (clusterName === "testnet") {
        _connection = new Connection(clusterApiUrl('testnet'), 'confirmed');
    } else if (clusterName === "mainnet") {
        _connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    } else {
        throw Error("Cluster is not defined properly! {$clusterName}");
    }
    return _connection;
}

export function QPoolsProvider(props: any) {

    const [portfolioObject, setPortfolioObject] = useState<PortfolioFrontendFriendlyChainedInstructions | undefined>(undefined);

    const [connection, setConnection] = useState<Connection | undefined>(undefined);
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [_solbondProgram, setSolbondProgram] = useState<any>(null);
    const [userAccount, setUserAccount] = useState<WalletI | undefined>(undefined);
    const [positionInfos, setPositionInfos] = useState<PositionInfo[]>([]);

    const [currencyMint, setCurrencyMint] = useState<Token | undefined>(undefined);
    const [QPTokenMint, setQPTokenMint] = useState<Token | undefined>(undefined);
    const [displayPortfolio, setDisplayPortfolio] = useState<DisplayPortfolios | undefined>(undefined);
    const [positionValuesInUsd, setPositionValuesInUsd] = useState<UsdValuePosition[]>([]);
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);
    const [reloadPriceSentinel, setReloadPriceSentinel] = useState<boolean>(false);

    const [portfolioRatios, setPortfolioRatios] = useState<AllocData[]>(hardcodedApiResponse);

    /**
     * Somewhat legacy, will fix and clear these items at a later stage ...
     */

    // Provider to get the JSON code ..

    useEffect(() => {
        console.log("#useEffect getSerpiusEndpoint");
        console.log("Loading the weights");
        axios.get<any>(registry.getSerpiusEndpoint()).then((response) => {
            console.log("Here is the data :");
            console.log(typeof response.data);
            console.log(JSON.stringify(response.data));
            if ("opt_port" in response.data) {
                let data: AllocData[] = response.data["opt_port"];
                setPortfolioRatios(data);
            }

        }).catch((error) => {
            console.log(error)
        })
        console.log("##useEffect getSerpiusEndpoint");
    }, []);

    // useEffect(() => {
    //     if (userAccount && portfolioObject) {
    //         getPortfolioInformation();
    //     }
    // }, [userAccount, portfolioObject, reloadPriceSentinel]);

    useEffect(() => {
        calculateAllUsdcValues();
    }, [userAccount, positionInfos, reloadPriceSentinel]);

    // const getPortfolioInformation = async () => {
    //     let allPositions: PositionInfo[] = await portfolioObject!.getPortfolioInformation();
    //     setPositionInfos(allPositions);
    // }

    const makePriceReload = async () => {
        console.log("#useEffect makePriceReload");
        setReloadPriceSentinel(!reloadPriceSentinel);
        console.log("##useEffect makePriceReload");
    }

    // Calculate all usdc values
    const calculateAllUsdcValues = async () => {
        console.log("#useEffect calculateAllUsdcValues");
        if (userAccount && portfolioObject) {
            let { storedPositions, usdAmount, storedPositionUsdcAmounts } = await portfolioObject.getPortfolioUsdcValue();
            setPositionValuesInUsd(storedPositionUsdcAmounts);
            setTotalPortfolioValueUsd(usdAmount);
            setPositionInfos(storedPositions);
        }
        console.log("##useEffect calculateAllUsdcValues");
    }

    const initializeQPoolsStatsTool = () => {
        console.log("#InitializeQPoolsStatsTool");
        console.log("Cluster URL is: ", String(process.env.NEXT_PUBLIC_CLUSTER_URL));
        let _connection: Connection = getConnectionString();
        let _currencyMint = new Token(
            _connection,
            MOCK.DEV.SABER_USDC,
            TOKEN_PROGRAM_ID,
            // new PublicKey("HdWi7ZAt1tmWaMJgH37DMqAMqBwjzt56CtiKELBZotrc"),
            airdropAdmin
        );

        // All the setters
        setConnection(_connection);
        setCurrencyMint(_currencyMint);
        // Wait for setter to kick in
        delay(1000);
        console.log("##InitializeQPoolsStatsTool");
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
            // new PublicKey("HdWi7ZAt1tmWaMJgH37DMqAMqBwjzt56CtiKELBZotrc"),
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
        setDisplayPortfolio(() => newQpoolsDisplay);

        // Wait for the setState to take effect. I know this is hacky, but for now should suffice
        await delay(1000);
        console.log("##initializeQPoolsUserTool");
    };

    const value: IQPool = {
        portfolioObject,
        portfolioRatios,
        positionInfos,
        positionValuesInUsd,
        initializeQPoolsUserTool,
        initializeQPoolsStatsTool,
        totalPortfolioValueInUsd,
        displayPortfolio,
        connection,
        provider,
        _solbondProgram,
        userAccount,
        currencyMint,
        QPTokenMint,
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
