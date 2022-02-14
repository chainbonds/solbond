import {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../contexts/QPoolsProvider";
import {delay} from "@qpools/sdk/lib/utils";
import {BN} from "@project-serum/anchor";
import axios from "axios";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import {Pie} from 'react-chartjs-2';
import {error} from "next/dist/build/output/log";

ChartJS.register(ArcElement, Tooltip, Legend);

// const options = {
//     maintainAspectRatio: false,
//     responsive: false,
//     legend: {
//         position: 'left',
//         labels: {
//             boxWidth: 10
//         }
//     }
// };

export default function PieChart(props: any) {

    const [pieChartData, setPieChartData] = useState({
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [
            {
                label: '# of Votes',
                data: [12, 19, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.9)',
                    'rgba(54, 162, 235, 0.9)',
                    'rgba(255, 206, 86, 0.9)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    })

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
        const Z = ratios[0].weight + ratios[1].weight + ratios[2].weight

        console.log("Here is in the variable:")
        console.log(JSON.stringify(ratios))
        setPieChartData({
            labels: [ratios[0].lp, ratios[1].lp, ratios[2].lp],
            datasets: [
                {
                    label: 'Ratio',
                    data: [(ratios[0].weight / Z * 100), (ratios[1].weight / Z * 100), (ratios[2].weight / Z * 100)],
                    backgroundColor: [
                        'rgb(75,151,250, 0.8)',
                        'rgb(148,173,43, 0.8)',
                        'rgb(250,115,100, 0.8)',
                    ],
                    borderColor: [
                        'rgb(229,12,12, 0.5)',
                        'rgb(2,50,155, 0.5)',
                        'rgb(86,255,196, 0.5)',
                    ],
                    borderWidth: 0,
                },
            ],

        })
    }, [ratios]);

    // height={250} width={250} options={options}

    return (
        <Pie data={pieChartData}/>
    )


}