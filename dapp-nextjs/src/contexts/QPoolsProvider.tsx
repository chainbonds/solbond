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
import {registry, accountExists} from "@qpools/sdk";
import {PositionInfo, CrankRpcCalls} from "@qpools/sdk";

export interface AllocData {
    lp: string,
    weight: number,
    protocol: string,
    apy_24h: number,
    pool?: registry.ExplicitSaberPool
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
    localTmpKeypair: Keypair | undefined,
    crankRpcTool: CrankRpcCalls | undefined,
}

const hardcodedApiResponse = [
    {
        "lp": "JSOL-SOL",
        "weight": 1000,
        "protocol": "Saber",
        "apy_24h": 0.
    },
    {
        "lp": "HBTC-renBTC",
        "weight": 1000,
        "protocol": "Saber",
        "apy_24h": 0.
    },
    {
        "lp": "eSOL-SOL",
        "weight": 1000,
        "protocol": "Saber",
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
    localTmpKeypair: undefined,
    crankRpcTool: undefined
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

    const [localTmpKeypair, setLocalTmpKeypair] = useState<Keypair | undefined>();
    const [crankRpcTool, setCrankRpcTool] = useState<CrankRpcCalls | undefined>();

    /**
     * At the beginning of running the app, generate a temporary keypair
     * This keypair will never hold any SOL above 0.02
     *
     * It will be used to run the cranks from the client-side
     * It can also be used to make get-requests (because providers require to have a keypair provided)
     *
     * Saving and retrieving base64 string according to
     * https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
     *
     */
    useEffect(() => {

        // Load Keypair from Local Storage
        let tmpKeypairSecretKey: string | null = localStorage.getItem("tmpKeypairSecretKey");
        if (!tmpKeypairSecretKey) {
            console.log("Generating a new keypair!!");
            console.log("This keypair will never hold more than 0.02 SOL, and this will also be used instantenously");
            const tmpKeypair: Keypair = Keypair.generate();
            setLocalTmpKeypair(tmpKeypair);
            // Save it into localStorage
            localStorage.setItem("tmpKeypairPublicKey", tmpKeypair.publicKey.toString());
            localStorage.setItem("tmpKeypairSecretKey", Buffer.from(tmpKeypair.secretKey).toString('base64'));
        } else {
            console.log("Loading keypair...");
            setLocalTmpKeypair((_: any) => {
                let secretKeyUint8Array: Uint8Array = new Uint8Array(Buffer.from(tmpKeypairSecretKey!, 'base64'))
                console.log("Secret key size is: ", secretKeyUint8Array);
                return Keypair.fromSecretKey(secretKeyUint8Array);
            })
        }

        console.log("Local keypair is: ");
        console.log(tmpKeypairSecretKey);

    }, []);

    /**
     * Everytime ther is a change in the Keypair, create a
     */
    useEffect(() => {
        if (localTmpKeypair && connection && provider) {
            setCrankRpcTool((_: any) => {
                let crankRpcCalls = new CrankRpcCalls(
                    connection!,
                    localTmpKeypair!,
                    provider!,
                    _solbondProgram!
                );
                return crankRpcCalls;
            });
        }
    }, [localTmpKeypair, connection, provider]);

    /**
     * Implement logic to run cranks if not all positions have been fulfilled
     */
    const runCrankInBackground = async () => {
        // Check
        if (await accountExists(connection!, crankRpcTool!.portfolioPDA)) {
            await crankRpcTool!.fullfillAllPermissionless();
            await makePriceReload();
        }
    }

    useEffect(() => {
        if (crankRpcTool) {
            runCrankInBackground();
        }
    },[crankRpcTool]);


    /**
     * Somewhat legacy, will fix and clear these items at a later stage ...
     */

    // Provider to get the JSON code ..
    // Function to load and store the serpius data
    const fetchAndParseSerpiusEndpoint = async () => {
            console.log("#useEffect getSerpiusEndpoint");
            console.log("Loading the weights");
            //registry.getSerpiusEndpoint()
        //"https://qpools.serpius.com/weight_status_v2.json"
            let response = await axios.get<any>("https://qpools.serpius.com/weight_status_v2.json");
            //let response = await axios.get<any>(registry.getSerpiusEndpoint());
            // console.log("Here is the data :");
            // console.log(typeof response.data);
            // console.log(JSON.stringify(response.data));
            // console.log("Next!?");

            if ("opt_port" in response.data) {
                console.log("Trying to get the data ...");
                console.log("response.data", response.data);
                console.log("response.data.opt_port", response.data["opt_port"]);
                console.log("Now loading again ...")
                let data: AllocData[] = response.data["opt_port"];
                console.log("After..");
                // setPortfolioRatios(data);
                console.log("(2) Data and type is: ", typeof data, data);

                // Fetch the additional token account for each data item in AllocData
                setPortfolioRatios((_: AllocData[]) => {

                    // Now add the information about the ExplicitSaberPool into it as well
                    let newData = data.map((dataItem: AllocData) => {
                        dataItem.pool = registry.getPoolFromSplStringId(dataItem.lp);
                        console.log("data item is", dataItem)
                        return dataItem;
                    });

                    // HARDCODED DATA BELOW !!!!! SHOULD BE DELETED EVENTAULLY

                    newData[0].lp = "USDC-USDT"
                    newData[1].lp = "USDC-CASH"
                    console.log("Returning new data to be: ", newData);
                    console.log("Active pools", registry.getActivePools());
                    newData[0].pool = registry.getPoolFromSplStringId("rUSDC-USDT")
                    newData[1].pool = registry.getPoolFromSplStringId("USDC-CASH")
                    let temp = newData[1]
                    newData[1] = newData[2]
                    newData[2] = temp
                    console.log("Returning new data to be: ", newData);
                    return newData
                });
            } else {
                console.log("opt port not found in data!");
            }
            console.log("##useEffect getSerpiusEndpoint");
    }

    useEffect(() => {
        fetchAndParseSerpiusEndpoint();
    }, []);

    useEffect(() => {
        calculateAllUsdcValues();
    }, [userAccount, provider, reloadPriceSentinel]);

    const makePriceReload = async () => {
        console.log("#useEffect makePriceReload");
        setReloadPriceSentinel(!reloadPriceSentinel);
        console.log("##useEffect makePriceReload");
    }

    // Calculate all usdc values
    const calculateAllUsdcValues = async () => {
        console.log("#useEffect calculateAllUsdcValues");
        if (userAccount && portfolioObject && (await accountExists(connection!, portfolioObject.portfolioPDA))) {
            console.log("Going in here ..");
            let { storedPositions, usdAmount, storedPositionUsdcAmounts } = await portfolioObject.getPortfolioUsdcValue();
            setPositionValuesInUsd(storedPositionUsdcAmounts);
            setTotalPortfolioValueUsd(usdAmount);
            setPositionInfos(storedPositions);
        } else {
            console.log("Not going in here bcs: ",userAccount, portfolioObject, portfolioObject && (await accountExists(connection!, portfolioObject.portfolioPDA)) );
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
        reloadPriceSentinel,
        localTmpKeypair,
        crankRpcTool
    };

    return (
        <>
            <QPoolContext.Provider value={value}>
                {props.children}
            </QPoolContext.Provider>
        </>
    );
}
