import {UserTokenBalance} from "./UserTokenBalance";
import * as qpools from "@qpools/sdk";

// Weight is probably bullshit, should prob remove this ...
export interface AllocData {
    lp: string,
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
