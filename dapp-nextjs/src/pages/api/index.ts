import {NextApiRequest, NextApiResponse} from "next";
import * as qpools from "@qpools/sdk";

export default async (req: NextApiRequest, res: NextApiResponse) => {

    // Load and serve the registry
    let registry = new qpools.helperClasses.Registry();
    // Load the registry items

    let tokens = await registry.getAllTokens();
    let pools = await registry.getAllPools();

    tokens = tokens.map((x: qpools.typeDefinitions.interfacingAccount.ExplicitToken) => {
        let token: qpools.typeDefinitions.interfacingAccount.ExplicitToken = {
            address: x.address,
            decimals: x.decimals,
            logoURI: x.logoURI,
            name: x.name,
            symbol: x.symbol
        }
        return token;
    });

    pools = pools.map((x: qpools.typeDefinitions.interfacingAccount.ExplicitPool) => {
        let lpToken: qpools.typeDefinitions.interfacingAccount.ExplicitToken = {
            address: x.lpToken.address,
            decimals: x.lpToken.decimals,
            logoURI: x.lpToken.logoURI,
            name: x.lpToken.name,
            symbol: x.lpToken.name
        }
        // Also write in the tokens back ...
        let tokens: qpools.typeDefinitions.interfacingAccount.ExplicitToken[] = x.tokens.map((x: qpools.typeDefinitions.interfacingAccount.ExplicitToken) => {
            let token: qpools.typeDefinitions.interfacingAccount.ExplicitToken = {
                address: x.address,
                decimals: x.decimals,
                logoURI: x.logoURI,
                name: x.name,
                symbol: x.symbol
            }
            return token;
        })
        let out: qpools.typeDefinitions.interfacingAccount.ExplicitPool = {
            id: x.id,
            name: x.name,
            protocol: x.protocol,
            protocolType: x.protocolType,
            lpToken: lpToken,
            tokens: tokens
        }
        return out;
    });

    res.status(200).json({
        "pools": pools,
        "tokens": tokens
    })
}