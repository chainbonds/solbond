/*
 * Some Example Data Structs
 */
import {Protocol, ProtocolType} from "@qpools/sdk";
import {AllocData} from "../../types/AllocData";

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