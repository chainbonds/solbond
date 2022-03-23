import {registry} from "@qpools/sdk";
import {AllocData} from "./AllocData";

export interface ChartableItemType {
    name: string,
    value: number,
    apy_24h: number,
    pool?: registry.ExplicitPool,
    allocationItem?: AllocData
}
