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
    console.log("Signing transaction...");
    console.log("About to send the following transactions: ", tx);
    console.log("Program provider is: ", programProvider, typeof programProvider);
    let sg = await programProvider.send(tx);
    console.log("sg1 is: ", sg);
    await connection.confirmTransaction(sg, 'confirmed');
}
