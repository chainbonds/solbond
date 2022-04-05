import {ExplicitPool, Protocol, Registry} from "@qpools/sdk";
import {DisplayToken} from "../types/DisplayToken";
import {solscanLink} from "./utils";
import {PublicKey} from "@solana/web3.js";
import {BN} from "@project-serum/anchor";

export const absoluteDiff = async (a: BN, b: BN): Promise<BN> => {
    if (a.gt(b)) {
        return a.sub(b);
    } else if (a.lt(b)) {
        return b.sub(a);
    } else {
        return a.sub(b);
    }
}

export const displayTokensFromPool = async (pool: ExplicitPool, registry: Registry): Promise<DisplayToken[]> => {

    let displayTokens: DisplayToken[] = [];

    if (!pool) {
        return []
    }

    if (pool.protocol === Protocol.saber) {
        let displayTokenItemA: DisplayToken = {
            tokenImageLink: await registry.getIconUriFromToken(pool.tokens[0].address),
            tokenSolscanLink: solscanLink(new PublicKey(pool.tokens[0].address))
        };
        displayTokens.push(displayTokenItemA);
        let displayTokenItemB: DisplayToken = {
            tokenImageLink: await registry.getIconUriFromToken(pool.tokens[1].address),
            tokenSolscanLink: solscanLink(new PublicKey(pool.tokens[1].address))
        };
        displayTokens.push(displayTokenItemB);
    } else if (pool.protocol === Protocol.marinade) {
        let displayTokenItem: DisplayToken = {
            tokenImageLink: await registry.getIconUriFromToken(pool.lpToken.address),
            tokenSolscanLink: solscanLink(new PublicKey(pool.lpToken.address))
        };
        displayTokens.push(displayTokenItem);
    } else if (pool.protocol === Protocol.solend) {
        // TODO: Double check if the lp-token actually has any icon ...
        // If not, then the LP-Token was not added as an Token to the list of all possible tokens ...
        let displayTokenItem: DisplayToken = {
            tokenImageLink: await registry.getIconUriFromToken(pool.lpToken.address),
            tokenSolscanLink: solscanLink(new PublicKey(pool.lpToken.address))
        };
        displayTokens.push(displayTokenItem);
    } else {
        console.log("pool", pool);
        throw Error("Protocol not found" + JSON.stringify(pool));
    }

    return displayTokens;
}