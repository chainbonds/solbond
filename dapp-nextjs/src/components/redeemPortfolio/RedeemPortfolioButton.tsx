import React, {FC} from "react";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {IItemsLoad, useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {ILocalKeypair, useLocalKeypair} from "../../contexts/LocalKeypairProvider";
import {ICrank, useCrank} from "../../contexts/CrankProvider";
import {useErrorMessage} from "../../contexts/ErrorMessageContext";
import {redeemPortfolio} from "../../functions/redeemPortfolio";
import {PrimaryButton} from "../common/buttons/PrimaryButton";

export const RedeemPortfolioButton: FC = ({}) => {

    const rpcProvider: IRpcProvider = useRpc();
    const localKeypairProvider: ILocalKeypair = useLocalKeypair();
    const crankProvider: ICrank = useCrank();
    const itemLoadContext: IItemsLoad = useItemsLoad();
    const errorMessage = useErrorMessage();

    return (
        <>
            <PrimaryButton
                text={"Withdraw All"}
                onClick={() => {
                    console.log("Redeem full stupid Portfolio");
                    redeemPortfolio(rpcProvider, localKeypairProvider, crankProvider, itemLoadContext, errorMessage);
                }}
            />
        </>
    );
};
