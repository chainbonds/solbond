import React from "react";
import {BN} from "@project-serum/anchor";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {PublicKey, Transaction} from "@solana/web3.js";
import {sendAndConfirmTransaction} from "../../utils/utils";
import {useWallet} from "@solana/wallet-adapter-react";
import {useItemsLoad} from "../../contexts/ItemsLoadingContext";
import {MOCK} from "@qpools/sdk";

export default function PurchaseButton(props: any) {

    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const itemLoadContext = useItemsLoad();

    // const [totalAmountInUsdc, setTotalAmountInUsdc] = useState<number>(0.);
    // useEffect(() => {
    //     if (props.valueInUsdc) {
    //         console.log("Defined!: ", props.valueInUsdc);
    //         setTotalAmountInUsdc(props.valueInUsdc);
    //     } else {
    //         console.log("WARNING: Prop is empty!", props.valueInUsdc);
    //     }
    // }, [props.valueInUsdc]);

    const buyItem = async () => {

        // let valueInUsdc = props.valueInUsdc;
        if (!qPoolContext.userAccount!.publicKey) {
            alert("Please connect your wallet first!");
            return
        }

        // Also make sure that the portfolio was loaded ...
        // if (!qPoolContext.portfolioRatios) {
        //     alert("Please try again in a couple of seconds (We should really fix this error message)");
        //     return
        // }
        //
        // if (!qPoolContext.portfolioRatios[0].pool) {
        //     alert("Please try again in a couple of seconds (We should really fix this error message) 2");
        //     return
        // }

        // TODO: Add this
        // if ((typeof valueInUsdc) != number) {
        //     throw Error("Value in USDC is not a number");
        // }

        await itemLoadContext.addLoadItem({message: "Preparing Transaction"});
        await itemLoadContext.addLoadItem({message: "(Sign): Creating Associated Token Accounts"});
        await itemLoadContext.addLoadItem({message: "Sign: Create Portfolio & Sending Asset"});
        await itemLoadContext.addLoadItem({message: "Running cranks to distribute assets across liquidity pools..."});

        // Initialize if not initialized yet
        await qPoolContext.initializeQPoolsUserTool(walletContext);
        await itemLoadContext.incrementCounter();


        // Define mSOL send amount
        // Define USDC send amount

        // ==> Let that be like part of the wallet
        // We can also airdrop some stuff for now

        // Define the same for wrapped SOL, lol

        // For all LP tokens

        // Define all LP tokens here, and also their respective assets
        // Which should also allow for more assets
        // TODO: Remove this hardcoded values, and look these up from the backend JSON API
        let USDC_mint = new PublicKey("2tWC4JAdL4AxEFJySziYJfsAnW2MHKRo98vbAPiRDSk8");
        let USDC_USDT_pubkey: PublicKey = new PublicKey("VeNkoB1HvSP6bSeGybQDnx9wTWFsQb2NBCemeCDSuKL");  // This is the pool address, not the LP token ...
        let mSolLpToken: PublicKey = new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So");  // Assume the LP token to be the denominator for what underlying asset we target ...

        let assetLpMints = [USDC_USDT_pubkey, mSolLpToken];
        let weights: BN[] = [new BN(1000), new BN(1000)];

        /**
         * First, define the weights, and positions
         * The weights will be defined (exactly), by the mSOL and USDC ratio, the total should sum to 1000
         * Until then, assume that we have a weight of 1000 each (this weight thing is confusing when it's multi-asset)
         */
        // Make sure each one does not have null values
        assetLpMints = assetLpMints.filter((mint: PublicKey, index: number) => {return weights[index].gt(new BN(0))});
        weights = weights.filter((weight: BN) => {return weight.gt(new BN(0))});
        // Once we hook it up to the other system, we can probably use something like this
        // let weights: BN[] = qPoolContext.portfolioRatios
        //     .filter((item: AllocData) => {return item.weight > 0})
        //     .map((item: AllocData) => {return new BN(item.weight)});
        // let poolAddresses: PublicKey[] = qPoolContext.portfolioRatios
        //     .filter((item: AllocData) => {return item.weight > 0})
        //     .map((item: AllocData) => {return new PublicKey(item.pool!.swap.config.swapAccount)});

        // let poolAddresses: PublicKey[] = [USDC_USDT_pubkey, mSOLLpToken];

        // Filter these, if any is 0
        // TODO: Not going for this right now. Just check that the user actually has enough balance in his wallet

        // If poolAddresses or weights are empty, don't proceed!
        if (weights.length === 0 || assetLpMints.length === 0) {
            throw Error("Weights or PoolAddresses are empty!");
        }
        if (weights.length != assetLpMints.length) {
            throw Error("Weights and PoolAddresses do not conform!");
        }
        if (!(weights.length > 0)) {
            throw Error("All weights are zero! Doesn't make sense to create a portfolio");
        }


        /**
         *
         * INSTRUCTIONS TO BUY
         * TODO: Modify this according to the new version
         *
         * This model creates a portfolio where the base currency is USDC i.e the user only pays in USDC.
         * The steps 1-3 are permissioned, meaning that the user has to sign client side. The point is to
         * make these instructions fairly small such that they can all be bundled together in one transaction.
         * Create a Portfolio workflow:
         * 1) create_portfolio(ctx,bump,weights,num_pos,amount_total):
         *      ctx: context of the portfolio
         *      bump: bump for the portfolio_pda
         *      weights: the weights in the portfolio (check if sum is normalized)
         *      num_positions: number of positions this portfolio will have
         *      amount: total amount of USDC in the portfolio
         *
         * 2) for position_i in range(num_positions):
         *          approve_position_weight_{PROTOCOL_NAME}(ctx, args)
         *
         * 3) transfer_to_portfolio():
         *      transfers the agreed upon amount to a ATA owned by portfolio_pda
         *
         */

        // Split it up into multiple transactions ...
        /**
         * Create Associated Token Accounts for the PDA, if not exists, yet
         */
        // TODO: Gotta normalize weights up to 1000
        // TODO:
        // Have a look at this; but this is still needed!
        console.log("Creating associated token accounts ...");
        let txCreateATA: Transaction = await qPoolContext.portfolioObject!.createAssociatedTokenAccounts([assetLpMints[0]], qPoolContext.provider!.wallet);
        if (txCreateATA.instructions.length > 0) {
            await sendAndConfirmTransaction(
                qPoolContext._solbondProgram!.provider,
                qPoolContext.connection!,
                txCreateATA
                // qPoolContext.userAccount!.publicKey
            );
        }
        await itemLoadContext.incrementCounter();

        // TODO: change depending on user input
        let valueInUsdc: number = 2;
        let AmountUsdc: BN = new BN(valueInUsdc).mul(new BN(10**MOCK.DEV.SABER_USDC_DECIMALS));
        let valueInSol: number = 1;
        // I guess mSOL has 9 decimal points
        let AmountSol: BN = new BN(valueInSol).mul(new BN(10**9));
        console.log("Total amount in Usdc is: ", valueInUsdc);

        if (!(valueInUsdc > 0)) {
            throw Error("Amount to be paid in must be bigger than 0");
        }

        /**
         *
         * Transaction 1:
         * - Create Signed Portfolio
         * - Register the Currencies that the PortfolioPDA will posses
         * - Send the Currencies to Portfolio
         *
         */
        // TODO: Should not be a try catch around
        console.log("Creating Portfolio");
        let tx: Transaction = new Transaction();
        let IxCreatePortfolioPda = await qPoolContext.portfolioObject!.createPortfolioSigned(
            weights,
            poolAddresses
        );
        tx.add(IxCreatePortfolioPda);

        console.log("Transfer Asset to Portfolio");
        // TODO: Check if they exist, if they already do exist, don't rewrite these ...
        let IxRegisterCurrencyUsdcInput = await qPoolContext.portfolioObject!.registerCurrencyInputInPortfolio(
            AmountUsdc, USDC_mint
        );
        tx.add(IxRegisterCurrencyUsdcInput);
        // let IxRegisterCurrencyMSolInput = await qPoolContext.portfolioObject!.registerCurrencyInputInPortfolio(
        //     AmountSol, wrappedSolMint
        // );
        // tx.add(IxRegisterCurrencyMSolInput);

        // Set of instructions here are hard-coded

        // Create position approve for marinade, and the saber pool (again, hardcode this part lol).
        // Later these should be fetched from the frontend.
        console.log("Approve Position Saber");
        // I guess we gotta make the case distinction here lol
        // TODO: Copy the case-distinction from below. Then you can continue
        // TODO: figure out tokenA and tokenB ==> Currently hard-coded...
        let IxApproveiPositionWeightSaber = await qPoolContext.portfolioObject!.approvePositionWeightSaber(
            poolAddresses[0],
            AmountUsdc,
            new BN(0),  // Will be flipped in the backend ..
            new BN(0),
            0,  // Hardcoded
            weights[0]
        )
        tx.add(IxApproveiPositionWeightSaber);

        console.log("Approve Position Marinade");
        let IxApprovePositionWeightMarinade = await qPoolContext.portfolioObject!.approvePositionWeightMarinade(
            AmountSol,
            1, // Hardcoded
            weights[1]
        );
        tx.add(IxApprovePositionWeightMarinade);

        console.log("Sending USDC");
        let IxSendUsdcToPortfolio = await qPoolContext.portfolioObject!.transfer_to_portfolio(USDC_mint);
        tx.add(IxSendUsdcToPortfolio);

        console.log("Depositing some SOL to run the cranks ...");
        let IxSendToCrankWallet = await qPoolContext.portfolioObject!.sendToCrankWallet(
            qPoolContext.localTmpKeypair!.publicKey,
            100_000_000
        );
        tx.add(IxSendToCrankWallet);

        console.log("Sending and signing the transaction");
        console.log("Provider is: ");
        console.log(qPoolContext._solbondProgram!.provider);
        console.log(qPoolContext._solbondProgram!.provider.wallet.publicKey.toString());
        await sendAndConfirmTransaction(
            qPoolContext._solbondProgram!.provider,
            qPoolContext.connection!,
            tx
        );
        await itemLoadContext.incrementCounter();

        /**
         *
         * Transaction 2 (Cranks):
         *
         */
        console.log("Permissoinlessly fulfilling the transactions");
        // await qPoolContext.crankRpcTool!.fullfillAllPermissionless();
        // For now, don't do a forloop, just fulfill the two positions
        let sgPermissionlessFullfillSaber = await qPoolContext.crankRpcTool!.permissionlessFulfillSaber(0);
        console.log("Fulfilled sg Saber is: ", sgPermissionlessFullfillSaber);
        let sgPermissionlessFullfillMarinade = await qPoolContext.crankRpcTool!.createPositionMarinade(1);
        console.log("Fulfilled sg Marinade is: ", sgPermissionlessFullfillMarinade);
        await itemLoadContext.incrementCounter();

        console.log("Updating price ...");
        // Add another Counter "running cranks"
        await qPoolContext.makePriceReload();

        console.log("Done!");


        /**
         *
         * Transaction: START OF OLD IMPLEMENTATION
         *
         */
        // TODO: =======> START OF OLD IMPLEMENTATION
        // /**
        //  * Send USDC to the portfolio. Later on, we can create instructions to send all assets into the portfolio
        //  */
        // // Finally, also transfer the USDC to the portfolio
        // // Only create this portfolio, if it doesn't exist ...
        // // TODO: Create portfolio should be able to be called multiple times
        //
        // console.log("Adding createPortfolioSigned");
        // // let IxCreatePortfolioPda: TransactionInstruction = await qPoolContext.portfolioObject!.createPortfolioSigned(
        // //     weights,
        // //     poolAddresses,
        // //     sendAmount
        // // );
        // tx.add(IxCreatePortfolioPda);
        // console.log("Adding transferUsdcFromUserToPortfolio");
        // let IxSendUsdcToPortfolio = await qPoolContext.portfolioObject!.transferUsdcFromUserToPortfolio();
        // tx.add(IxSendUsdcToPortfolio);
        // await itemLoadContext.incrementCounter();
        //
        // console.log("Other instructions ...");
        // // TODO: Gotta double-check if A or B is the right one
        // // Get the user's complete tokenA, and do tokenA times weight to be deposited here
        // // Get the user's complete tokenB, and do tokenB times weight to be deposited here
        // // Same for every pool
        //
        // let instructionsBeforeAdding: number = tx.instructions.length;
        //
        // // Calculate according to totalSendAmount
        // await Promise.all(poolAddresses.map(async (poolAddress: PublicKey, index: number) => {
        //
        //     const stableSwapState = await qPoolContext.portfolioObject!.getPoolState(poolAddress);
        //     const {state} = stableSwapState;
        //
        //     let amountA = new BN(0);
        //     let amountB = new BN(0);
        //
        //     // Now make an if-else, based on which mintA or mintB corresponds to the USDC
        //     if ((new PublicKey(MOCK.DEV.SABER_USDC)).equals(state.tokenA.mint)) {
        //         // On a separate occasion, check if the sendAmount is higher than the max amount, etc.
        //         amountA = sendAmount;
        //     } else if ((new PublicKey(MOCK.DEV.SABER_USDC)).equals(state.tokenB.mint)) {
        //         amountB = sendAmount;
        //     } else {
        //         console.log('Saber USDC does not correspond to either entity!');
        //         return
        //     }
        //
        //     console.log("Amount before multiply by weight is.. ", amountA.toString());
        //     console.log("Amount before multiply by weight is.. ", amountB.toString());
        //     console.log("Condition1: ", !amountA.eq(new BN(0)));
        //     console.log("Condition2: ", !amountB.eq(new BN(0)));
        //
        //     // Only initiate this transaction, if either of amountA or amountB is not zero
        //     if (!(amountA.eq(new BN(0)) && amountB.eq(new BN(0)))) {
        //         // Gotta translate to BN, or otherwise there will be truncation errors!
        //         let weight = weights[index];
        //         // denominator
        //         let weightDenominator = weights.reduce((a, b) => {return a.add(b)}, new BN(0));
        //         console.log("Weight denominator is: ", weightDenominator)
        //         amountA = weight.mul(amountA).div(weightDenominator);
        //         amountB = weight.mul(amountB).div(weightDenominator);
        //         console.log("Amount after multiply weight is.. ", amountA.toString());
        //         console.log("Amount after multiply weight is.. ", amountB.toString());
        //         let IxApprovePositionWeightSaber = await qPoolContext.portfolioObject!.approvePositionWeightSaber(
        //             poolAddresses,
        //             amountA,
        //             amountB,
        //             new BN(0),
        //             index,
        //             weight
        //         );
        //         tx.add(IxApprovePositionWeightSaber);
        //     }
        //
        // }));
        //
        // if (instructionsBeforeAdding === tx.instructions.length) {
        //     throw Error("No positions added, aborting transaction!");
        // }
        //
        // // Finally, send some funds to the local tmp keypair
        // // By default, just send some SOL
        // // For now, just send 0.1 SOL to the crank wallet. This should be enough.
        // // We can send this back, when the items are redeemed
        // let IxSendToCrankWallet = await qPoolContext.portfolioObject!.sendToCrankWallet(
        //     qPoolContext.localTmpKeypair!.publicKey,
        //     100_000_000
        // );
        // tx.add(IxSendToCrankWallet);
        //
        // // Now sign this transaction
        // await sendAndConfirmTransaction(
        //     qPoolContext._solbondProgram!.provider,
        //     qPoolContext.connection!,
        //     tx,
        //     qPoolContext.userAccount!.publicKey
        // );
        // await itemLoadContext.incrementCounter();
        //
        // // TODO: Should be taken from positions, not from the saved list!
        // // Perhaps you should encapsulate all this logic in a separate "run-all-cranks" function
        // // Now run cranks. Get all positions that were created. Iterate through all. And execute all of them.
        // // positionAccount
        // await qPoolContext.crankRpcTool!.fullfillAllPermissionless();
        // await itemLoadContext.incrementCounter();
        // // Add another Counter "running cranks"
        // await qPoolContext.makePriceReload();

        // TODO: Display a message "Portfolio created"!
    }

    return (
        <>
            <button
                type="button"
                // py-2.5
                className="px-10 h-12 my-auto bg-pink-700 text-white text-md font-semibold leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                onClick={() => {
                    console.log("Redeem stupid Position");
                    buyItem();
                }}
            >
                Deposit
            </button>
            {/*<div className="flex w-full bg-slate-800 justify-center md:justify-end">*/}
            {/*    <button*/}
            {/*        type={props.type}*/}
            {/*        onClick={props.onClick}*/}
            {/*        className={"rounded-lg text-xl font-semibold bg-pink-700 hover:bg-pink-900 h-12 w-full text-center align-middle"}*/}
            {/*    >*/}
            {/*        {props.text}*/}
            {/*    </button>*/}
            {/*</div>*/}
        </>
    )

}
