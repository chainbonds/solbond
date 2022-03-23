import React, {FC, useEffect, useState} from "react";
import LoadingItemsModal from "./modals/LoadingItemsModal";
import PortfolioChart from "./portfolio/PortfolioChart";
import StakeForm from "./swap/StakeForm";
import UnstakeForm from "./swap/UnstakeForm";
import {BRAND_COLORS} from "../const";
import {IRpcProvider, useRpc} from "../contexts/RpcProvider";

export enum HeroFormState {
    PortfolioDoesNotExist,
    PortfolioExists
}

export const Main: FC = ({}) => {

    const [displayForm, setDisplayForm] = useState<HeroFormState>(HeroFormState.PortfolioDoesNotExist);
    const rpcProvider: IRpcProvider = useRpc();

    const fetchAndDisplay = async () => {
        if (rpcProvider.portfolioObject) {
            let isFulfilled = await rpcProvider.portfolioObject.portfolioExists();
            if (isFulfilled) {
                setDisplayForm(HeroFormState.PortfolioExists);
            } else {
                setDisplayForm(HeroFormState.PortfolioDoesNotExist);
            }
        }
    };

    useEffect(() => {
        // Check if the account exists, and if it was fulfilled
        fetchAndDisplay();
    }, [rpcProvider.portfolioObject, rpcProvider.makePriceReload]);

    const formComponent = () => {
        if (displayForm === HeroFormState.PortfolioDoesNotExist) {
            return (
                <StakeForm/>
            );
        } else if (displayForm === HeroFormState.PortfolioExists) {
            return (
                <UnstakeForm/>
            );
        }
    }

    const titleString = () => {
        if (displayForm === HeroFormState.PortfolioDoesNotExist) {
            return "Please Select Your Portfolio";
        } else if (displayForm === HeroFormState.PortfolioExists) {
            return "Your Portfolio";
        }
    }

    const descriptionString = () => {
        if (displayForm === HeroFormState.PortfolioDoesNotExist) {
            return "This will be the allocation in which your assets generate yields";
        } else if (displayForm === HeroFormState.PortfolioExists) {
            return "See the assets for your current portfolio";
        }
    }

    return (
        <div
            id="content"
            className={"flex flex-col grow my-auto"}
            style={{ backgroundColor: BRAND_COLORS.slate900 }}
        >
            <LoadingItemsModal />
            <div className={"flex flex-col grow w-full my-auto"}>
                <div className={"flex flex-col mx-auto "}>
                    <div className={"flex flex-row w-full"}>
                        <h1 className={"text-3xl font-light"}>
                            {titleString()}
                        </h1>
                    </div>
                    <div className={"flex flex-row mt-2"}>
                        <h2 className={"text-2xl font-light"}>
                            {descriptionString()}
                        </h2>
                    </div>
                    <div className={"flex flex-row mt-8"}>
                        <PortfolioChart
                                displayMode={displayForm}
                                totalAmountInUsdc={100}
                            />
                    </div>
                    <div className={"flex flex-row my-auto mt-7"}>
                        {formComponent()}
                    </div>
                </div>
            </div>
        </div>
    );

}
