import React, {useState, useContext, useEffect} from 'react';
import {Provider} from "@project-serum/anchor";
import {clusterApiUrl, Connection, Keypair, PublicKey} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {solbondProgram} from "../programs/solbond";
import {WalletI} from "easy-spl";
import {QPoolsUser} from "@qpools/sdk/src/qpools-user";
import {MOCK} from "@qpools/sdk/src/const";
import {QPoolsStats} from "@qpools/sdk/lib/qpools-stats";
import {
    airdropAdmin,
    DisplayPortfolios,
    PortfolioFrontendFriendlyChainedInstructions
} from "@qpools/sdk";
import delay from "delay";
import axios from "axios";
import {AccountOutput} from "../types/AccountOutput";
import {UsdValuePosition} from "../types/UsdValuePosition";
import {registry} from "@qpools/sdk";

export interface AllocData {
    lp: string,
    weight: number,
    protocol: string,
    apy_24h: number
};

export interface IQPool {
    qPoolsUser: QPoolsUser | undefined,
    qPoolsStats: QPoolsStats | undefined,
    portfolioObject: PortfolioFrontendFriendlyChainedInstructions | undefined,
    allocatedAccounts: AccountOutput[],
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
    qPoolsUser: undefined,
    qPoolsStats: undefined,
    portfolioObject: undefined,
    displayPortfolio: undefined,
    reloadPriceSentinel: false,
    makePriceReload: () => console.log("Error not loaded yet!"),
    allocatedAccounts: [],
    positionValuesInUsd: [],
    totalPortfolioValueInUsd: 0,
    portfolioRatios: hardcodedApiResponse,
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
    const [portfolioObject, setPortfolioObject] = useState<PortfolioFrontendFriendlyChainedInstructions | undefined>(undefined);

    const [connection, setConnection] = useState<Connection | undefined>(undefined);
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [_solbondProgram, setSolbondProgram] = useState<any>(null);
    const [userAccount, setUserAccount] = useState<WalletI | undefined>(undefined);
    const [allocatedAccounts, setAllocatedAccounts] = useState<AccountOutput[]>([]);

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
    }, []);

    useEffect(() => {
        if (userAccount && portfolioObject) {
            getPortfolioInformation()
        }
    }, [userAccount, portfolioObject, reloadPriceSentinel]);

    useEffect(() => {
        calculateAllUsdcValues();
    }, [allocatedAccounts, reloadPriceSentinel]);

    const makePriceReload = async () => {
        setReloadPriceSentinel(!reloadPriceSentinel);
    }

    // Calculate all usdc values
    const calculateAllUsdcValues = async () => {
        let usdcResponses: UsdValuePosition[] = await Promise.all(allocatedAccounts.map(async (position: AccountOutput) => {
            return getUserUsdcForPosition(position);
        }));
        usdcResponses.map((x) => {console.log("USDC amounts are: ", x)})
        setPositionValuesInUsd(usdcResponses);


        let totalPortfolioValue = 0.;
        let includedMints: Set<string> = new Set();
        await Promise.all(allocatedAccounts.map(async (position: AccountOutput) => {

            // If object is null, then skip!
            if (!includedMints.has(position.mintA.toString())) {
                totalPortfolioValue += position.amountA.uiAmount!;
            }
            if (!includedMints.has(position.mintB.toString())) {
                totalPortfolioValue += position.amountB.uiAmount!;
            }

            includedMints.add(position.mintA.toString());
            includedMints.add(position.mintB.toString());


            const stableSwapState = await portfolioObject!.getPoolState(position.poolAddress);
            const {state} = stableSwapState;

            // Get Reserve A
            console.log("Token account address is: ", state.tokenA.reserve);
            let amountReserveA = (await connection!.getTokenAccountBalance(state.tokenA.reserve)).value.uiAmount;
            // Get Reserve B
            console.log("Token account address is: ", state.tokenA.reserve);
            let amountReserveB = (await connection!.getTokenAccountBalance(state.tokenB.reserve)).value.uiAmount;

            if (!amountReserveA || !amountReserveB) {
                throw Error("One of the reserve values is null!" + String(amountReserveA) + " " +  String(amountReserveB));
            }
            let supplyLpToken = (await connection!.getTokenSupply(state.poolTokenMint)).value.uiAmount;
            // Get guys' LP tokens
            let amountUserLp = position.amountLp.uiAmount;

            if (!supplyLpToken) {
                throw Error("One of the LP information values is null or zero!" + String(supplyLpToken));
            }
            // This case is totall fine, actually
            if ((!amountUserLp) && ((amountUserLp != 0))) {
                throw Error("One of the LP information values is null or zero!" + String(amountUserLp));
            }

            // I guess we can assume that the pools are unique ...
            // Calculate the exchange rate between lp tokens, and the total reserve values
            let poolContentsInUsdc = amountReserveA + amountReserveB;
            let exchangeRate = poolContentsInUsdc / supplyLpToken;
            let usdValueUserLp = amountUserLp * exchangeRate;
            totalPortfolioValue += usdValueUserLp;

        }));

        // usdcResponses.map((x) => {
        //
        //     // TODO: Gotta calculate this the hard way again, while including a set operation ...
        //     // let includedMints: Set<string> = new Set();
        //
        //
        //     totalPortfolioValue += x.totalPositionValue;
        // })
        setTotalPortfolioValueUsd(totalPortfolioValue);
    }

    const initializeQPoolsStatsTool = () => {
        console.log("InitializeQPoolsStatsTool");
        console.log("Cluster URL is: ", String(process.env.NEXT_PUBLIC_CLUSTER_URL));
        let _connection: Connection = getConnectionString();
        let _currencyMint = new Token(
            _connection,
            MOCK.DEV.SABER_USDC,
            TOKEN_PROGRAM_ID,
            // new PublicKey("HdWi7ZAt1tmWaMJgH37DMqAMqBwjzt56CtiKELBZotrc"),
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
        await delay(800);

    };

    /**
     * Right now, this is a very approximate value
     * I would assume that the true function is a bit more involved.
     */
    const getUserUsdcForPosition = async (position: AccountOutput): Promise<UsdValuePosition> => {

        // Get the pool
        console.log("Pool addresses are: ", portfolioObject!.poolAddresses);
        // Get the pool account
        console.log("Pool account is: ", position.poolAddress);
        // For the saber stableswap, get the stableswap states
        const stableSwapState = await portfolioObject!.getPoolState(position.poolAddress);
        const {state} = stableSwapState;

        // Get Reserve A
        console.log("Token account address is: ", state.tokenA.reserve);
        let amountReserveA = (await connection!.getTokenAccountBalance(state.tokenA.reserve)).value.uiAmount;
        // Get Reserve B
        console.log("Token account address is: ", state.tokenA.reserve);
        let amountReserveB = (await connection!.getTokenAccountBalance(state.tokenB.reserve)).value.uiAmount;

        if (!amountReserveA || !amountReserveB) {
            throw Error("One of the reserve values is null!" + String(amountReserveA) + " " +  String(amountReserveB));
        }
        // Convert Reserve A to it's USD value
        // Convert Reserve B to it's USD value
        // Convert to the USD currency (We can skip this step because we focus on USD stablecoins for now..)

        // Add these up, to get an idea of how much total value is in the pool
        let poolContentsInUsdc = amountReserveA + amountReserveB;

        // Now, get the total LP supply
        // Get total LP supply
        let supplyLpToken = (await connection!.getTokenSupply(state.poolTokenMint)).value.uiAmount;
        // Get guys' LP tokens
        let amountUserLp = position.amountLp.uiAmount;

        if (!supplyLpToken) {
            throw Error("One of the LP information values is null or zero!" + String(supplyLpToken));
        }
        // This case is totall fine, actually
        if ((!amountUserLp) && ((amountUserLp != 0))) {
            throw Error("One of the LP information values is null or zero!" + String(amountUserLp));
        }

        // Calculate the exchange rate between lp tokens, and the total reserve values
        let exchangeRate = poolContentsInUsdc / supplyLpToken;
        let usdValueUserLp = amountUserLp * exchangeRate;
        console.log("User portfolio value is: ", usdValueUserLp);

        // Also add the individual tokens held by that portfolio ...
        // Finally, get the user's reserves
        // Get Reserve A
        console.log("Token account address is: ", state.tokenA.reserve);
        let amountUserA = position.amountA.uiAmount;
        // Get Reserve B
        console.log("Token account address is: ", state.tokenB.reserve);
        let amountUserB = position.amountB.uiAmount;

        if ((!amountUserA && amountUserA != 0) || (!amountUserB && amountUserB != 0)) {
            throw Error("One of the reserve values is null!" + String(amountUserA) + " " +  String(amountUserB));
        }

        // Also convert here to USD,
        let usdValueUserA = amountUserA;
        let usdValueUserB = amountUserB;

        // We can skip this step, bcs again, we only use stablecoins for now
        let userPositionValue = usdValueUserA + usdValueUserB + usdValueUserLp;

        // Pick the one address, where the LP corresponds to
        // Get the exchange rate of LP per USD Value
        // Multiply guys' LP tokens by exchange rate

        // TODO: Maybe also add information on the title of the pool, etc.
        let out: UsdValuePosition = {
            totalPositionValue: userPositionValue,
            usdValueA: amountUserA,
            usdValueB: amountUserB,
            usdValueLp: usdValueUserLp
        };
        return out;
    }

    const getPortfolioInformation = async () => {
        console.log("#getPortfolioInformation()");

        if (
            !connection ||
            !userAccount ||
            !portfolioObject ||
            !portfolioObject ||
            !qPoolsUser
        ) {
            console.log("Portfolio Object not loaded yet! Gotta make sure to load it first ...")
        }

        // let [portfolioPDA, _] = await PublicKey.findProgramAddress(
        //     [this.owner.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode(SEED.PORTFOLIO_ACCOUNT))],
        //     this.solbondProgram.programId
        // );

        // Removing the fetch-portfolio is disturbing it
        // If an error arises, then just return empty stuff
        let portfolio;
        try {
            portfolio = await portfolioObject!.fetchPortfolio();
            console.log("Portfolio is: ", portfolio);
        } catch (e: any) {
            console.log("ERROR: Portfolio could not be loaded");
            console.log(JSON.stringify(e));
            return;
        }
        let positions;
        try {
            positions = await portfolioObject!.fetchAllPositions();
            console.log("All positions are: ", positions);
            positions.map((x) => {console.log(x.mintA.toString(), x.mintB.toString())})
        } catch (e: any) {
            console.log("ERROR: Positions could not be loaded");
            console.log(JSON.stringify(e));
            return;
        }

        let allAmounts = await Promise.all(positions.map(async (position: any, index: number): Promise<AccountOutput> => {
            // Get all the positions (perhaps combine this in a single get statement at some point
            let tokenAAmount = (await connection!.getTokenAccountBalance(position.ownerTokenAccountA)).value;
            let tokenBAmount = (await connection!.getTokenAccountBalance(position.ownerTokenAccountB)).value;
            let tokenLPAmount = (await connection!.getTokenAccountBalance(position.ownerTokenAccountLp)).value;

            // Also add pool address to this
            // Perhaps also get the stableswap state ? Probably cleaner if we get this in retrospect
            return {
                index: index,
                poolAddress: portfolioObject!.poolAddresses[index],
                owner: position.owner,
                // portfolio: portfolioPDA,
                positionPda: position.poolPda,
                mintA: position.mintA,
                ataA: position.ownerTokenAccountA,
                amountA: tokenAAmount,
                mintB: position.mintB,
                ataB: position.ownerTokenAccountB,
                amountB: tokenBAmount,
                mintLp: position.mintLp,
                ataLp: position.ownerTokenAccountLp,
                amountLp: tokenLPAmount
            }

        }));

        console.log("All fetched data is: ");
        allAmounts = allAmounts.sort((a: AccountOutput, b: AccountOutput) => {
            return Number(a.ataLp.toBytes());
        })
        console.log("All elements are: ");
        allAmounts.forEach((x: any) => {
            console.log(x);
        });

        console.log("Setting allocated accounts: ", allAmounts);
        setAllocatedAccounts(allAmounts);

        // Calculate total sum of items
        // From all accounts except the LP accounts, Collect the amounts
        let usdAmount = 0.;
        // TODO: This set things is not quite working!!!
        let includedMints: Set<string> = new Set();
        allAmounts.map((position) => {

            // TODO: Gotta skip Mint's that have been added already.
            //  gotta create a set here and skip mints that have already counted towards the balance!

            // If object is null, then skip!
            if (!includedMints.has(position.mintA.toString())) {
                usdAmount += position.amountA.uiAmount!;
            }
            if (!includedMints.has(position.mintB.toString())) {
                usdAmount += position.amountB.uiAmount!;
            }

            includedMints.add(position.mintA.toString());
            includedMints.add(position.mintB.toString());

            // Find a way to convert the LP amount to the real amount!
            // position.amountLp

        });
        console.log("##getPortfolioInformation()");
    };

    const value: IQPool = {
        qPoolsUser,
        qPoolsStats,
        portfolioObject,
        initializeQPoolsUserTool,
        initializeQPoolsStatsTool,
        portfolioRatios,
        allocatedAccounts,
        positionValuesInUsd,
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
