import {NextApiRequest, NextApiResponse} from "next";
import {Registry} from "@qpools/sdk/src/frontend-friendly";
import {getConnection} from "../../../const";
import {ExplicitToken, ExplicitPool} from "@qpools/sdk/src/types/interfacing";

export default async (req: NextApiRequest, res: NextApiResponse) => {

    // Load and serve the registry
    const connection = getConnection();
    let registry = new Registry(connection);
    // Load the registry items

    let tokens = await registry.getAllTokens();
    let pools = await registry.getAllPools();

    tokens = tokens.map((x: ExplicitToken) => {
        let token: ExplicitToken = {
            address: x.address,
            decimals: x.decimals,
            logoURI: x.logoURI,
            name: x.name,
            symbol: x.symbol
        }
        return token;
    });

    pools = pools.map((x: ExplicitPool) => {
        let lpToken: ExplicitToken = {
            address: x.lpToken.address,
            decimals: x.lpToken.decimals,
            logoURI: x.lpToken.logoURI,
            name: x.lpToken.name,
            symbol: x.lpToken.name
        }
        // Also write in the tokens back ...
        let tokens: ExplicitToken[] = x.tokens.map((x: ExplicitToken) => {
            let token: ExplicitToken = {
                address: x.address,
                decimals: x.decimals,
                logoURI: x.logoURI,
                name: x.name,
                symbol: x.symbol
            }
            return token;
        })
        let out: ExplicitPool = {
            id: x.id,
            name: x.name,
            // @ts-ignore
            protocol: qpools.typeDefinitions.interfacingAccount.Protocol[x.protocol],
            // @ts-ignore
            protocolType: qpools.typeDefinitions.interfacingAccount.ProtocolType[x.protocolType],
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