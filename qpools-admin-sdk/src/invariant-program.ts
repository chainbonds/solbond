import * as anchor from "@project-serum/anchor";
import {clusterApiUrl, Connection} from "@solana/web3.js";
import {Provider} from "@project-serum/anchor";

// Not sure if this import is allowed...
//@ts-ignore
import _invariant_idl from '../../solbond/deps/protocol/target/idl/invariant.json';
import {NETWORK} from "@qpools/sdk/lib/cluster";
const invariant_idl: any = _invariant_idl;

export const getInvariantProgram = (connection: Connection, provider: Provider, network: NETWORK = NETWORK.LOCALNET) => {

    let programAddress;
    if (network == NETWORK.LOCALNET) {
        programAddress = "77yFpTqxesQNz7Styk6yTRBaEcW9LxDKPvA46HfuA77z";
    } else if (network == NETWORK.DEVNET) {
        programAddress = "95B4XeB4YWCGZjwv32Qgkh92CwKucR9TreoLzqKWEdSE";
    } else if (network == NETWORK.TESTNET) {
        programAddress = "77yFpTqxesQNz7Styk6yTRBaEcW9LxDKPvA46HfuA77z";
    } else if (network == NETWORK.MAINNET) {
        programAddress = "77yFpTqxesQNz7Styk6yTRBaEcW9LxDKPvA46HfuA77z";
    } else {
        throw Error("Solana Cluster not specified!" + String(network));
    }

    const programId = new anchor.web3.PublicKey(programAddress);
    const program = new anchor.Program(
        invariant_idl,
        programId,
        provider,
    );

    return program;
}
