import React, {PureComponent, useEffect, useState} from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UsdValuePosition } from 'types/UsdValuePosition';

export default function PortfolioDiagram(props: any) {

    const [data, setData] = useState<any[]>([
        {
            name: "0",
            usdValueA: 0,
            usdValueB: 0.0,
            usdValueLp: 1.
        },
        {
            name: "2",
            usdValueA: 0,
            usdValueB: 0.0,
            usdValueLp: 0.0
        },
        {
            name: "2",
            usdValueA: 0,
            usdValueB: 0.0,
            usdValueLp: 0.0
        }
    ]);

    useEffect(() => {

        let displayData: any[] = [];
        let inputData = props.values;

        console.log("Input data is: ", inputData);

        // Iterate through all key-value pairs
        inputData.forEach((obj: UsdValuePosition, index: number) => {
            let tmpObj = {
                name: String(index),
                usdValueA: obj.usdValueA,
                usdValueB: obj.usdValueB,
                usdValueLp: obj.usdValueLp
            }
            console.log("Tmp object is: ", tmpObj);
            displayData.push(tmpObj);
        });

        console.log("Data is: ", displayData);
        setData(displayData);

        // let data: any = [
        //     {
        //         name: "0",
        //         usdValueA: 0,
        //         usdValueB: 12.647157,
        //         usdValueLp: 1.997628479075659
        //     },
        //     {
        //         name: "1",
        //         usdValueA: 0,
        //         usdValueB: 0.000583,
        //         usdValueLp: 0
        //     },
        //     {
        //         name: "2",
        //         usdValueA: 0.001074,
        //         usdValueB: 0,
        //         usdValueLp: 0
        //     }
        // ];

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
        // setData(data);
    }, [props.values]);

    // <ResponsiveContainer width="100%" height="100%">
    return (
        <>
            <BarChart
                width={300}
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
