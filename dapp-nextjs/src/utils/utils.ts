import {Connection, PublicKey, Transaction} from "@solana/web3.js";
import {BN, Provider} from "@project-serum/anchor";
import {ChartableItemType} from "../types/ChartableItemType";
import {DisplayToken} from "../types/DisplayToken";
import {Protocol, ProtocolType, registry} from "@qpools/sdk";
import {lamportsReserversForLocalWallet} from "../const";

/**
 * Perhaps a really stupid object. Should prob just use the registry.ExplicitToken object.
 * Keep things simple, and the number of functions etc. low.
 */
export interface SelectedToken {
    name: string,
    mint: PublicKey
}

export const getTokenAmount = (x: BN, decimals: number) => {
    return {
        amount: x.toString(),
        decimals: decimals,
        uiAmount: Math.max(((x.toNumber() - lamportsReserversForLocalWallet) / (10 ** decimals)), 0.0),
        uiAmountString: Math.max((((x.toNumber() - lamportsReserversForLocalWallet) / (10 ** decimals)))).toString()
    };
}

export const getTokensFromPools = (selectedAssetPools: registry.ExplicitPool[]): [registry.ExplicitPool, registry.ExplicitToken][] => {
    let out: [registry.ExplicitPool, registry.ExplicitToken][] = [];
    selectedAssetPools.map((pool: registry.ExplicitPool) => {
        pool.tokens.map((token: registry.ExplicitToken) => out.push([pool, token]));
    });
    return out;
}

export const getInputTokens = async (selectedAssetPools: registry.ExplicitPool[]): Promise<[registry.ExplicitPool, registry.ExplicitToken][]> => {
    let whitelistedTokenStrings = new Set<string>(await registry.getWhitelistTokens());
    let tokensInPools = getTokensFromPools(selectedAssetPools);
    let out = tokensInPools.filter(([pool, token]: [registry.ExplicitPool, registry.ExplicitToken]) => {return whitelistedTokenStrings.has(token.address)});
    return out;
}

export const getInputToken = async (selectedAssetTokens: registry.ExplicitToken[]): Promise<SelectedToken> => {
    let whitelistedTokenStrings = new Set<string>(await registry.getWhitelistTokens());
    console.log("Whitelist tokens are: ", await registry.getWhitelistTokens());
    let filteredTokens: registry.ExplicitToken[] = selectedAssetTokens.filter((x: registry.ExplicitToken) => {
        // console.log("Looking at the token: ", x);
        console.log("Looking at the token: ", x.address);
        // return whitelistedTokens.has(new PublicKey(x.address))
        console.log("Does it have it: ", whitelistedTokenStrings.has(x.address));
        return whitelistedTokenStrings.has(x.address)
    })
    console.log("Whitelist tokens are: ", await registry.getWhitelistTokens());
    console.log("Initial set of input tokens is: ", filteredTokens);
    let inputTokens: SelectedToken[] = filteredTokens.map((x: registry.ExplicitToken) => {
        return {
            name: x.name,
            mint: new PublicKey(x.address)
        }
    })
    console.log("Input tokens are: ", inputTokens);
    // Gotta assert that at least one of the tokens is an input token:
    if (inputTokens.length < 1) {
        console.log("SelectedAssetToken: ", selectedAssetTokens);
        throw Error("Somehow this pool has no whitelisted input tokens!");
    }
    let inputToken = inputTokens[0];
    return inputToken;
}

export const displayTokensFromPool = async (pool: registry.ExplicitPool): Promise<DisplayToken[]> => {

    let displayTokens: DisplayToken[] = [];

    if (!pool) {
        return []
    }

    if (pool.protocol === Protocol.saber) {
        let displayTokenItemA: DisplayToken = {
            tokenImageLink: await registry.getIconFromToken(new PublicKey(pool.tokens[0].address)),
            tokenSolscanLink: solscanLink(new PublicKey(pool.tokens[0].address))
        };
        displayTokens.push(displayTokenItemA);
        let displayTokenItemB: DisplayToken = {
            tokenImageLink: await registry.getIconFromToken(new PublicKey(pool.tokens[1].address)),
            tokenSolscanLink: solscanLink(new PublicKey(pool.tokens[1].address))
        };
        displayTokens.push(displayTokenItemB);
    } else if (pool.protocol === Protocol.marinade) {
        let displayTokenItem: DisplayToken = {
            tokenImageLink: await registry.getIconFromToken(new PublicKey(pool.lpToken.address)),
            tokenSolscanLink: solscanLink(new PublicKey(pool.lpToken.address))
        };
        displayTokens.push(displayTokenItem);
    } else if (pool.protocol === Protocol.solend) {
        // TODO: Double check if the lp-token actually has any icon ...
        // If not, then the LP-Token was not added as an Token to the list of all possible tokens ...
        let displayTokenItem: DisplayToken = {
            tokenImageLink: await registry.getIconFromToken(new PublicKey(pool.lpToken.address)),
            tokenSolscanLink: solscanLink(new PublicKey(pool.lpToken.address))
        };
        displayTokens.push(displayTokenItem);
    } else {
        console.log("pool", pool);
        throw Error("Protocol not found" + JSON.stringify(pool));
    }

    return displayTokens;
}

export const displayTokensFromChartableAsset = async (item: ChartableItemType): Promise<DisplayToken[]> => {

    let displayTokens: DisplayToken[] = [];

    if (!item.pool) {
        return []
    }

    if (item.pool.protocol === Protocol.saber) {
        let displayTokenItemA: DisplayToken = {
            tokenImageLink: await registry.getIconFromToken(new PublicKey(item.pool.tokens[0].address)),
            tokenSolscanLink: solscanLink(new PublicKey(item.pool.tokens[0].address))
        };
        displayTokens.push(displayTokenItemA);
        let displayTokenItemB: DisplayToken = {
            tokenImageLink: await registry.getIconFromToken(new PublicKey(item.pool.tokens[1].address)),
            tokenSolscanLink: solscanLink(new PublicKey(item.pool.tokens[1].address))
        };
        displayTokens.push(displayTokenItemB);
    } else if (item.pool.protocol === Protocol.marinade) {
        let displayTokenItem: DisplayToken = {
            tokenImageLink: await registry.getIconFromToken(new PublicKey(item.pool.lpToken.address)),
            tokenSolscanLink: solscanLink(new PublicKey(item.pool.lpToken.address))
        };
        displayTokens.push(displayTokenItem);
    } else if (item.pool.protocol === Protocol.solend) {
        // TODO: Double check if the lp-token actually has any icon ...
        // If not, then the LP-Token was not added as an Token to the list of all possible tokens ...
        let displayTokenItem: DisplayToken = {
            tokenImageLink: await registry.getIconFromToken(new PublicKey(item.pool.lpToken.address)),
            tokenSolscanLink: solscanLink(new PublicKey(item.pool.lpToken.address))
        };
        displayTokens.push(displayTokenItem);
    } else {
        console.log("item.pool", item, item.pool);
        throw Error("Protocol not found" + JSON.stringify(item.pool));
    }

    return displayTokens;
}

export const solscanLink = (address: PublicKey) => {
    let out = "https://solscan.io/account/";
    out += address.toString();
    out += "?cluster=devnet";
    return out;
}

export const shortenedAddressString = (_address: PublicKey): string => {
    if (!_address) {
        console.log("WARNING: Shortening address that doesn't exist!");
        return ""
    }
    let address: string = _address.toString();
    if (address.length < 6) {
        return address
    }
    let out: string = address.substring(0, 3);
    out += "..";
    out += address.substring(address.length - 3, address.length);
    return out;
}

export const sendAndConfirmTransaction = async (
    programProvider: Provider,
    connection: Connection,
    tx: Transaction,
    // feePayer: PublicKey
) => {
    // Get blockhash
    // const blockhash = await connection.getRecentBlockhash();
    // tx.recentBlockhash = blockhash.blockhash!;
    // tx.feePayer = feePayer;
    // Assign feePayer

    // Send and Confirm
    console.log("Signing transaction...");
    console.log("About to send the following transactions: ", tx);
    console.log("Program provider is: ", programProvider, typeof programProvider);
    console.log("Sending wallet is: ", programProvider.wallet.publicKey, programProvider.wallet.publicKey.toString());
    let sg = await programProvider.send(tx);
    console.log("sg1 is: ", sg);
    await connection.confirmTransaction(sg, 'confirmed');
}
