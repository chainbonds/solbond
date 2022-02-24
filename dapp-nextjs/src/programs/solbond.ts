import * as anchor from "@project-serum/anchor";
import {Connection} from "@solana/web3.js";

import {Provider} from "@project-serum/anchor";
import { SolbondIdl } from "@qpools/sdk";

export const solbondProgram = (connection: Connection, provider: Provider) => {

    console.log("Solbond Program ID is: ", String(process.env.NEXT_PUBLIC_PROGRAM_ID));
    const programId = new anchor.web3.PublicKey(String(process.env.NEXT_PUBLIC_PROGRAM_ID));
    const program = new anchor.Program(
        SolbondIdl,
        programId,
        provider,
    );

    return program;
}
