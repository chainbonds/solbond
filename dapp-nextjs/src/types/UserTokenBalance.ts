import {PublicKey, TokenAmount} from "@solana/web3.js";

export interface UserTokenBalance {
    mint: PublicKey,
    ata: PublicKey,
    amount: TokenAmount
}
