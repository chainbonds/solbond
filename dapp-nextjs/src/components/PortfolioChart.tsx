import React, {useCallback, useEffect, useState} from "react";
import {PieChart, Pie, Cell, ResponsiveContainer} from "recharts";
import axios from "axios";
import {useLoad} from "../contexts/LoadingContext";

export default function PortfolioChart(props: any) {

    const loadContext = useLoad();

    const COLORS = [
        "#2196f3",
        "#f44336",
        "#00C49F",
        "#ffeb3b",
        "#9c27b0"
    ];
    // Pick the color based on the index ...
    let TAILWIND_COLORS = [
        "bg-blue-500",
        "bg-red-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500"
    ]
    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index}: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.4; // 1.05;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (

            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {
                    percent ? `${ (percent * 100).toFixed(0)}%` : null
                }
            </text>

        );
    };

    const fixedData = [
        {name: "Group A", value: 400},
        {name: "Group B", value: 300},
        {name: "Group C", value: 300},
        {name: "Group D", value: 200}
    ]

    const [pieChartData, setPieChartData] = useState([
        {name: "Group A", value: 400},
        {name: "Group B", value: 300},
        {name: "Group C", value: 300},
        {name: "Group D", value: 200}
    ])


    interface AllocData {
        lp: string,
        weight: number,
        protocol: string,

    };

    // Just run a loop where you update TVL every couple times
    const [ratios, setRatios] = useState<AllocData[]>([
        {
            "lp": "JSOL-SOL", "weight": 1000, "protocol": "Saber"
        },
        {
            "lp": "HBTC-renBTC", "weight": 1000, "protocol": "Saber"
        },
        {
            "lp": "eSOL-SOL", "weight": 1000, "protocol": "Saber"
        }
    ]);

    const [totalAmountInUsdc, setTotalAmountInUsdc] = useState<number>(0.);
    useEffect(() => {
        if (props.totalAmountInUsdc) {
            console.log("Defined!", props.totalAmountInUsdc);
            setTotalAmountInUsdc(props.totalAmountInUsdc);
        } else {
            console.log("Undefined!", props.totalAmountInUsdc);
        }
    }, [props.totalAmountInUsdc]);

    useEffect(() => {
        console.log("Loading the weights");

        loadContext.increaseCounter();

        axios.get<AllocData[]>("https://qpools.serpius.com/weight_status.json").then((response) => {
            console.log("Here is the data :")
            console.log(typeof response.data)
            console.log(JSON.stringify(response.data))

            response.data.map((x: any) => {
                if (x["type"] === "back") {
                    let data = x["data"];
                    setRatios(data);
                }
            });
            loadContext.decreaseCounter();
            // [{"type":"front","data":[{"lp":"wUST_v1-USDC","weight":1000,"protocol":"saber"}]},{"type":"back","data":[{"lp":"wUST_v1-USDC","weight":1000,"protocol":"saber"},{"lp":"USDCpo-USDC","weight":0,"protocol":"saber"},{"lp":"USDCet-USDC","weight":0,"protocol":"saber"}]}]
        }).catch((error) => {
            console.log(error);
            loadContext.decreaseCounter();
        })
    }, []);

    useEffect(() => {
        if (!ratios) return;
        console.log("Here is in the variable:")
        console.log(JSON.stringify(ratios))
        let sum = ratios[0].weight + ratios[1].weight + ratios[2].weight ;
        setPieChartData([
            {name: ratios[0].protocol + " " + ratios[0].lp, value: ((100* ratios[0].weight) / sum)},
            {name: ratios[1].protocol + " " + ratios[1].lp, value: ((100* ratios[1].weight) / sum)},
            {name: ratios[2].protocol + " " + ratios[2].lp, value: ((100* ratios[2].weight) / sum)}
        ])
    }, [ratios]);

    const singleRow = (row: any, index: number) => {

        let color = TAILWIND_COLORS[index % TAILWIND_COLORS.length];

        console.log("Value and total amount in usdc are: ");
        console.log(row.value);
        console.log(totalAmountInUsdc);

        return (
            <tr>
                <td className="px-2 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="ml-4">
                            <div className={"w-4 h-4 rounded-xl " + color}>{}</div>
                        </div>
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm">
                        {row.name}
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm">
                        {row.value}%
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm">
                        ${(0.01 * row.value * totalAmountInUsdc).toFixed(2)}
                    </div>
                </td>
            </tr>
        )
    }

    return (
        <>
            <div className={"flex flex-row my-auto mx-auto"}>

                <div className={"flex my-auto mt-10 -ml-14"}>
                    <PieChart width={300} height={300}>
                        <Pie stroke="none"
                             data={pieChartData}
                             cx="50%"
                             cy="50%"
                             labelLine={false}
                             isAnimationActive={false} // this line is needed in order to see the labels. https://github.com/recharts/recharts/issues/929
                             label={renderCustomizedLabel}
                             outerRadius={80}
                             fill="#8884d8"
                             dataKey="value"
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}/>
                            ))}
                        </Pie>
                    </PieChart>
                </div>

                <div className="flex flex-col my-auto text-white">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="overflow-hidden border-b border-gray-200 ">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="">
                                    <tr>
                                        <th scope="col"
                                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount
                                        </th>
                                    </tr>
                                    </thead>


                                    <tbody className="divide-y divide-gray-200">
                                    {pieChartData.map((x, index) => {
                                        return (
                                            <>
                                                {singleRow(x, index)}
                                            </>
                                        )
                                    })}
                                    {/*<tr>*/}
                                    {/*    <td className="px-2 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="flex items-center">*/}
                                    {/*            <div className="ml-4">*/}
                                    {/*                <div className="w-4 h-4 rounded-xl bg-blue-500">{}</div>*/}
                                    {/*            </div>*/}
                                    {/*        </div>*/}
                                    {/*    </td>*/}
                                    {/*    <td className="px-6 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="text-sm">{pieChartData[0].name}</div>*/}
                                    {/*    </td>*/}
                                    {/*    <td className="px-6 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="text-sm">{pieChartData[0].value}%</div>*/}
                                    {/*    </td>*/}
                                    {/*</tr>*/}

                                    {/*<tr>*/}
                                    {/*    <td className="px-2 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="flex items-center">*/}
                                    {/*            <div className="ml-4">*/}
                                    {/*                <div className="w-4 h-4 rounded-xl bg-red-500">{}</div>*/}
                                    {/*            </div>*/}
                                    {/*        </div>*/}
                                    {/*    </td>*/}
                                    {/*    <td className="px-6 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="text-sm">{pieChartData[1].name}</div>*/}
                                    {/*    </td>*/}
                                    {/*    <td className="px-6 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="text-sm">{pieChartData[1].value}%</div>*/}
                                    {/*    </td>*/}
                                    {/*</tr>*/}

                                    {/*<tr>*/}
                                    {/*    <td className="px-2 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="flex items-center">*/}
                                    {/*            <div className="ml-4">*/}
                                    {/*                <div className="w-4 h-4 rounded-xl bg-green-500">{}</div>*/}
                                    {/*            </div>*/}
                                    {/*        </div>*/}
                                    {/*    </td>*/}
                                    {/*    <td className="px-6 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="text-sm">{ratios[2].lp}</div>*/}
                                    {/*    </td>*/}
                                    {/*    <td className="px-6 py-3 whitespace-nowrap">*/}
                                    {/*        <div className="text-sm">{ratios[2].weight}%</div>*/}
                                    {/*    </td>*/}
                                    {/*</tr>
                                    */}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
