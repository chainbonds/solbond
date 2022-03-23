import React, {useEffect, useState} from "react";
import {PieChart, Pie, Cell} from "recharts";
import ExistingPortfolioTable from "../tables/ExistingPortfolioTable";
import {COLORS, RADIAN} from "../../const";
import SuggestedPortfolioTable from "../tables/SuggestedPortfolioTable";


import {HeroFormState} from "../Main";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {AllocData} from "../../types/AllocData";
import {ISerpius, useSerpiusEndpoint} from "../../contexts/SerpiusProvider";
import {IUserWalletAssets, useUserWalletAssets} from "../../contexts/UserWalletAssets";
import DisplayPieChart from "../charts/DisplayPieChart";

export default function PortfolioChart(props: any) {

    const rpcProvider: IRpcProvider = useRpc();
    const serpiusProvider: ISerpius = useSerpiusEndpoint();
    const userWalletAssetsProvider: IUserWalletAssets = useUserWalletAssets();

    const [showPercentage, setShowPercentage] = useState<boolean>(false);
    const [ratios, setRatios] = useState<AllocData[] | undefined>(undefined);
    const [totalAmountInUsdc, setTotalAmountInUsdc] = useState<number>(0.);
    useEffect(() => {
        if (props.totalAmountInUsdc) {
            console.log("Defined!", props.totalAmountInUsdc);
            setTotalAmountInUsdc(props.totalAmountInUsdc);
        } else {
            console.log("Undefined!", props.totalAmountInUsdc);
        }
    }, [props.totalAmountInUsdc]);

    // TODO: Based on whether Stake or Unstake state, should display the user's wallet, (if connected), or the existing portfolio
    // TODO: Gotta implement this logic as well ...

    // Maybe set loading until we are able to read the serpius API
    useEffect(() => {
        // Yet another option would be to load the assets from the portfolio position ...
        if (userWalletAssetsProvider.walletAssets) {
            setRatios((_: AllocData[] | undefined) => {
                return userWalletAssetsProvider.walletAssets;
            });
        } else if (serpiusProvider.portfolioRatios) {
            setRatios((_: AllocData[] | undefined) => {
                return serpiusProvider.portfolioRatios;
            });
        }
    }, [serpiusProvider.portfolioRatios, userWalletAssetsProvider.walletAssets]);

    return (
        <>
            {/*-ml-14*/}
            <div className={"flex my-auto mx-auto p-8"}>
                {/* key={Math.random() + pieChartData[0].value} */}
                {ratios && <DisplayPieChart showPercentage={false} allocationInformation={ratios} />}
            </div>
            <div className="flex flex-col text-gray-300 my-auto divide-y divide-white">
                {/*
                    Only show this Portfolio if the wallet is connected ...
                */}
                {(props.displayMode === HeroFormState.PortfolioExists) && <ExistingPortfolioTable/>}
                {(props.displayMode === HeroFormState.PortfolioDoesNotExist) && <SuggestedPortfolioTable/>}
            </div>
        </>
    );
}
