import React, {useState, useContext, useEffect} from 'react';
import {CrankRpcCalls} from "@qpools/sdk";
import {useLocalKeypair} from "./LocalKeypairProvider";
import {useQPoolUserTool} from "./QPoolsProvider";


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
    const qPoolContext = useQPoolUserTool();
    const [crankRpcTool, setCrankRpcTool] = useState<CrankRpcCalls | undefined>();

    /**
     * Everytime there is a change in the Keypair, create a
     */
    useEffect(() => {
        if (
            localKeypair.localTmpKeypair
            && qPoolContext.connection
            && qPoolContext.provider
            && qPoolContext._solbondProgram
        ) {
            setCrankRpcTool((_: any) => {
                let crankRpcCalls = new CrankRpcCalls(
                    qPoolContext.connection!,
                    localKeypair.localTmpKeypair!,
                    qPoolContext.provider!,
                    qPoolContext._solbondProgram!
                );
                return crankRpcCalls;
            });
        }
    }, [localKeypair.localTmpKeypair, qPoolContext.connection, qPoolContext.provider]);

    // TODO: Implement a function to run the crank (perhaps, in the background ...)

    /**
     * Implement logic to run cranks if not all positions have been fulfilled
     */
        // TODO: Uncomment again!
        // const runCrankInBackground = async () => {
        //     // Check
        //     if (await accountExists(connection!, crankRpcTool!.portfolioPDA)) {
        //         await crankRpcTool!.fullfillAllPermissionless();
        //         await makePriceReload();
        //     }
        // }
        // useEffect(() => {
        //     if (crankRpcTool) {
        //         runCrankInBackground();
        //     }
        // },[crankRpcTool]);


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
