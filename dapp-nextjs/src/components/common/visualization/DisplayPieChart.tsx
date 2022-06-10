import React, {useEffect, useState} from "react";
import {PieChart, Pie, Cell, Label, Tooltip} from "recharts";
import {AllocData, keyFromAllocData} from "../../../types/AllocData";
import {PIECHART_COLORS, RADIAN} from "../../../const";

interface Props {
    allocationInformation: Map<string, AllocData>,
    showPercentage: boolean,
    mainNumber?: string,
    changePercentage?: string,
    changeColor?: string,
    title?: string,
}

interface PieChartDataInterface {
    name: string,
    value: number
}

function CustomLabel(props: any) {
    const {cx, cy} = props.viewBox;
    return (
        <>
            <text
                x={cx}
                y={cy + 5}
                fill="rgba(255, 255, 255, 0.95)"
                className="recharts-text recharts-label"
                textAnchor="middle"
                dominantBaseline="central"
            >
                <tspan alignmentBaseline="middle" fontSize="2em">
                    ${props.value1}
                </tspan>
            </text>
            <text
                x={cx}
                y={cy - 30}
                fill="rgba(255, 255, 255, 0.95)"
                className="recharts-text recharts-label"
                textAnchor="middle"
                dominantBaseline="central"
            >
                <tspan fontSize="1.3em">
                    {props.value2}
                </tspan>
            </text>
        </>
    );
}

export default function DisplayPieChart({
                                            allocationInformation,
                                            showPercentage,
                                            mainNumber,
                                            changePercentage,
                                            changeColor,
                                            title
                                        }: Props) {

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

        // let sum = Array.from(allocationInformation.values()).reduce((sum: number, current: AllocData) => sum + current.usdcAmount, 0);
        setPieChartData((_: any) => {
                // If the total sum of the portfolio is zero, make a unifiedly-distributed portfolio
                let totalUsdcValue = Array.from(allocationInformation.values()).reduce((value, current) => value = value + current.usdcAmount, 0);
                return Array.from(allocationInformation.values())
                    .sort((a, b) => a.lpIdentifier > b.lpIdentifier ? 1 : -1)
                    .map((current: AllocData) => {
                            let value = current.usdcAmount!;  // current.userInputAmount!.amount.uiAmount!;
                            if (totalUsdcValue < 1) {
                                value = 1;
                            }
                            return {
                                name: keyFromAllocData(current),
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
                     innerRadius={87}
                     dataKey="value"
                >
                    {mainNumber &&
                        <Label width={30} position="center"
                               content={<CustomLabel value1={mainNumber} value2={changePercentage}/>}>
                        </Label>
                    }
                    {pieChartData.map((entry, index) => (
                        <Cell
                            // Math.random() +
                            key={`cell-${pieChartData[index].value + index}`}
                            fill={PIECHART_COLORS[(3 * index) % PIECHART_COLORS.length]}/>
                    ))}
                </Pie>
                <Tooltip/>
            </PieChart>
        </>
    );
}
