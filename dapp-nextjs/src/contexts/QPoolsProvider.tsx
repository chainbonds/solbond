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
import {airdropAdmin, PortfolioFrontendFriendly, DisplayPortfolios} from "@qpools/sdk";
import delay from "delay";
import axios from "axios";
import {AccountOutput} from "../types/AccountOutput";
import {UsdValuePosition} from "../types/UsdValuePosition";

export interface AllocData {
    lp: string,
    weight: number,
    protocol: string,
};

export interface IQPool {
    qPoolsUser: QPoolsUser | undefined,
    qPoolsStats: QPoolsStats | undefined,
    portfolioObject: PortfolioFrontendFriendly | undefined,
    allocatedAccounts: AccountOutput[],
    positionValuesInUsd: UsdValuePosition[],
    totalPortfolioValueInUsd: number,
    initializeQPoolsUserTool: any,
    initializeQPoolsStatsTool: any,
    connection: Connection | undefined,
    displayPortfolio: DisplayPortfolios | undefined,
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
    displayPortfolio: undefined,
    allocatedAccounts: [],
    positionValuesInUsd: [],
    totalPortfolioValueInUsd: 0,
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
    const [allocatedAccounts, setAllocatedAccounts] = useState<AccountOutput[]>([]);

    const [currencyMint, setCurrencyMint] = useState<Token | undefined>(undefined);
    const [QPTokenMint, setQPTokenMint] = useState<Token | undefined>(undefined);
    const [displayPortfolio, setDisplayPortfolio] = useState<DisplayPortfolios | undefined>(undefined);
    const [positionValuesInUsd, setPositionValuesInUsd] = useState<UsdValuePosition[]>([]);
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);

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

    // Provider to get the JSON code ..

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

    // Calculate all usdc values
    const calculateAllUsdcValues = async () => {
        let usdcResponses: UsdValuePosition[] = await Promise.all(allocatedAccounts.map(async (position: AccountOutput) => {
            return getUserUsdcForPosition(position);
        }));
        setPositionValuesInUsd(usdcResponses);
        let totalPortfolioValue = 0.;
        usdcResponses.map((x) => {
            totalPortfolioValue += x.totalPositionValue;
        })
        setTotalPortfolioValueUsd(totalPortfolioValue);
    }

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

        // @ts-ignore
        let _portfolio = new PortfolioFrontendFriendly(_connection, _provider, _solbondProgram, payer);
        let newQpoolsDisplay = new DisplayPortfolios(_connection, _provider, _solbondProgram);

        // Do a bunch of setstate, and wait ...
        setConnection(() => _connection);
        setProvider(() => _provider);
        setSolbondProgram(() => _solbondProgram);
        setUserAccount(() => _userAccount);
        setCurrencyMint(() => _currencyMint);
        setPortfolioObject(() => _portfolio);
        setDisplayPortfolio(() => newQpoolsDisplay);

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
        let portfolio = await portfolioObject!.fetchPortfolio();
        let positions = await portfolioObject!.fetchAllPositions();

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

        setAllocatedAccounts(allAmounts);

        // Calculate total sum of items
        // From all accounts except the LP accounts, Collect the amounts
        let usdAmount = 0.;
        allAmounts.map((position) => {
            // If object is null, then skip!
            usdAmount += position.amountA.uiAmount!;
            usdAmount += position.amountB.uiAmount!;

            // Find a way to convert the LP amount to the real amount!
            // position.amountLp

        });
    };

    useEffect(() => {
        calculateAllUsdcValues();
    }, [allocatedAccounts]);

    useEffect(() => {
        if (userAccount && portfolioObject) {
            getPortfolioInformation();
        }
    }, [userAccount, portfolioObject]);

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
