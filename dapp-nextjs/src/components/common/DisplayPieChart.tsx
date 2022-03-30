import React, {useEffect, useState} from "react";
import {PieChart, Pie, Cell} from "recharts";
import {PIECHART_COLORS, RADIAN} from "../../const";
import {AllocData} from "../../types/AllocData";
import {Protocol, registry} from "@qpools/sdk";

interface Props {
    allocationInformation: Map<string, AllocData>,
    showPercentage: boolean,
    displayInput: boolean
}
interface PieChartDataInterface {
    name: string,
    value: number
}
export default function DisplayPieChart({allocationInformation, showPercentage, displayInput}: Props) {

    const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent}: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * -0.6; // 1.05;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        console.log("x and cx are: ", cx, x);
        // textAnchor={x > cx ? 'start' : 'end'}
        return (
            <text x={x} y={y} fill="white" dominantBaseline="central">
                {
                    percent ? `${(percent * 100).toFixed(0)}%` : null
                }
            </text>
        );
    };

    const [pieChartData, setPieChartData] = useState<PieChartDataInterface[]>([
        {name: "Group A", value: 400},
        {name: "Group B", value: 300},
        {name: "Group C", value: 300},
        {name: "Group D", value: 200}
    ])

    useEffect(() => {
        if (!allocationInformation) {
            return;
        }

        let sum = Array.from(allocationInformation.values()).reduce((sum: number, current: AllocData) => sum + current.weight, 0);
        setPieChartData((_: any) => {
                return Array.from(allocationInformation.values())
                    .sort((a, b) => a.lp > b.lp ? 1 : -1)
                    .map((current: AllocData) => {

                        // if display info, then set the weight to the pyth-price adjusted input usdc values ..
                        let value: number;
                        if (displayInput && current.userInputAmount!.amount.uiAmount) {
                            // Do a converstion by the pyth price
                            // TODO: Write a function which takes the uiamount and mint, and generates the USDC amount ...
                            value = current.userInputAmount!.amount.uiAmount!;
                            if (!value) {
                                throw Error("Something went really wrong!");
                            }
                            if (current.userInputAmount!.mint.equals(registry.getNativeSolMint())) {
                                value *= 93;
                            }
                            console.log("Value is: ", value);
                        } else {
                            value = ((100 * current.weight) / sum);
                        }

                        return {
                            name: Protocol[current.protocol] + " " + current.lp,
                            value: value
                        }
                    }
                );
            }
        )

    }, [allocationInformation]);

    return (
        <>
            <PieChart width={200} height={200}>
                <Pie stroke="none"
                     data={pieChartData}
                     cx="50%"
                     cy="50%"
                     labelLine={false}
                     isAnimationActive={false} // this line is needed in order to see the labels. https://github.com/recharts/recharts/issues/929
                     label={showPercentage ? renderCustomizedLabel : false}
                     outerRadius={100}
                     innerRadius={63}
                     dataKey="value"
                >
                    {pieChartData.map((entry, index) => (
                        <Cell
                            key={`cell-${Math.random() + pieChartData[index].value + index}`}
                            fill={PIECHART_COLORS[3*(index) % PIECHART_COLORS.length]}/>
                    ))}
                </Pie>
            </PieChart>
        </>
    );
}
