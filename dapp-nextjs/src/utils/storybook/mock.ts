/*
 * Some Example Data Structs
 */
import {Protocol, ProtocolType} from "@qpools/sdk";
import {AllocData} from "../../types/AllocData";
import {DisplayToken} from "../../types/DisplayToken";
import {DisplayProtocol} from "../../types/DisplayProtocol";

export const tokens: DisplayToken[] = [
    {
        name: "Bitcoin",
        tokenSolscanLink: "https://solscan.io/token/3os2M3bX9qta154PRbU9rzaPUYAKAqVpaMMS8u2hoUQu",
        tokenImageLink: "https://bitcoin.org/img/icons/opengraph.png?1652976465"
    },
    {
        name: "Solana",
        tokenSolscanLink: "https://solscan.io/token/So11111111111111111111111111111111111111112",
        tokenImageLink: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/So11111111111111111111111111111111111111112.png"
    },
    {
        name: "STEP-N",
        tokenImageLink: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/6156vEwBw11hGF6rkr3um5RPNWfBCYBFH7XcbEF47erH/logo.png",
        tokenSolscanLink: "https://solscan.io/token/6156vEwBw11hGF6rkr3um5RPNWfBCYBFH7XcbEF47erH"
    },
    {
        name: "USDC",
        tokenImageLink: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        tokenSolscanLink: "https://solscan.io/token/EmXq3Ni9gfudTiyNKzzYvpnQqnJEMRw2ttnVXoJXjLo1"
    }
];

export const protocols: DisplayProtocol[] = [
    {
        name: "Solend",
        protocolSolscanLink: "https://solscan.io/token/5h6ssFpeDeRbzsEHDbTQNH7nVGgsKrZydxdSTnLm6QdV",
        protocolImageLink: "https://styles.redditmedia.com/t5_4lbiz1/styles/communityIcon_sx32xpc658971.png?width=256&s=b5b066c0f10ca1dc82351df5726e809ba52da2c2"
    },
    {
        name: "Marinade",
        protocolSolscanLink: "https://solscan.io/token/MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey",
        protocolImageLink: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey/logo.png"
    },
    {
        name: "Orca",
        protocolSolscanLink: "https://solscan.io/token/orcarKHSqC5CDDsGbho8GKvwExejWHxTqGzXgcewB9L",
        protocolImageLink: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png"
    },
    {
        name: "Raydium",
        protocolSolscanLink: "https://solscan.io/token/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        protocolImageLink: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png"
    }
];

export const exampleAllocData: Array<[string, AllocData]> = [
    [
        "marinade SOL",
        {
            lpIdentifier: "mSOL",  /// this is a key
            // Should include weights here
            weight: 5.5,
            protocol: Protocol.marinade,
            apy_24h: 6.4,
            // Should include the input token here
            // Can have multiple ones with the same pool, then
            pool: {
                id: "pool id",
                name: "pool name",
                protocol: Protocol.saber,
                protocolType: ProtocolType.Staking,
                lpToken: {
                    address: "DR24p77mSc9HDUjZjkwz9RDjSd7uQsziqtfKtdoBB6kR",
                    decimals: 6,
                    logoURI: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk.png",
                    name: "Marinade SOL",
                    symbol: "mSOL",
                },
                tokens: [{
                    address: "DR24p77mSc9HDUjZjkwz9RDjSd7uQsziqtfKtdoBB6kR",
                    decimals: 6,
                    logoURI: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk.png",
                    name: "Marinade SOL",
                    symbol: "mSOL",
                }]
            },
            usdcAmount: 10.3
        },
    ],
    [
        "Solend SOL",
        {
            lpIdentifier: "solend-SOL",  /// this is a key
            // Should include weights here
            weight: 10.5,
            protocol: Protocol.solend,
            apy_24h: 3.4,
            // Should include the input token here
            // Can have multiple ones with the same pool, then
            pool: {
                id: "pool id",
                name: "pool name",
                protocol: Protocol.saber,
                protocolType: ProtocolType.Staking,
                lpToken: {
                    address: "DR24p77mSc9HDUjZjkwz9RDjSd7uQsziqtfKtdoBB6kR",
                    decimals: 6,
                    logoURI: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm.png",
                    name: "Solend SOL",
                    symbol: "solend SOL",
                },
                tokens: [{
                    address: "DR24p77mSc9HDUjZjkwz9RDjSd7uQsziqtfKtdoBB6kR",
                    decimals: 6,
                    logoURI: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm.png",
                    name: "Solend SOL",
                    symbol: "solend SOL",
                }]
            },
            usdcAmount: 40.3
        },
    ]
]