import React, {useEffect, useState} from "react";
import StakeForm from "./swap/StakeForm";
import UnstakeForm from "./swap/UnstakeForm";
import {IQPool, useQPoolUserTool} from "../contexts/QPoolsProvider";

enum HeroFormState {
    Stake,
    Unstake
}

export default function HeroForm(props: any) {

    // Let this state be determined if the user has a portfolio
    const [displayForm, setDisplayForm] = useState<HeroFormState>(HeroFormState.Stake);
    const qPoolContext: IQPool = useQPoolUserTool();

    const fetchAndDisplay = async () => {
        if (qPoolContext.portfolioObject) {
            let isFulfilled = await qPoolContext.portfolioObject!.portfolioExistsAndIsFulfilled();
            if (isFulfilled) {
                setDisplayForm(HeroFormState.Unstake);
            } else {
                setDisplayForm(HeroFormState.Stake);
            }
        }
    };

    useEffect(() => {
        // Check if the account exists, and if it was fulfilled
        fetchAndDisplay();
    }, [qPoolContext.portfolioObject, qPoolContext.makePriceReload]);

    return (
        <>
            <div className={"flex flex-col w-full"}>
                <div className={"flex flex-col"}>
                    <br/>
                    {(displayForm === HeroFormState.Stake) && <StakeForm/>}
                    {(displayForm === HeroFormState.Unstake) && <UnstakeForm/>}
                </div>
            </div>
        </>
    )
}
