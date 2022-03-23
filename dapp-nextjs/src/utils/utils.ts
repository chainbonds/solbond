import {Connection, PublicKey, Transaction} from "@solana/web3.js";
import {Provider} from "@project-serum/anchor";
import {ChartableItemType} from "../types/ChartableItemType";
import {DisplayToken} from "../types/DisplayToken";
import {ProtocolType, PositionInfo, registry} from "@qpools/sdk";

export interface SelectedToken {
    name: string,
    mint: PublicKey
}
export const getInputToken = (selectedAssetTokens: registry.ExplicitToken[]): SelectedToken => {
    let whitelistedTokenStrings = new Set<string>(registry.getWhitelistTokens());
    console.log("Whitelist tokens are: ", registry.getWhitelistTokens());
    let filteredTokens: registry.ExplicitToken[] = selectedAssetTokens.filter((x: registry.ExplicitToken) => {
        // console.log("Looking at the token: ", x);
        console.log("Looking at the token: ", x.address);
        // return whitelistedTokens.has(new PublicKey(x.address))
        console.log("Does it have it: ", whitelistedTokenStrings.has(x.address));
        return whitelistedTokenStrings.has(x.address)
    })
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
        console.log("Whitelist tokens are: ", registry.getWhitelistTokens());
        console.log("SelectedAssetToken: ", selectedAssetTokens);
        throw Error("Somehow this pool has no whitelisted input tokens!");
    }
    let inputToken = inputTokens[0];
    return inputToken;
}

export const displayTokensFromPositionInfo = (position: PositionInfo): DisplayToken[] => {
    if (!position) {
        return []
    }

    let displayTokens: DisplayToken[] = [];

    if (position.protocolType === ProtocolType.DEXLP) {
        let displayTokenItemA: DisplayToken = {
            tokenImageLink: registry.getIconFromToken(position.mintA),
            tokenSolscanLink: solscanLink(position.mintA)
        };
        displayTokens.push(displayTokenItemA);
        let displayTokenItemB: DisplayToken = {
            tokenImageLink: registry.getIconFromToken(position.mintB),
            tokenSolscanLink: solscanLink(position.mintB)
        };
        displayTokens.push(displayTokenItemB);
    } else if (position.protocolType === ProtocolType.Staking) {
        let displayTokenItem: DisplayToken = {
            tokenImageLink: registry.getIconFromToken(position.mintLp),
            tokenSolscanLink: solscanLink(position.mintLp)
        };
        displayTokens.push(displayTokenItem);
    } else if (position.protocolType === ProtocolType.Lending) {
        throw Error("Where does lending come from? We haven't even implement anything in this direction!" + JSON.stringify(position));
    } else {
        throw Error("Type of borrow lending not found" + JSON.stringify(position));
    }

    return displayTokens;
}

export const displayTokensFromChartableAsset = (item: ChartableItemType): DisplayToken[] => {

    let displayTokens: DisplayToken[] = [];

    if (!item.pool) {
        return []
    }

    if (item.pool.poolType === ProtocolType.DEXLP) {
        let displayTokenItemA: DisplayToken = {
            tokenImageLink: registry.getIconFromToken(new PublicKey(item.pool.tokens[0].address)),
            tokenSolscanLink: solscanLink(new PublicKey(item.pool.tokens[0].address))
        };
        displayTokens.push(displayTokenItemA);
        let displayTokenItemB: DisplayToken = {
            tokenImageLink: registry.getIconFromToken(new PublicKey(item.pool.tokens[1].address)),
            tokenSolscanLink: solscanLink(new PublicKey(item.pool.tokens[1].address))
        };
        displayTokens.push(displayTokenItemB);
    } else if (item.pool.poolType === ProtocolType.Staking) {
        let displayTokenItem: DisplayToken = {
            tokenImageLink: registry.getIconFromToken(new PublicKey(item.pool.lpToken.address)),
            tokenSolscanLink: solscanLink(new PublicKey(item.pool.lpToken.address))
        };
        displayTokens.push(displayTokenItem);
    } else if (item.pool.poolType === ProtocolType.Lending) {
        throw Error("Where does lending come from? We haven't even implement anything in this direction!" + JSON.stringify(item));
    } else {
        throw Error("Type of borrow lending not found" + JSON.stringify(item.pool.poolType) + " helo " + JSON.stringify(item.pool));
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
