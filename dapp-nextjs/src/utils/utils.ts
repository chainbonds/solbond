import {Connection, PublicKey, Transaction} from "@solana/web3.js";
import {BN, Provider} from "@project-serum/anchor";
import {lamportsReserversForLocalWallet} from "../const";
import {ExplicitPool} from "@qpools/sdk";
import {ExplicitToken} from "@qpools/sdk";
import {getWhitelistTokens} from "@qpools/sdk";

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

export const getTokensFromPools = (selectedAssetPools: ExplicitPool[]): [ExplicitPool, ExplicitToken][] => {
    let out: [ExplicitPool, ExplicitToken][] = [];
    selectedAssetPools.map((pool: ExplicitPool) => {
        pool.tokens.map((token: ExplicitToken) => out.push([pool, token]));
    });
    return out;
}

export const getInputTokens = async (selectedAssetPools: ExplicitPool[]): Promise<[ExplicitPool, ExplicitToken][]> => {
    let whitelistedTokenStrings = new Set<string>(await getWhitelistTokens());
    let tokensInPools = getTokensFromPools(selectedAssetPools);
    let out = tokensInPools.filter(([pool, token]: [ExplicitPool, ExplicitToken]) => {return whitelistedTokenStrings.has(token.address)});
    return out;
}

export const getInputToken = async (selectedAssetTokens: ExplicitToken[]): Promise<SelectedToken> => {
    let whitelistedTokenStrings = new Set<string>(await getWhitelistTokens());
    console.log("Whitelist tokens are: ", await getWhitelistTokens());
    let filteredTokens: ExplicitToken[] = selectedAssetTokens.filter((x: ExplicitToken) => {
        // console.log("Looking at the token: ", x);
        console.log("Looking at the token: ", x.address);
        // return whitelistedTokens.has(new PublicKey(x.address))
        console.log("Does it have it: ", whitelistedTokenStrings.has(x.address));
        return whitelistedTokenStrings.has(x.address)
    })
    console.log("Whitelist tokens are: ", await getWhitelistTokens());
    console.log("Initial set of input tokens is: ", filteredTokens);
    let inputTokens: SelectedToken[] = filteredTokens.map((x: ExplicitToken) => {
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
