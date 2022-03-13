import { TOKEN_LIST_URL } from "@jup-ag/core";
import { JupiterProvider, useJupiter } from "@jup-ag/react-hook";
import { MOCK } from "@qpools/sdk";
import {PublicKey, Keypair, Transaction, TransactionInstruction} from "@solana/web3.js";

import React, { useEffect, useState } from "react";

export default function JupiSwap()  {

    const ENV = "devnet";

    const [tokens, setTokens] = useState<Token[]>([]);
     const [inputMint] = useState<PublicKey>(new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")); // USDC
     const [outputMint] = useState<PublicKey>(new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB")); // USDT

    //const [inputMint] = useState<PublicKey>(new PublicKey(MOCK.DEV.SABER_USDC)); // USDC
    //const [outputMint] = useState<PublicKey>(new PublicKey(MOCK.DEV.SABER_USDT)); // USDT


    useEffect(() => {
        // Fetch token list from Jupiter API
        fetch(TOKEN_LIST_URL[ENV])
            .then(response => response.json())
            .then((result) => {setTokens(result);
                                console.log(result)
            })
            .catch(error => console.log("LOLOOLOLOLOL"))
    }, []);


    // Attach Jupiter hook
    const jupiter = useJupiter({
        amount: 1 * (10 ** 6), // raw input amount of tokens
        inputMint,
        outputMint,
        slippage: 1, // 1% slippage
        debounceTime: 250, // debounce ms time before refresh
    })

    const {
        allTokenMints, // all the token mints that is possible to be input
        routeMap, // routeMap, same as the one in @jup-ag/core
        exchange, // exchange
        refresh, // function to refresh rates
        lastRefreshTimestamp, // timestamp when the data was last returned
        loading, // loading states
        routes, // all the routes from inputMint to outputMint
        error,
    } = jupiter

    interface Token {
        chainId: number; // 101,
        address: string; // 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: string; // 'USDC',
        name: string; // 'Wrapped USDC',
        decimals: number; // 6,
        logoURI: string; // 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png',
        tags: string[]; // [ 'stablecoin' ]
    };

    const onClickSwapBestRoute = async () => {
        // Routes returned by Jupiter are always sorted by their outAmount
        // Therefore the best route is always the first route in the array
        const bestRoute = routes[0];

        await exchange({
            wallet: {
                sendTransaction: wallet.sendTransaction,
                publicKey: wallet.publicKey,
                signAllTransactions: wallet.signAllTransactions,
                signTransaction: wallet.signTransaction,
            },
            route: bestRoute,
            confirmationWaiterFactory: async (txid) => {
                console.log("sending transaction");
                await connection.confirmTransaction(txid);
                console.log("confirmed transaction");

                return await connection.getTransaction(txid, {
                    commitment: "confirmed",
                });
            },
        });

        console.log({ swapResult });

        if ("error" in swapResult) {
            console.log("Error:", swapResult.error);
        } else if ("txid" in swapResult) {
            console.log("Sucess:", swapResult.txid);
            console.log("Input:", swapResult.inputAmount);
            console.log("Output:", swapResult.outputAmount);
        }
    }

    return (
        <>
            <div style={{ fontWeight: '600', fontSize: 16, marginTop: 24 }}>Hook example</div>
            <div>Number of tokens: {tokens.length}</div>
            <div>Number of input tokens {allTokenMints.length}</div>
            <div>Possible number of routes: {routes?.length}</div>
            <div>
                {routes != undefined ?
                <>
                    Best quote: {routes ? routes[0].outAmount : ''}
                </> :
                <>
                    Nothing
                </>}
            </div>
        </>
    );

}