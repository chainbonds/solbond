import {AllocData} from "./AllocData";
import {DisplayToken} from "./DisplayToken";
import {SelectedToken} from "../utils/utils";
import {ExplicitPool} from "@qpools/sdk";

export interface ChartableItemType {
    key: string,
    name: string,
    value: number,
    apy_24h: number,
    pool?: ExplicitPool,
    allocationItem?: AllocData,
    displayTokens?: DisplayToken[],
    inputToken?: SelectedToken,
    inputTokenLink?: string,
}
