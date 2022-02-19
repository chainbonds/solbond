import {Connection, PublicKey, Transaction} from "@solana/web3.js";
import {Provider} from "@project-serum/anchor";

export const solscanLink = (address: PublicKey) => {
    let out = "https://solscan.io/account/";
    out += address.toString();
    out += "?cluster=devnet";
    return out;
}

export const shortenedAddressString = (_address: PublicKey) => {
    let address: string = _address.toString();
    if (address.length < 6) {
        return address
    }
    let out: string = address.substring(0, 3);
    out += "..";
    out += address.substring(address.length - 3, address.length);
    return out;
}

export const sendAndConfirmTransaction = async (
    programProvider: Provider,
    connection: Connection,
    tx: Transaction,
    feePayer: PublicKey
) => {
    // Get blockhash
    const blockhash = await connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash.blockhash!;
    tx.feePayer = feePayer;
    // Assign feePayer

    // Send and Confirm
    console.log("Signing transaction 2...");
    let sg1 = await programProvider.send(tx);
    console.log("sg1 is: ", sg1);
    await connection.confirmTransaction(sg1);
}
