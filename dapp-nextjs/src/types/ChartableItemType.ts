import {registry} from "@qpools/sdk";

export interface ChartableItemType {
    name: string,
    value: number,
    apy_24h: number,
    pool?: registry.ExplicitPool
}
