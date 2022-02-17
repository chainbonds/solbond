import React, {PureComponent, useEffect, useState} from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {UsdValuePosition} from "./SinglePortfolioCard";
import {initNext} from "next/client";

// data = [
//     {
//         name: 'Page A',
//         uv: 4000,
//         pv: 2400,
//         amt: 2400,
//     },
//     {
//         name: 'Page B',
//         uv: 3000,
//         pv: 1398,
//         amt: 2210,
//     },
//     {
//         name: 'Page C',
//         uv: 2000,
//         pv: 9800,
//         amt: 2290,
//     },
// ];

export default function PortfolioDiagram(props: any) {

    const [data, setData] = useState<any[]>([]);

    useEffect(() => {

        // let displayData: any[] = [];
        // let inputData = props.values;
        //
        // // Iterate through all key-value pairs
        // inputData.map((obj: UsdValuePosition, index: number) => {
        //     let tmpObj: any = {};
        //     let k: keyof typeof obj;
        //     // tmpObj["name"] = obj.
        //     tmpObj["name"] = String(index);
        //     for (k in obj) {
        //         const v = obj[k];
        //         if (k.toString() != "totalPositionValue") {
        //             tmpObj[k] = v;
        //         }
        //     }
        //     console.log("Tmp object is: ", tmpObj);
        //     displayData.push(tmpObj);
        // });
        //
        // console.log("Data is: ", displayData);
        // setData(displayData);

        let data: any = [
            {
                name: "0",
                usdValueA: 0,
                usdValueB: 12.647157,
                usdValueLp: 1.997628479075659
            },
            {
                name: "1",
                usdValueA: 0,
                usdValueB: 0.000583,
                usdValueLp: 0
            },
            {
                name: "2",
                usdValueA: 0.001074,
                usdValueB: 0,
                usdValueLp: 0
            }
        ];

        // data = [
        //     {
        //         name: "1",
        //         usdValueA: 4000,
        //         usdValueB: 2400,
        //         // usdValueLp: 2400,
        //     },
        //     {
        //         name: '2',
        //         usdValueA: 3000,
        //         usdValueB: 1398,
        //         // usdValueLp: 2210,
        //     },
        //     {
        //         name: '3',
        //         usdValueA: 2000,
        //         usdValueB: 9800,
        //         // usdValueLp: 2290,
        //     },
        // ];
        setData(data);
    }, [props.values]);

    // <ResponsiveContainer width="100%" height="100%">
    return (
        <>
            <BarChart
                width={500}
                height={200}
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="0 0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usdValueA" stackId="a" fill="#8884d8" />
                <Bar dataKey="usdValueB" stackId="a" fill="#82ca9d" />
                <Bar dataKey="usdValueLp" stackId="a" fill="#22ea9d" />
            </BarChart>
        </>
    );
    {/*</ResponsiveContainer>*/}

}
