import React, {useState, useContext, useEffect} from 'react';
import {Keypair} from "@solana/web3.js";

export interface ILocalKeypair {
    localTmpKeypair: Keypair | undefined,
}

const defaultValue: ILocalKeypair = {
    localTmpKeypair: undefined,
}

const ILocalKeypairContext = React.createContext<ILocalKeypair>(defaultValue);

export function useLocalKeypair() {
    return useContext(ILocalKeypairContext);
}

export function LocalKeypairProvider(props: any) {

    const [localTmpKeypair, setLocalTmpKeypair] = useState<Keypair | undefined>();


    /**
     * At the beginning of running the app, generate a temporary keypair
     * This keypair will never hold any SOL above 0.02
     *
     * It will be used to run the cranks from the client-side
     * It can also be used to make get-requests (because providers require to have a keypair provided)
     *
     * Saving and retrieving base64 string according to
     * https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
     *
     */
    useEffect(() => {

        // Load Keypair from Local Storage
        let tmpKeypairSecretKey: string | null = localStorage.getItem("tmpKeypairSecretKey");
        if (!tmpKeypairSecretKey) {
            console.log("Generating a new keypair!!");
            console.log("This keypair will never hold more than 0.02 SOL, and this will also be used instantenously");
            const tmpKeypair: Keypair = Keypair.generate();
            setLocalTmpKeypair(tmpKeypair);
            // Save it into localStorage
            localStorage.setItem("tmpKeypairPublicKey", tmpKeypair.publicKey.toString());
            localStorage.setItem("tmpKeypairSecretKey", Buffer.from(tmpKeypair.secretKey).toString('base64'));
        } else {
            console.log("Loading keypair...");
            setLocalTmpKeypair((_: any) => {
                let secretKeyUint8Array: Uint8Array = new Uint8Array(Buffer.from(tmpKeypairSecretKey!, 'base64'))
                console.log("Secret key size is: ", secretKeyUint8Array);
                return Keypair.fromSecretKey(secretKeyUint8Array);
            })
        }

        console.log("Local keypair is: ");
        console.log(tmpKeypairSecretKey);

    }, []);

    const value: ILocalKeypair = {
        localTmpKeypair,
    };

    return (
        <>
            <ILocalKeypairContext.Provider value={value}>
                {props.children}
            </ILocalKeypairContext.Provider>
        </>
    );
}
