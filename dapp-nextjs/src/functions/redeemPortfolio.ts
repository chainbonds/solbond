import {PublicKey, Transaction} from "@solana/web3.js";
import {lamportsReserversForLocalWallet} from "../const";
import {sendAndConfirmTransaction} from "../utils/utils";
import {BN} from "@project-serum/anchor";
import {IRpcProvider} from "../contexts/RpcProvider";
import {ILocalKeypair} from "../contexts/LocalKeypairProvider";
import {ICrank} from "../contexts/CrankProvider";
import {IItemsLoad} from "../contexts/ItemsLoadingContext";
import {IErrorMessage} from "../contexts/ErrorMessageContext";

/**
 * Withdraw a Portfolio workflow:
 * 1) approve_withdraw_to_user(ctx,amount_total):
 *      ctx: context of the portfolio
 *      amount: total amount of USDC in the portfolio
 *
 * 2) for position_i in range(num_positions):
 *          approve_withdraw_amount_{PROTOCOL_NAME}(ctx, args)
 * 3) for position_i in range(num_positions):
 *          withdraw
 *
 * 3) transfer_redeemed_to_user():
 *      transfers the funds back to the user
 *
 */
export const redeemPortfolio = async (
    rpcProvider: IRpcProvider,
    localKeypairProvider: ILocalKeypair,
    crankProvider: ICrank,
    itemLoadContext: IItemsLoad,
    errorMessage: IErrorMessage
) => {

    console.log("About to be redeeming!");
    await itemLoadContext.addLoadItem({message: "Fetching Account Information"});
    await itemLoadContext.addLoadItem({message: "Approving Redeem & Redeeming Positions"});
    await itemLoadContext.addLoadItem({message: "Redeeming Positions"});
    await itemLoadContext.addLoadItem({message: "Transferring Tokens Back to Your Wallet"});

    let USDC_mint = new PublicKey("2tWC4JAdL4AxEFJySziYJfsAnW2MHKRo98vbAPiRDSk8");
    let mSOL = rpcProvider.portfolioObject!.marinadeState.mSolMintAddress;
    console.log("mSOL address is: ", mSOL.toString());

    /************************************************************************************
     * TRANSACTION 1
     *************************************************************************************/
    /**
     * Approve that the Portfolio will be withdrawn
     */
    let tx: Transaction = new Transaction();
    console.log("Approving Withdraw Portfolio");
    let IxApproveWithdrawPortfolio = await rpcProvider.portfolioObject!.approveWithdrawPortfolio();
    tx.add(IxApproveWithdrawPortfolio);

    /**
     * Approve for each position individually (by protocol), that it will be withdrawn
     */
    console.log("Getting instructions to approve the transaction...");
    let {portfolio, positionsSaber, positionsMarinade, positionsSolend} = await rpcProvider.portfolioObject!.getPortfolioAndPositions();
    // await sendAndConfirmTransaction(
    //     rpcProvider._solbondProgram!.provider,
    //     rpcProvider.connection!,
    //     tx
    // );
    // tx = new Transaction();
    let txApproveRedeemAllPositions = await rpcProvider.portfolioObject!.approveRedeemAllPositions(
        portfolio,
        positionsSaber,
        positionsMarinade,
        positionsSolend
    );
    tx.add(txApproveRedeemAllPositions);
    // await sendAndConfirmTransaction(
    //     rpcProvider._solbondProgram!.provider,
    //     rpcProvider.connection!,
    //     tx
    // );
    // tx = new Transaction();

    /**
     * Send some SOL to the crank wallet, just in case it doesn't have enough lamports
     */
    console.log("Send some to Crank Wallet");
    let IxSendToCrankWallet = await rpcProvider.portfolioObject!.sendToCrankWallet(
        localKeypairProvider.localTmpKeypair!.publicKey,
        lamportsReserversForLocalWallet
    );
    tx.add(IxSendToCrankWallet);

    await itemLoadContext.incrementCounter();
    if (tx.instructions.length > 0) {
        try {
            await sendAndConfirmTransaction(
                rpcProvider._solbondProgram!.provider,
                rpcProvider.connection!,
                tx
            );
        } catch (error) {
            itemLoadContext.resetCounter();
            console.log(String(error));
            errorMessage.addErrorMessage(
                "Something went wrong approving the redeems!",
                String(error)
            );
        }
    }
    await itemLoadContext.incrementCounter();

    /************************************************************************************
     * TRANSACTION 2
     *************************************************************************************/
    /**
     * Run the crank transactions
     */
    console.log("Positions are: ");
    console.log(positionsSaber);
    console.log(positionsMarinade);
    console.log(positionsSolend);

    try {
        // TODO: Make this redeemAllPositions optional,
        console.log("Redeeming all postions")
        await crankProvider.crankRpcTool!.redeemAllPositions(portfolio, positionsSaber, positionsMarinade, positionsSolend);
        await itemLoadContext.incrementCounter();
        console.log("transferring to user usdc ...");
        // let sgTransferUsdcToUser = await crankProvider.crankRpcTool!.transfer_to_user(USDC_mint);
        // console.log("transferring to user usdc done");
        // console.log("Signature to send back USDC", sgTransferUsdcToUser);
        // let sgTransferMSolToUser = await crankProvider.crankRpcTool!.transfer_to_user(mSOL);
        // console.log("Signature to send back mSOL", sgTransferMSolToUser);
    } catch (error) {
        itemLoadContext.resetCounter();
        console.log(String(error));
        errorMessage.addErrorMessage(
            "Something went wrong approving the redeems!",
            String(error)
        );
    }

    // TODO: Swap mSOL ot marinade SOL optionally ...
    // TODO: Also make the marinade SOL disappear, and just airdrop new SOL
    /**
     * Send the lamports in the local crank wallet back to the user
     */
    let tmpWalletBalance: BN = new BN(await rpcProvider.connection!.getBalance(localKeypairProvider.localTmpKeypair!.publicKey));
    // This is approximately how much lamports is required for a single transaction...
    // TODO: Add this into a constants variable
    let lamportsBack = BN.min(tmpWalletBalance.subn(7_001), new BN(0));
    if (lamportsBack.gtn(0)) {
        let ix = await crankProvider.crankRpcTool!.sendToUsersWallet(
            localKeypairProvider.localTmpKeypair!.publicKey,
            lamportsBack
        );
        let tx2 = new Transaction();
        tx2.add(ix);
        try {
            await sendAndConfirmTransaction(
                crankProvider.crankRpcTool!.crankProvider,
                crankProvider.crankRpcTool!.connection!,
                tx2
            );
        } catch (error) {
            itemLoadContext.resetCounter();
            console.log(String(error));
            errorMessage.addErrorMessage(
                "Something went wrong approving the redeems!",
                String(error)
            );
        }
    }
    await itemLoadContext.incrementCounter();
    await rpcProvider.makePriceReload();
}