import React from "react";
import {GiLever} from "react-icons/gi";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import {useErrorMessage} from "../../../contexts/ErrorMessageContext";
import {useItemsLoad} from "../../../contexts/ItemsLoadingContext";
import {useLocalKeypair} from "../../../contexts/LocalKeypairProvider";
import {ICrank, useCrank} from "../../../contexts/CrankProvider";
import {depositCrank} from "../../../functions/depositCrank";
import {ButtonWithFaIcon} from "../../common/buttons/ButtonWithFaIcon";

interface Props {}
export const RunDepositCrankButton = ({}: Props) => {

    const rpcProvider: IRpcProvider = useRpc();
    const itemLoadContext = useItemsLoad();
    const localKeypairProvider = useLocalKeypair();
    const errorMessage = useErrorMessage();
    const crankProvider: ICrank = useCrank();

    return (
        <>
            <ButtonWithFaIcon
                icon={() => {return <GiLever/>}}
                text={"Run Crank"}
                onClick={() => {
                    console.log("Running deposit crank");
                    depositCrank(itemLoadContext, localKeypairProvider, rpcProvider, errorMessage, crankProvider);
                }}
                activated={true}
            />
        </>
    );
};
