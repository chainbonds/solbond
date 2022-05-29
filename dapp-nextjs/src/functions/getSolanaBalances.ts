import {BN} from "@project-serum/anchor";
import {getAssociatedTokenAddress} from "easy-spl/dist/tx/associated-token-account";
import {getWrappedSolMint} from "@qpools/sdk";
import {IRpcProvider} from "../contexts/RpcProvider";
import {ConnectedWallet} from "@saberhq/use-solana";

export const getSolanaBalances = async (rpcProvider: IRpcProvider, walletContext: ConnectedWallet | null): Promise<{wrappedSol: BN, nativeSol: BN}> => {
    // This returns the lamports, and so does the below item ...
    let nativeSolAmount: BN = new BN(await rpcProvider.connection.getBalance(walletContext!.publicKey!));
    let wrappedSolAta = await getAssociatedTokenAddress(
        getWrappedSolMint(),
        walletContext!.publicKey!
    );
    let wrappedSolAmount: BN = new BN((await rpcProvider.connection.getTokenAccountBalance(wrappedSolAta)).value.amount);
    return {wrappedSol: wrappedSolAmount, nativeSol: nativeSolAmount}
}
