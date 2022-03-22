import React, {useState, useContext, useEffect} from 'react';
import {Provider} from "@project-serum/anchor";
import {clusterApiUrl, Connection, Keypair, PublicKey, TokenAmount} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {solbondProgram} from "../programs/solbond";
import {WalletI} from "easy-spl";
import {
    airdropAdmin,
    DisplayPortfolios,
    PortfolioFrontendFriendlyChainedInstructions
} from "@qpools/sdk";
import delay from "delay";
import axios from "axios";
import {registry, accountExists} from "@qpools/sdk";
import {PositionInfo, CrankRpcCalls} from "@qpools/sdk";
import {getAssociatedTokenAddressOffCurve} from "@qpools/sdk/lib/utils";
import {tokenAccountExists, MOCK, ProtocolType} from "@qpools/sdk";
import {purple} from "@mui/material/colors";
import {Property} from "csstype";
import All = Property.All;

export interface AllocData {
    lp: string,
    weight: number,
    protocol: string,
    apy_24h: number,
    pool?: registry.ExplicitPool
};

export interface IQPool {
    portfolioObject: PortfolioFrontendFriendlyChainedInstructions | undefined,
    positionInfos: PositionInfo[],
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
    localTmpKeypair: Keypair | undefined,
    crankRpcTool: CrankRpcCalls | undefined,
    walletAmountUsdc: number,
    walletAmountSol: number
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
    displayPortfolio: undefined,
    reloadPriceSentinel: false,
    makePriceReload: () => console.log("Error not loaded yet!"),
    initializeQPoolsUserTool: () => console.log("Error not loaded yet!"),
    initializeQPoolsStatsTool: () => console.log("Error not loaded yet!"),
    positionInfos: [],
    totalPortfolioValueInUsd: 0,
    portfolioRatios: hardcodedApiResponse,
    connection: undefined,
    provider: undefined,
    _solbondProgram: () => console.error("attempting to use AuthContext outside of a valid provider"),
    userAccount: undefined,
    currencyMint: undefined,
    localTmpKeypair: undefined,
    crankRpcTool: undefined,
    walletAmountUsdc: 0,
    walletAmountSol: 0
}

const QPoolContext = React.createContext<IQPool>(defaultValue);

export function useQPoolUserTool() {
    return useContext(QPoolContext);
}

function getConnectionString(): Connection {
    let _connection;
    let clusterName = String(process.env.NEXT_PUBLIC_CLUSTER_NAME);
    console.log("Cluster name is: ", clusterName);
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
    const [crankRpcTool, setCrankRpcTool] = useState<CrankRpcCalls | undefined>();
    const [localTmpKeypair, setLocalTmpKeypair] = useState<Keypair | undefined>();

    /**
     * App-dependent variables
     */
    const [positionInfos, setPositionInfos] = useState<PositionInfo[]>([]);
    const [currencyMint, setCurrencyMint] = useState<Token | undefined>(undefined);
    const [displayPortfolio, setDisplayPortfolio] = useState<DisplayPortfolios | undefined>(undefined);
    const [totalPortfolioValueInUsd, setTotalPortfolioValueUsd] = useState<number>(0.);
    const [reloadPriceSentinel, setReloadPriceSentinel] = useState<boolean>(false);
    const [portfolioRatios, setPortfolioRatios] = useState<AllocData[]>(hardcodedApiResponse);

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

    //--------------------------------------------------------   

    const [walletAmountUsdc, setWalletAmountUsdc] = useState<number>(0.);
    const [walletAmountSol, setWalletAmountSol] = useState<number>(0.);

    const solanaPrice = 90;

    // TODO: Calculate the total amount balances ...
    // Probably first get all the user's account balances from the wallet
    // And then look for where to possible deposit these
    // const mapFromWalletAssetIntoPhantomWallet = async (position: AllocData) => {
    //
    //     // Check if user has one of these tokens
    //     if (userAccount) {
    //         await connection!.getTokenAccountsByOwner(userAccount!.publicKey, );
    //     }
    //     // position.pool.tokens
    //     return connection!.getTokenAccountBalance().then((x) => {x.value.uiAmount!});
    // }

    const updateTheRatiosAfterConnecting = async () => {

        // get all the serpius assets
        // for all the serpius assets, get the pools in the registry
        // for all the pools in the registry, get the tokens that you can input it as
        // EDGE-CASE: wrapped SOLANA (we need to find a way to define marinade SOL input)

        // get user associated token accounts
        // connection!.getTokenAccountsByOwner(userAccount);

        // get the mints of these associated token accounts

        // for all of the mints

        // getPoolByToken to get a list of all pools we could be investing in

        // AND
        // filter by whatever our portfolio recommender has recommended

        // THEN
        // set the weight (for display) equal to the USDC value of the user in his wallet

        interface UserTokenBalance {
            mint: PublicKey,
            ata: PublicKey,
            amount: TokenAmount
        }
        interface EnrichedAllocData extends AllocData {
            userInputAmount: UserTokenBalance
        }
        let newAllocData: EnrichedAllocData[] = [];

        // (1) Get all token accounts owned that we get from the serpius API ...
        // .filter((item, index) => {return portfolioRatios.indexOf(item) === index})
        // TODO: Remove duplicates with this filter ...
        await Promise.all(portfolioRatios.map(async (fetchedPool: AllocData) => {
            console.log("Iterating through pool: ", fetchedPool)

            // Now we have the pool
            // When are the tokens not defined ...
            let tokens: registry.ExplicitToken[] | undefined = fetchedPool.pool?.tokens;
            if (!tokens) {
                return;
            }
            await Promise.all(tokens.map(async (token: registry.ExplicitToken) => {

                // Do a whitelist here which assets we accept ...
                if (registry.getWhitelistTokens().filter((x: string) => x === token.address).length === 0) {
                    return
                }

                console.log("Iterating through token: ", token);
                let mint: PublicKey = new PublicKey(token.address);
                let ata = await getAssociatedTokenAddressOffCurve(mint, userAccount!.publicKey);
                // Finally get the users' balance
                // Let's assume that if the token is wrapped solana, that we can also include the pure solana into this .
                let userBalance: TokenAmount = (await connection!.getTokenAccountBalance(ata)).value;
                if (mint.equals(new PublicKey("So11111111111111111111111111111111111111112"))) {
                    // TODO: refactor this into a util function or so ...
                    // This is quite hacky. How do we treat the wrapping / unrapping for this?
                    // Probably something like a transformer function would be nice for different protocols,
                    // i.e. for marinade it could turn the unwrapped SOL into wrapped SOL or so .. and then unwrap it again.
                    // the user would have to sign for this so it's not entirely feasible
                    let solBalance: number = (await connection!.getBalance(userAccount!.publicKey));
                    userBalance = {
                        amount: userBalance.amount + (await connection!.getBalance(userAccount!.publicKey)),
                        decimals: 9,
                        uiAmount: (userBalance.uiAmount! + (solBalance / (10**9)))
                    };
                }
                let newPool: EnrichedAllocData = {
                    ...fetchedPool,
                    userInputAmount: {
                        mint: mint,
                        ata: ata,
                        amount: userBalance
                    }
                }
                // also overwrite the weight to be the user's estimated USDC balance for this token ...
                // convert by pyth price, maybe
                // Convert by pyth price,
                // for now, hardcoding is enough, because we haven't started converting by the pyth price yet ...
                if (newPool.userInputAmount.mint.equals(new PublicKey("So11111111111111111111111111111111111111112"))) {
                    newPool.weight = newPool.userInputAmount.amount.uiAmount! * 93.;
                } else {
                    console.log("Assuming USDC...");
                    newPool.weight = newPool.userInputAmount.amount.uiAmount!;
                }
                console.log("Pushing object: ", newPool);
                newAllocData.push(newPool);
            }));
        }));

        setPortfolioRatios((_: AllocData[]) => {
            return newAllocData;
        });

        // TODO: Also, add the native (not wrapped) SOL as a special case
        // Add native SOL here ...
        // Should add mint as null maybe, for native sol? or add an empty pubkey (?)
        // EnrichedAllocData = {
        //     ...fetchedPool,
        //     userInputAmount: {
        //         mint: mint,
        //         ata: ata,
        //         amount: userBalance
        //     }
        // }







        // // Now we can push this to be the new ratios ...
        //
        // setPortfolioRatios((oldPortfolioRatios: AllocData[] | null) => {
        //
        //     // for each of the oldRatios, get the
        //     // For now, set the weight to the user's balance ...
        //     // TODO: Gotta create a mapping from user's assets to the tokens
        //     // I guess for now an if-else case distinction is enough
        //     if (oldPortfolioRatios) {
        //         // And I guess for now these are all the tokens that we are looking into
        //         let newPortfolioRatios = oldPortfolioRatios.map((_: AllocData) => {
        //
        //
        //             // if (!oldRatios.pool) {
        //             //     return;
        //             // }
        //             //
        //             // let newRatios: AllocData = {...oldRatios};
        //             // // whatever the old-ratio's mint corresponds to, pick it from the
        //             //
        //             // // This case-distinction is really not by pool type, but rather purely by the underlying tokens ...
        //             // // The underlying tokens are defined by whatever tokens are included in the "tokens" array
        //             // return connection!.getTokenAccountBalance().then((x) => {x.value.uiAmount!});
        //             //
        //             // // // TODO: Also gotta make a case distinction here as well,
        //             // // //  as to whether the pool we're looking at is a DEX, or a token
        //             // // //  We also should add a whitelist for "allowed tokens", tokens that we will consider in the user's wallet
        //             // // if (oldRatios.pool!.poolType === ProtocolType.DEXLP) {
        //             // //
        //             // //     // TODO: Also make a case distinction by the type of token we can pay in
        //             // //     // TODO: I guess for now I will also hard-code this
        //             // //
        //             // //     // TODO: Do a map-filter, and select anything that has the same type of mint ...
        //             // //     // newRatios.weight =
        //             // //
        //             // //
        //             // // } else if (oldRatios.pool!.poolType === ProtocolType.Staking) {
        //             // //
        //             // // } else if (oldRatios.pool!.poolType === ProtocolType.Lending) {
        //             // //
        //             // // } else {
        //             // //     throw Error("PoolType is not valid! " + JSON.stringify(oldRatios));
        //             // // }
        //             //
        //             // // if (oldRatios.pool!.lpToken.address === MOCK.DEV.SABER_USDC) {
        //             // // } else if (oldRatios.pool!.lpToken.address === MOCK.DEV.) {
        //             // // }
        //
        //         });
        //     }
        //
        //     // let oldRatios = portfolioRatios!;
        //     // console.log("Old Ratios are: ", oldRatios);
        //     // console.log("PortfolioRatios are: ", portfolioRatios);
        //     // oldRatios[0].weight = walletAmountUsdc;
        //     // oldRatios[1].weight = walletAmountSol;
        //     // console.log("wallet Amount USDC : ", walletAmountUsdc);
        //     // console.log("wallet Amount SOL : ", walletAmountSol);
        //     // console.log("THE CHART SHOULD UPDATE-----------------------------------------------");
        //     // console.log(oldRatios);
        //
        //     return oldPortfolioRatios;
        // });
    }

    useEffect(() => {
        updateAccountBalance(MOCK.DEV.SABER_USDC, setWalletAmountUsdc);
        updateSolBalance();
        updateTheRatiosAfterConnecting();
    }, [reloadPriceSentinel, userAccount, connection]);


    useEffect(() => {
        updateTheRatiosAfterConnecting()

    }, [walletAmountUsdc, walletAmountSol])

    const updateAccountBalance = async (mintAddress: PublicKey, setAmountFunction: any) => {
        console.log("#useEffect UserInfoBalance");
        if (connection && userAccount) {
            // Get the associated token account
            console.log("Getting associated token account")
            let userCurrencyAta: PublicKey = await getAssociatedTokenAddressOffCurve(
                mintAddress, userAccount.publicKey
            )
            let existsBool = await tokenAccountExists(connection!, userCurrencyAta);
            console.log("User ATA: ", userCurrencyAta.toString(), existsBool);
            if (existsBool) {
                console.log("Exists!");
                // Check if this account exists, first of all
                let x = await connection!.getTokenAccountBalance(userCurrencyAta);
                if (x.value && x.value.uiAmount) {
                    console.log("Balance is: ", x.value);
                    setAmountFunction(x.value.uiAmount!);
                } else {
                    console.log("ERROR: Something went wrong unpacking the balance!");
                }
                console.log("Done fetching");
            } else {
                console.log("Account doesn't exist yet");
            }
        }
        console.log("##useEffect UserInfoBalance");
    }


    const updateSolBalance = async () => {
        if (connection) {
            let x = await connection!.getBalance(userAccount!.publicKey);
            setWalletAmountSol(x * solanaPrice / 1000000000);
        } else {
            "LOLVELEEEEEEEEL"
        }
    }

    useEffect(() => {
    }, [userAccount, connection]);
    //--------------------------------------------------------------------------------
    /**
     * Everytime there is a change in the Keypair, create a
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
    // const runCrankInBackground = async () => {
    //     // Check
    //     if (await accountExists(connection!, crankRpcTool!.portfolioPDA)) {
    //         await crankRpcTool!.fullfillAllPermissionless();
    //         await makePriceReload();
    //     }
    // }
    // useEffect(() => {
    //     if (crankRpcTool) {
    //         runCrankInBackground();
    //     }
    // },[crankRpcTool]);

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
            // let response = await axios.get<any>(getSerpiusEndpoint());
            let response = await axios.get<any>(registry.getSerpiusEndpoint());
            console.log("Here is the data :");
            console.log(typeof response.data);
            console.log(JSON.stringify(response.data));
            console.log("Next!?");

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
                        console.log("data lp is: ", dataItem.lp);

                        // For a quick fix, rename the UST-USDC to USDC-USDT
                        // TODO: Remove for devnet ...
                        if (dataItem.lp === "UST-USDC") {
                            dataItem.lp = "USDC-USDT"
                        } else if (dataItem.lp === "mSOL") {
                            dataItem.lp = "marinade"
                        }

                        dataItem.pool = registry.getPoolFromSplStringId(dataItem.lp);
                        console.log("data item is", dataItem)
                        return dataItem;
                    });

                    console.log("Updating new portfolio ratios ...");



                    // HARDCODED DATA BELOW !!!!! SHOULD BE DELETED EVENTAULLY
                    // newData[0].lp = "USDC-USDT"
                    // newData[1].lp = "USDC-CASH"
                    // console.log("Returning new data to be: ", newData);
                    // console.log("Active pools", registry.getActivePools());
                    // newData[0].pool = registry.getPoolFromSplStringId("rUSDC-USDT")
                    // newData[1].pool = registry.getPoolFromSplStringId("USDC-CASH")
                    // let temp = newData[1]
                    // newData[1] = newData[2]
                    // newData[2] = temp
                    // console.log("Returning new data to be: ", newData);

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
            let {storedPositions, usdAmount, storedPositionUsdcAmounts} = await portfolioObject.getPortfolioUsdcValue();
            // setPositionValuesInUsd(storedPositionUsdcAmounts);
            setTotalPortfolioValueUsd(usdAmount);
            setPositionInfos(storedPositions);
        } else {
            console.log("Not going in here bcs: ", userAccount, portfolioObject, portfolioObject && (await accountExists(connection!, portfolioObject.portfolioPDA)));
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
        // positionValuesInUsd,
        initializeQPoolsUserTool,
        initializeQPoolsStatsTool,
        totalPortfolioValueInUsd,
        displayPortfolio,
        connection,
        provider,
        _solbondProgram,
        userAccount,
        currencyMint,
        makePriceReload,
        reloadPriceSentinel,
        localTmpKeypair,
        crankRpcTool,
        walletAmountUsdc,
        walletAmountSol
    };

    return (
        <>
            <QPoolContext.Provider value={value}>
                {props.children}
            </QPoolContext.Provider>
        </>
    );
}
