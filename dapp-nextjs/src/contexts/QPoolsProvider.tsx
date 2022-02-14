import React, {useState, useContext, useEffect} from 'react';
import {Provider} from "@project-serum/anchor";
import {AllocateParams, clusterApiUrl, Connection, Keypair, PublicKey} from "@solana/web3.js";
import {Token} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {solbondProgram} from "../programs/solbond";
import {WalletI} from "easy-spl";
import {QPoolsUser} from "@qpools/sdk/src/qpools-user";
import {MOCK} from "@qpools/sdk/src/const";
import {QPoolsStats} from "@qpools/sdk/lib/qpools-stats";
import {airdropAdmin, PortfolioFrontendFriendly} from "@qpools/sdk";
import delay from "delay";
import axios from "axios";

export interface AllocData {
    lp: string,
    weight: number,
    protocol: string,
};

export interface IQPool {
    qPoolsUser: QPoolsUser | undefined,
    qPoolsStats: QPoolsStats | undefined,
    portfolioObject: PortfolioFrontendFriendly | undefined,
    initializeQPoolsUserTool: any,
    initializeQPoolsStatsTool: any,
    connection: Connection | undefined,
    portfolioRatios: AllocData[],
    provider: Provider | undefined,
    _solbondProgram: any,
    userAccount: WalletI | undefined,
    currencyMint: Token | undefined,
    QPTokenMint: Token | undefined,
}

const defaultValue: IQPool = {
    qPoolsUser: undefined,
    qPoolsStats: undefined,
    portfolioObject: undefined,
    portfolioRatios: [{
        "lp": "JSOL-SOL",
        "weight": 1000,
        "protocol": "saber"
    }, {"lp": "HBTC-renBTC", "weight": 1000, "protocol": "saber"}, {
        "lp": "eSOL-SOL",
        "weight": 1000,
        "protocol": "saber"
    }],
    initializeQPoolsUserTool: () => console.error("attempting to use AuthContext outside of a valid provider"),
    initializeQPoolsStatsTool: () => console.error("attempting to use AuthContext outside of a valid provider"),
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

    const [qPoolsUser, setQPoolsUser] = useState<QPoolsUser | undefined>(undefined);
    const [qPoolsStats, setQPoolsStats] = useState<QPoolsStats | undefined>(undefined);
    const [portfolioObject, setPortfolioObject] = useState<PortfolioFrontendFriendly | undefined>(undefined);

    const [connection, setConnection] = useState<Connection | undefined>(undefined);
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [_solbondProgram, setSolbondProgram] = useState<any>(null);
    const [userAccount, setUserAccount] = useState<WalletI | undefined>(undefined);

    const [currencyMint, setCurrencyMint] = useState<Token | undefined>(undefined);
    const [QPTokenMint, setQPTokenMint] = useState<Token | undefined>(undefined);

    const [portfolioRatios, setPortfolioRatios] = useState<AllocData[]>([{
        "lp": "JSOL-SOL",
        "weight": 1000,
        "protocol": "saber"
    }, {"lp": "HBTC-renBTC", "weight": 1000, "protocol": "saber"}, {
        "lp": "eSOL-SOL",
        "weight": 1000,
        "protocol": "saber"
    }]);

    /**
     * Somewhat legacy, will fix and clear these items at a later stage ...
     */

    // Provider to get the JSON code ...

    useEffect(() => {
        console.log("Loading the weights");
        axios.get<AllocData[]>("https://qpools.serpius.com/weight_status.json").then((response) => {
            setPortfolioRatios(response.data)
            console.log("Here is the data :")
            console.log(typeof response.data)
            console.log(JSON.stringify(response.data))

        }).catch((error) => {
            console.log(error)
        })
    }, []);

    useEffect(() => {

    })

    const initializeQPoolsStatsTool = () => {
        console.log("InitializeQPoolsStatsTool");
        console.log("Cluster URL is: ", String(process.env.NEXT_PUBLIC_CLUSTER_URL));
        let _connection: Connection = getConnectionString();
        let _currencyMint = new Token(
            _connection,
            MOCK.DEV.SABER_USDC,
            new PublicKey("HbJv8zuZ48AaqShNrTCBM3H34i51Vj6q4RfAQfA2iQLN"),
            airdropAdmin
        );
        let newQpoolsStates = new QPoolsStats(_connection, _currencyMint);
        console.log("Setting the qpools stats newly, ", newQpoolsStates);

        // All the setters
        setConnection(_connection);
        setCurrencyMint(_currencyMint);
        setQPoolsStats(newQpoolsStates);
        // Wait for setter to kick in
        delay(1000);
        return;
    }

    // Make a creator that loads the qPoolObject if it not created yet
    const initializeQPoolsUserTool = async (walletContext: any) => {

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
            new PublicKey("HbJv8zuZ48AaqShNrTCBM3H34i51Vj6q4RfAQfA2iQLN"),
            payer
        );

        let _portfolio = new PortfolioFrontendFriendly(_connection, _provider, _solbondProgram, payer);

        // Do a bunch of setstate, and wait ...
        setConnection(() => _connection);
        setProvider(() => _provider);
        setSolbondProgram(() => _solbondProgram);
        setUserAccount(() => _userAccount);
        setCurrencyMint(() => _currencyMint);
        setPortfolioObject(() => _portfolio);

        // TODO: Remove the QPoolsUser object completely! This is legacy
        // if (!qPoolsUser) {
        //     setQPoolsUser(() => {
        //         return new QPoolsUser(
        //             _provider,
        //             _connection,
        //             _currencyMint
        //         );
        //     });
        // } else {
        //     console.log("qPoolUserTool already exists!");
        //     // alert("qPoolUserToll already exists!");
        // }

        // Wait for the setState to take effect. I know this is hacky, but for now should suffice
        await delay(800);

    };

    const value: IQPool = {
        qPoolsUser,
        qPoolsStats,
        portfolioObject,
        initializeQPoolsUserTool,
        initializeQPoolsStatsTool,
        portfolioRatios,
        connection,
        provider,
        _solbondProgram,
        userAccount,
        currencyMint,
        QPTokenMint
    };

    return (
        <>
            <QPoolContext.Provider value={value}>
                {props.children}
            </QPoolContext.Provider>
        </>
    );
}
