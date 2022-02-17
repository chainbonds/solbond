import {PublicKey} from "@solana/web3.js";

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



