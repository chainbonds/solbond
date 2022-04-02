import {registry} from "@qpools/sdk";
import {AllocData} from "./AllocData";
import {DisplayToken} from "./DisplayToken";
import {SelectedToken} from "../utils/utils";

export interface ChartableItemType {
    key: string,
    name: string,
    value: number,
    apy_24h: number,
    pool?: registry.ExplicitPool,
    allocationItem?: AllocData,
    displayTokens?: DisplayToken[],
    inputToken?: SelectedToken,
    inputTokenLink?: string,
}
