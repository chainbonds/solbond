import {PublicKey} from "@solana/web3.js";
import {Token} from "@solana/spl-token";

// TODO: Need to have a switch between devnet and mainnet

export const BRAND_COLORS = {
    slate900: "#0f172a",
    slate700: "#334155",
    slate400: "#94a3b8",
    slate200: "#e2e8f0",
    neutral50: "#fafafa",
}

export const COLORS = [
    // "#2196f3",
    // "#f44336",
    // "#00C49F",
    // "#ffeb3b",
    // "#9c27b0",
    "#0c4a6e",
    "#831843",
    "#fbcfe8",
    "#bae6fd",
    "#94a3b8",
    "#fafafa",
    "#0369a1",
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
    '4bLkaDJ2KAcGoo3cvbdhkX87Bc9jZnmDzR9LTn2P48Vw'
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

export const TOKEN_LIST_DEVNET: TokenInfo[] = [
    {
        chainId: 101,
        address: "So11111111111111111111111111111111111111112",
        name: "Wrapped SOL",
        decimals: 9,
        symbol: "SOL",
        logoURI: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png",
    },
    // QPT Token is: Generated through the contract
    // Gotta copy paste this at a later once contract is generated
    // We should also write scripts to generate the pools etc.
    // {
    //     chainId: 102,
    //     address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    //     name: "USD Coin",
    //     decimals: 9,
    //     symbol: "USDC",
    //     logoURI: "https://raw.githubusercontent.com/trustwallet/assets/f3ffd0b9ae2165336279ce2f8db1981a55ce30f8/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
    // }
]

/**
 Based on whether we are on devnet, or on mainnet,
 gotta list different mint addresses
 */
export const getTokenList = () => {
    return TOKEN_LIST_DEVNET;
}