import {registry} from "@qpools/sdk";
import {UserTokenBalance} from "./UserTokenBalance";
import {Protocol} from "@qpools/sdk";

// Weight is probably bullshit, should prob remove this ...
export interface AllocData {
    lp: string,
    // weight: number,
    protocol: Protocol,
    apy_24h: number,
    pool: registry.ExplicitPool,
    userInputAmount?: UserTokenBalance,
    userWalletAmount?: UserTokenBalance
    usdcAmount: number
}
