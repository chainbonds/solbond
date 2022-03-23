import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import {Token} from "@solana/spl-token";

// TODO: Need to have a switch between devnet and mainnet

export function getConnectionString(): Connection {
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

export const BRAND_COLORS = {
    slate900: "#0f172a",
    slate700: "#334155",
    slate400: "#94a3b8",
    slate200: "#e2e8f0",
    neutral50: "#fafafa",
}

export const COLORS = [
    "#0369a1",
    "#fafafa",
    "#0c4a6e",
    "#831843",
    "#fbcfe8",
    "#bae6fd",
    "#94a3b8",
];
export const RADIAN = Math.PI / 180;

export interface TokenInfo {
    readonly chainId: number;
    readonly address: string;
    readonly name: string;
    readonly decimals: number;
    readonly symbol: string;
    readonly logoURI?: string;
}
// Gotta copy the keypair and distribute this amongst all developers
export const PROGRAM_ID_SOLBOND: PublicKey = new PublicKey(
    'GLYoxwQaBhubP6xGU17aKHvxfUT4eoN3AGXNQCoeD5U8'
);

// Taken from https://docs.marinade.finance/deit velopers/contract-addresses
export const PROGRAM_ID_MARINADE: PublicKey = new PublicKey(
    'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'
);

export const SERUM_TOKEN_LIST_URL = "https://github.com/project-serum/spl-token-wallet/blob/master/src/utils/tokens/names.js"

export const TOKEN_LIST_MAINNET = [
    {
        chainId: 101,
        address: "So11111111111111111111111111111111111111112",
        name: "Wrapped SOL",
        decimals: 9,
        symbol: "SOL",
        logoURI: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png",
    },
    {
        chainId: 102,
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        name: "USD Coin",
        decimals: 9,
        symbol: "USDC",
        logoURI: "https://raw.githubusercontent.com/trustwallet/assets/f3ffd0b9ae2165336279ce2f8db1981a55ce30f8/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
    }
];

    // {
    //     chainId: 101,
    //     address: "So11111111111111111111111111111111111111112",
    //     name: "Wrapped SOL",
    //     decimals: 9,
    //     symbol: "SOL",
    //     logoURI: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png",
    // }