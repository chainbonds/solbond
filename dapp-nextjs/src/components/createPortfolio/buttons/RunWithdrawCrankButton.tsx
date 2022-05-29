import React, {FC} from "react";
import {GiLever} from "react-icons/gi";
import {BN} from "@project-serum/anchor";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import {Connection, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {ILoad, useLoad} from "../../../contexts/LoadingContext";
import {IErrorMessage, useErrorMessage} from "../../../contexts/ErrorMessageContext";
import {syncNative} from "@solendprotocol/solend-sdk";
import {MOCK} from "@qpools/sdk";
import {airdropAdmin, createAssociatedTokenAccountSendUnsigned} from "@qpools/sdk";
import {depositCrank} from "../../../functions/depositCrank";
import {ButtonWithFaIcon} from "../../common/buttons/ButtonWithFaIcon";
import {withdrawCrank} from "../../../functions/withdrawCrank";

interface Props {}
export const RunWithdrawCrankButton = ({}: Props) => {

    const rpcProvider: IRpcProvider = useRpc();
    const loadContext = useLoad();
    const errorMessage = useErrorMessage();

    return (
        <>
            <ButtonWithFaIcon
                icon={() => {return <GiLever/>}}
                text={"Run Crank"}
                onClick={() => {
                    console.log("Running withdraw crank");
                    withdrawCrank(rpcProvider, loadContext, errorMessage);
                }}
                activated={true}
            />
        </>
    );
};
