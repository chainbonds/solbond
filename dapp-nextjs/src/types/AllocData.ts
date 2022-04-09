import {UserTokenBalance} from "./UserTokenBalance";
import * as qpools from "@qpools/sdk";

// Weight is probably bullshit, should prob remove this ...
// TODO: Introduce some terminology around protocol, inputToken, product, etc.
/**
 * This struct is central to the whole logic of the application.
 * As such, please read this carefully
 *
 * lpIdentifier:
 *      is the name that we receive from the serpius provider,
 *      and also the name that the individual protocol assigns to this product / asset / pool
 *      this name is unique.
 *
 *      This variable will also be found inside the pool object, but we have it twice for interoperability and convenience
 *      (as it is used inside the main key).
 *
 * weight:
 *      is the portfolio weight for this specific input token.
 *      the input-token can be split across multiple products / assets
 *
 * protocol:
 *      is the protocol that this reaches out to. saved as an enum.
 *      we only support a pre-determined set of protocols
 *
 * apy_24h:
 *      the APY estimated on the previous 24h data
 *
 * pool:
 *      is the pool-instance that includes some more detailed information on the product / asset / pool
 *      it includes the name, the input tokens for this pool, the lpIdentifier
 *      and also the mint-address for the certificate to be uniquely accessible
 *
 * userInputAmount:
 *      UserTokenBalance that determines how much the user wants to put in into this specific asset,
 *      and with which input token
 *
 * userWalletAmount:
 *      UserTokenBalance that determines how much the user has in his wallet, for a specific token mint
 *      , where this token mint is determined by the input-token to the userWalletAmount.
 *      Right now, we only support one token per input.
 *
 * usdcAmount:
 *      the total usdcValue of the userInputAmount. used for easier handling
 *
 */
export interface AllocData {
    lpIdentifier: string,  /// this is a key
    // Should include weights here
    weight: number,
    protocol: qpools.typeDefinitions.interfacingAccount.Protocol,
    apy_24h: number,
    // Should include the input token here
    // Can have multiple ones with the same pool, then
    pool: qpools.typeDefinitions.interfacingAccount.ExplicitPool,
    userInputAmount?: UserTokenBalance,
    userWalletAmount?: UserTokenBalance
    usdcAmount: number
}

/**
 * The next two functions should always return the same items,
 * provided
 */
export const keyFromAllocData = (x: AllocData): string => {
    // @ts-ignore
    let protocolString: string = qpools.typeDefinitions.interfacingAccount.Protocol[x.protocol];
    return "Protocol:" + protocolString + ".lpIdentifier:" + String(x.lpIdentifier);
}

export const keyFromPoolData = (x: qpools.typeDefinitions.interfacingAccount.ExplicitPool): string => {
    // @ts-ignore
    let protocolString: string = qpools.typeDefinitions.interfacingAccount.Protocol[x.protocol];
    return "Protocol:" + protocolString + ".lpIdentifier:" + String(x.id);
}
