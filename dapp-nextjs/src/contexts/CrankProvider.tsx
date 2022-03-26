import React, {useState, useContext, useEffect} from 'react';
import {CrankRpcCalls} from "@qpools/sdk";
import {useLocalKeypair} from "./LocalKeypairProvider";
import {useRpc} from "./RpcProvider";

export interface ICrank {
    crankRpcTool: CrankRpcCalls | undefined,
}

const defaultValue: ICrank = {
    crankRpcTool: undefined,
}

const CrankContext = React.createContext<ICrank>(defaultValue);

export function useCrank() {
    return useContext(CrankContext);
}

export function CrankProvider(props: any) {

    const localKeypair = useLocalKeypair();
    const rpcProvider = useRpc();
    const [crankRpcTool, setCrankRpcTool] = useState<CrankRpcCalls | undefined>();

    /**
     * Everytime there is a change in the Keypair, create a
     */
    useEffect(() => {
        if (
            localKeypair.localTmpKeypair
            && rpcProvider.connection
            && rpcProvider.provider
            && rpcProvider._solbondProgram
        ) {
            setCrankRpcTool((_: any) => {
                let crankRpcCalls = new CrankRpcCalls(
                    rpcProvider.connection!,
                    localKeypair.localTmpKeypair!,
                    rpcProvider.provider!,
                    rpcProvider._solbondProgram!
                );
                return crankRpcCalls;
            });
        }
    }, [localKeypair.localTmpKeypair, rpcProvider.connection, rpcProvider.provider]);

    // TODO: Implement a function to run the crank (perhaps, in the background ...)

    /**
     * Implement logic to run cranks if not all positions have been fulfilled
     */
    // TODO: Uncomment again!
    const runCrankInBackground = async () => {
        // Check
        // Maybe add this to the crankRpcTool
        // if (await accountExists(connection!, crankRpcTool!.portfolioPDA)) {
        //     await crankRpcTool!.fullfillAllPermissionless();
        //     await makePriceReload();
        // }
    }
    useEffect(() => {
        if (crankRpcTool) {
            runCrankInBackground();
        }
    },[crankRpcTool]);

    const value: ICrank = {
            crankRpcTool,
        };

    return (
        <>
            <CrankContext.Provider value={value}>
                {props.children}
            </CrankContext.Provider>
        </>
    );
}
