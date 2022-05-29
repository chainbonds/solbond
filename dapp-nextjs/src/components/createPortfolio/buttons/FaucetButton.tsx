import React from "react";
import {FaFaucet} from "react-icons/fa";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import {ILoad, useLoad} from "../../../contexts/LoadingContext";
import {IErrorMessage, useErrorMessage} from "../../../contexts/ErrorMessageContext";
import {faucetDevnetAssets} from "../../../functions/faucetDevnetAssets";
import {ButtonWithFaIcon} from "../../common/buttons/ButtonWithFaIcon";

interface Props {
    activated: boolean,
    // rpcProvider: IRpcProvider,
    // loadContext: ILoad,
    // errorMessage: IErrorMessage
}
export const FaucetButton = ({activated}: Props) => {

    const rpcProvider: IRpcProvider = useRpc();
    const loadContext: ILoad = useLoad();
    const errorMessage: IErrorMessage = useErrorMessage();

    return (
        <>
            <ButtonWithFaIcon
                icon={() => {return <FaFaucet />}}
                text={"FAUCET"}
                onClick={() => faucetDevnetAssets(rpcProvider, loadContext, errorMessage)}
                activated={activated}
            />
        </>
    );
};
