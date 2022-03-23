import {registry} from "@qpools/sdk";
import {UserTokenBalance} from "./UserTokenBalance";

export interface AllocData {
    lp: string,
    weight: number,
    protocol: string,
    apy_24h: number,
    pool?: registry.ExplicitPool,
    userInputAmount?: UserTokenBalance,
    userWalletAmount?: UserTokenBalance
}
