import {registry} from "@qpools/sdk";
import {UserTokenBalance} from "./UserTokenBalance";
import {Protocol} from "@qpools/sdk";

// Weight is probably bullshit, should prob remove this ...
export interface AllocData {
    lp: string,
    // Should include weights here
    weight: number,
    protocol: Protocol,
    apy_24h: number,
    // Should include the input token here
    // Can have multiple ones with the same pool, then
    pool: registry.ExplicitPool,
    userInputAmount?: UserTokenBalance,
    userWalletAmount?: UserTokenBalance
    usdcAmount: number
}
