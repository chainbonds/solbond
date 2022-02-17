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
                name: String(index + 1),
                usdValueA: obj.usdValueA,
                usdValueB: obj.usdValueB,
                usdValueLp: obj.usdValueLp
            }
            console.log("Tmp object is: ", tmpObj);
            displayData.push(tmpObj);
        });

        console.log("Data is: ", displayData);
        setData(displayData);

    }, [props.values]);

    return (
        <>
            <BarChart
                width={200}
                height={200}
                data={data}
                margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="0 0" />
                <XAxis dataKey="name" />
                <YAxis />
                {/*<Tooltip />*/}
                {/*<Legend />*/}
                <Bar name="Position 1" dataKey="usdValueA" stackId="a" fill="#DDD6FE" />
                <Bar name="Position 2" dataKey="usdValueB" stackId="a" fill="#ECE9FE" />
                <Bar name="Position 3" dataKey="usdValueLp" stackId="a" fill="#baa5ef" />
            </BarChart>
        </>
    );
    {/*</ResponsiveContainer>*/}

}
