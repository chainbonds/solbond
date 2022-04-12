import * as qpools from "@qpools/sdk";
import {DisplayToken} from "../types/DisplayToken";
import {solscanLink} from "./utils";
import {PublicKey} from "@solana/web3.js";
import {BN} from "@project-serum/anchor";

export const displayTokensFromPool = async (pool: qpools.typeDefinitions.interfacingAccount.ExplicitPool, registry: qpools.helperClasses.Registry): Promise<DisplayToken[]> => {

    let displayTokens: DisplayToken[] = [];

    if (!pool) {
        return []
    }

    if (pool.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.saber.valueOf()) {
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
    } else if (pool.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.marinade.valueOf()) {
        let displayTokenItem: DisplayToken = {
            tokenImageLink: await registry.getIconUriFromToken(pool.lpToken.address),
            tokenSolscanLink: solscanLink(new PublicKey(pool.lpToken.address))
        };
        displayTokens.push(displayTokenItem);
    } else if (pool.protocol.valueOf() === qpools.typeDefinitions.interfacingAccount.Protocol.solend.valueOf()) {
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