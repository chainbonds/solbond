import React, {useCallback, useEffect, useState} from "react";
import {PieChart, Pie, Cell, ResponsiveContainer} from "recharts";
import axios from "axios";


export default function ChartAndTable() {

    const COLORS = ["#0EA5E9", "#EF4444", "#22C55E", "#71717A"];

    const RADIAN = Math.PI / 180;


    const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index}: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        let withText = <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>

        let noText =<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {``}
        </text>

        let hundredPercent = <text x={cx} y={cy} fill="white" textAnchor={'middle'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>

        let res = noText
        if(percent == 1){
            res = hundredPercent
        }
        else if (percent > 0) {
            res = withText
            }

        return (
            res
        );


    };

    {/* for debugging purposes
    const fixedData = [
        {name: "Group A", value: 400},
        {name: "Group B", value: 300},
        {name: "Group C", value: 300},
        {name: "Group D", value: 200}
    ]
    */}

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
    const [ratios, setRatios] = useState<AllocData[]>([{
        "lp": "JSOL-SOL",
        "weight": 1000,
        "protocol": "saber"
    }, {"lp": "HBTC-renBTC", "weight": 1000, "protocol": "saber"}, {
        "lp": "eSOL-SOL",
        "weight": 1000,
        "protocol": "saber"
    }]);


    useEffect(() => {
        console.log("Loading the weights");
        axios.get<AllocData[]>("https://qpools.serpius.com/weight_status.json").then((response) => {
            setRatios(response.data)
            console.log("Here is the data :")
            console.log(typeof response.data)
            console.log(JSON.stringify(response.data))

        }).catch((error) => {
            console.log(error)
        })
    }, []);

    useEffect(() => {
        if (!ratios) return;

        let sum = ratios[0].weight + ratios[1].weight + ratios[2].weight ;
        setPieChartData([
            {name: ratios[0].lp, value: ((100* ratios[0].weight) / sum)},
            {name: ratios[1].lp, value: ((100* ratios[1].weight) / sum)},
            {name: ratios[2].lp, value: ((100* ratios[2].weight) / sum)}
        ])
    }, [ratios]);


    return (
        //<ResponsiveContainer width="100%" height="100%">
        <>
            <div className={""}>
                <PieChart width={300} height={300}>
                    <Pie stroke="none"
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        isAnimationActive={false} // this line is needed in order to see the labels. https://github.com/recharts/recharts/issues/929
                        label={renderCustomizedLabel}
                        outerRadius={'80%'}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {fixedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                    </Pie>
                </PieChart>
            </div>

            <div className="flex flex-col my-auto text-white">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 ">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="">
                                <tr>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset
                                    </th>
                                    <th scope="col"
                                        className="px-6 lg:px-16 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation
                                    </th>
                                </tr>
                                </thead>


                                <tbody className=" divide-y divide-grey-200">

                                <tr>
                                    <td className="px-2 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="w-4 h-4 rounded-xl bg-blue-500">{}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">{pieChartData[0].name}</div>
                                    </td>
                                    <td className="px-6 lg:px-16 py-4 whitespace-nowrap">
                                        <div className="text-sm">{pieChartData[0].value}%</div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="px-2 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="w-4 h-4 rounded-xl bg-red-500">{}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">{pieChartData[1].name}</div>
                                    </td>
                                    <td className="px-6 lg:px-16 py-4 whitespace-nowrap">
                                        <div className="text-sm">{pieChartData[1].value}%</div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="px-2 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="w-4 h-4 rounded-xl bg-green-500">{}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">{ratios[2].lp}</div>
                                    </td>
                                    <td className="px-6 lg:px-16 py-4 whitespace-nowrap">
                                        <div className="text-sm">{ratios[2].weight}%</div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


            {/*
            <table className={"flex-col my-auto text-white"}>
                <thead className="">
                <tr>
                    <th scope="col">
                    </th>
                    <th scope="col">
                        Asset
                    </th>
                    <th scope="col">
                        Allocation
                    </th>
                </tr>
                </thead>

                <tbody className="">
                <tr>
                    <td className="">
                        <div className="w-4 h-4 rounded-xl bg-red-600">{}</div>
                    </td>
                    <td className="">
                        <div className="">{ratios[0].lp}</div>
                    </td>
                    <td className="">
                        <div className="">{ratios[0].weight}</div>
                    </td>
                </tr>

                <tr>
                    <td className="">
                        <div className="w-4 h-4 rounded-xl bg-blue-600">{}</div>
                    </td>
                    <td className="">
                        <div className="">{ratios[1].lp}</div>
                    </td>
                    <td className="">
                        <div className="">{ratios[1].weight}</div>
                    </td>
                </tr>

                <tr>
                    <td className="">
                        <div className="w-4 h-4 rounded-xl bg-green-600">{}</div>
                    </td>
                    <td className="">
                        <div className="">{ratios[1].lp}</div>
                    </td>
                    <td className="">
                        <div className="">{ratios[1].weight}</div>
                    </td>
                </tr>

                </tbody>
            </table>
            */}
            {/*  </ResponsiveContainer>*/}
        </>
    );
}
