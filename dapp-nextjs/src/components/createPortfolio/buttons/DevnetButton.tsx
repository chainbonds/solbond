import React, {FC} from "react";
import {FaFaucet} from "react-icons/fa";
import {BN} from "@project-serum/anchor";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import airdropAdmin from "@qpools/sdk/src/devnet/airdropAdmin";
import {Connection, Transaction} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {useLoad} from "../../../contexts/LoadingContext";
import {createAssociatedTokenAccountSendUnsigned, MOCK} from "@qpools/sdk";

export const DevnetButton: FC = ({}) => {

    return (
        <>
            <div
                className="border border-gray-500 text-white font-bold py-3 px-7 rounded"
            >
                <div className={"flex flex-row"}>
                    <div className={"py-auto my-auto"}>
                        {/*<FaFaucet/>*/}
                    </div>
                    DEVNET
                </div>
            </div>
        </>
    );
};
