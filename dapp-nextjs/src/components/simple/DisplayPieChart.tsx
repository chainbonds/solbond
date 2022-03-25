import React, {useEffect, useState} from "react";
import {PieChart, Pie, Cell} from "recharts";
import {COLORS, RADIAN} from "../../const";
import {AllocData} from "../../types/AllocData";
import {Protocol} from "@qpools/sdk";

interface Props {
    allocationInformation: Map<string, AllocData>,
    showPercentage: boolean
}
interface PieChartDataInterface {
    name: string,
    value: number
}
export default function DisplayPieChart({allocationInformation, showPercentage}: Props) {

    const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent}: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.4; // 1.05;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
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
                        return {
                            name: Protocol[current.protocol] + " " + current.lp,
                            value: ((100 * current.weight) / sum)
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
                     innerRadius={40}
                     dataKey="value"
                >
                    {pieChartData.map((entry, index) => (
                        <Cell
                            key={`cell-${Math.random() + pieChartData[index].value + index}`}
                            fill={COLORS[index % COLORS.length]}/>
                    ))}
                </Pie>
            </PieChart>
        </>
    );
}
