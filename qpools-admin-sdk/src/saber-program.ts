import * as anchor from "@project-serum/anchor";
import {Connection} from "@solana/web3.js";
import {Provider} from "@project-serum/anchor";
import {Keypair, PublicKey} from "@solana/web3.js";
import {assert} from "chai";

import {
    StableSwap,
    findSwapAuthorityKey,
  } from "@saberhq/stableswap-sdk";

export const getSaberPool = async (connection: Connection, provider: Provider, pool_address: PublicKey) => {

    // Have a list of all addresses, based on DEVNET, MAINNET, ETC.
    const programAddress = "SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ";
  
    
    const programId = new anchor.web3.PublicKey(programAddress);
    const fetchedStableSwap = await StableSwap.load(
        connection,
        pool_address,
        programId
    );
    assert.ok(fetchedStableSwap.config.swapAccount.equals(
        pool_address)
      );
    
    const {state} = fetchedStableSwap
    return state;
}
