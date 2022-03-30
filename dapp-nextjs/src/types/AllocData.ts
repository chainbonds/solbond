import {registry} from "@qpools/sdk";
import {UserTokenBalance} from "./UserTokenBalance";
import {Protocol} from "@qpools/sdk";

export interface AllocData {
    lp: string,
    weight: number,
    protocol: Protocol,
    apy_24h: number,
    pool?: registry.ExplicitPool,
    userInputAmount?: UserTokenBalance,
    userWalletAmount?: UserTokenBalance
    usdcAmount?: number
}
