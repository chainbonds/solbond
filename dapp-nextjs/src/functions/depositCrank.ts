

// Onclick, alert that the user must connect his wallet first!
import {Transaction} from "@solana/web3.js";
import {lamportsReserversForLocalWallet} from "../const";
import {sendAndConfirmTransaction} from "../utils/utils";
import {ILocalKeypair} from "../contexts/LocalKeypairProvider";
import {IRpcProvider} from "../contexts/RpcProvider";
import {IItemsLoad} from "../contexts/ItemsLoadingContext";
import {IErrorMessage} from "../contexts/ErrorMessageContext";
import {ICrank} from "../contexts/CrankProvider";

export const depositCrank = async (
    itemLoadContext: IItemsLoad,
    localKeypairProvider: ILocalKeypair,
    rpcProvider: IRpcProvider,
    errorMessage: IErrorMessage,
    crankProvider: ICrank
) => {
    console.log("Requesting airdrop...");

    await itemLoadContext.addLoadItem({message: "Depositing lamports to Crank Wallet"});
    await itemLoadContext.addLoadItem({message: "Runnning Cranks"});


    /**
     * First, send some SOL to the crank wallet. Technically, we could also just do it at this point ...
     */
    let tx: Transaction = new Transaction();
    console.log("Depositing some SOL to run the cranks ...");
    // This much SOL should suffice for now probably ...
    let IxSendToCrankWallet = await rpcProvider.portfolioObject!.sendToCrankWallet(
        localKeypairProvider.localTmpKeypair!.publicKey,
        lamportsReserversForLocalWallet
    );
    tx.add(IxSendToCrankWallet);
    console.log("Sending and signing the transaction");
    console.log("Provider is: ");
    console.log(rpcProvider._solbondProgram!.provider);
    console.log(rpcProvider._solbondProgram!.provider.wallet.publicKey.toString());
    try {
        await sendAndConfirmTransaction(
            rpcProvider._solbondProgram!.provider,
            rpcProvider.connection!,
            tx
        );
    } catch (error) {
        itemLoadContext.resetCounter();
        console.log(error);
        errorMessage.addErrorMessage(
            "create_portfolio",
            "Something went wrong creating the portfolio",
            String(error)
        );
        return;
    }
    await itemLoadContext.incrementCounter();

    /**
     * Then, run the cranks
     */
    try {
        let {portfolio, positionsSaber, positionsMarinade, positionsSolend} = await rpcProvider.portfolioObject!.getPortfolioAndPositions();
        await crankProvider.crankRpcTool!.depositAllPositions(portfolio, positionsSaber, positionsMarinade, positionsSolend);
    } catch (error) {
        itemLoadContext.resetCounter();
        console.log(String(error));
        errorMessage.addErrorMessage(
            "crank_portfolio_saber",
            "Fulfilling the Saber Protocol failed.",
            String(error)
        );
        return;
    }
    await itemLoadContext.incrementCounter();

    alert("Crank successful! You might have to reload the page for assets to be updated");
    await rpcProvider.makePriceReload();
};