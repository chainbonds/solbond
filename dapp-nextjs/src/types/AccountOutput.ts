import {PublicKey, TokenAmount} from "@solana/web3.js";

export interface AccountOutput {
    index: number,
    poolAddress: PublicKey,
    owner: PublicKey,
    // portfolio: PublicKey,
    positionPda: PublicKey,
    mintA: PublicKey,
    ataA: PublicKey,
    amountA: TokenAmount,
    mintB: PublicKey,
    ataB: PublicKey,
    amountB: TokenAmount,
    mintLp: PublicKey,
    ataLp: PublicKey,
    amountLp: TokenAmount,
};
