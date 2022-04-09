import {Connection, PublicKey, TokenAmount, Transaction} from "@solana/web3.js";
import {BN, Provider} from "@project-serum/anchor";
import {lamportsReserversForLocalWallet} from "../const";
import * as qpools from "@qpools/sdk";

/**
 * Perhaps a really stupid object. Should prob just use the registry.ExplicitToken object.
 * Keep things simple, and the number of functions etc. low.
 */
export interface SelectedToken {
    name: string,
    mint: PublicKey
}

// TODO: The usage of this is ambigious. I need to chase these bugs everywhere!!!
// TODO: Write tests for this stupid shit ...
/**
 *
 * @param x The big-number that should be written into a tokenAmountNumber. Should be lamports, and include decimals!
 *  This cannot be negative
 * @param decimals
 */
export const getTokenAmount = (x: BN, decimals: BN): TokenAmount => {
    let decimalsAsNumber = decimals.toNumber();
    let decimalExpanded = (new BN(10)).pow(decimals);
    let uiAmount = Math.max(x.toNumber() / decimalExpanded.toNumber(), 0.0);
    return {
        amount: x.toString(),
        decimals: decimalsAsNumber,
        uiAmount: uiAmount,
        uiAmountString: uiAmount.toString()
    };
}

// export const getTokenAmount = (x: BN, decimals: BN): TokenAmount => {
//     let decimalAsPower = (new BN(10)).pow(decimals);
//     let uiAmountBN = BN.max(((x.mul(decimalAsPower).sub(lamportsReserversForLocalWallet))), new BN(0.0));
//     let uiAmount = uiAmountBN.toString(); // Add a dot at the decimal point ...
//     uiAmount = uiAmount.substring(0, uiAmount.length - decimals.toNumber()) + "." + uiAmount.substring(uiAmount.length - decimals.toNumber(), uiAmount.length);
//     return {
//         amount: x.toString(),
//         decimals: decimals.toNumber(),
//         uiAmount: Number(uiAmount),
//         uiAmountString: uiAmount.toString()
//     };
// }

export const getTokensFromPools = (selectedAssetPools: qpools.typeDefinitions.interfacingAccount.ExplicitPool[]): [qpools.typeDefinitions.interfacingAccount.ExplicitPool, qpools.typeDefinitions.interfacingAccount.ExplicitToken][] => {
    let out: [qpools.typeDefinitions.interfacingAccount.ExplicitPool, qpools.typeDefinitions.interfacingAccount.ExplicitToken][] = [];
    selectedAssetPools.map((pool: qpools.typeDefinitions.interfacingAccount.ExplicitPool) => {
        pool.tokens.map((token: qpools.typeDefinitions.interfacingAccount.ExplicitToken) => out.push([pool, token]));
    });
    return out;
}

export const getInputTokens = async (selectedAssetPools: qpools.typeDefinitions.interfacingAccount.ExplicitPool[]): Promise<[qpools.typeDefinitions.interfacingAccount.ExplicitPool, qpools.typeDefinitions.interfacingAccount.ExplicitToken][]> => {
    let whitelistedTokenStrings = new Set<string>(await qpools.constDefinitions.getWhitelistTokens());
    let tokensInPools = getTokensFromPools(selectedAssetPools);
    let out = tokensInPools.filter(([pool, token]: [qpools.typeDefinitions.interfacingAccount.ExplicitPool, qpools.typeDefinitions.interfacingAccount.ExplicitToken]) => {return whitelistedTokenStrings.has(token.address)});
    return out;
}

export const getInputToken = async (selectedAssetTokens: qpools.typeDefinitions.interfacingAccount.ExplicitToken[]): Promise<SelectedToken> => {
    let whitelistedTokenStrings = new Set<string>(await qpools.constDefinitions.getWhitelistTokens());
    console.log("Whitelist tokens are: ", await qpools.constDefinitions.getWhitelistTokens());
    let filteredTokens: qpools.typeDefinitions.interfacingAccount.ExplicitToken[] = selectedAssetTokens.filter((x: qpools.typeDefinitions.interfacingAccount.ExplicitToken) => {
        // console.log("Looking at the token: ", x);
        console.log("Looking at the token: ", x.address);
        // return whitelistedTokens.has(new PublicKey(x.address))
        console.log("Does it have it: ", whitelistedTokenStrings.has(x.address));
        return whitelistedTokenStrings.has(x.address)
    })
    console.log("Whitelist tokens are: ", await qpools.constDefinitions.getWhitelistTokens());
    console.log("Initial set of input tokens is: ", filteredTokens);
    let inputTokens: SelectedToken[] = filteredTokens.map((x: qpools.typeDefinitions.interfacingAccount.ExplicitToken) => {
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
    if (qpools.network.getNetworkCluster() === qpools.network.Cluster.DEVNET) {
        out += "?cluster=devnet";
    }
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
