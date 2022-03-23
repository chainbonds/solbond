import React, {FC} from "react";
import {FaFaucet} from "react-icons/fa";
import {useWallet} from "@solana/wallet-adapter-react";
import {BN} from "@project-serum/anchor";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import airdropAdmin from "@qpools/sdk/src/devnet/airdropAdmin";
import {Connection, Transaction} from "@solana/web3.js";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {useLoad} from "../../contexts/LoadingContext";
import {createAssociatedTokenAccountSendUnsigned, MOCK} from "@qpools/sdk";
import {delay} from "@qpools/sdk/lib/utils";

export const FaucetButton: FC = ({}) => {

    // TODO Implement logic to airdrop some currency ...
    const walletProvider: any = useWallet();
    const rpcProvider: IRpcProvider = useRpc();
    const loadContext = useLoad();

    // Onclick, alert that the user must connect his wallet first!
    const faucetAssets = async () => {
        console.log("Requesting airdrop...");

        // Let's airdrop 3 SOL to the user
        let _airdropAmount: number = 5;
        // TODO: USDC has 6 decimal items, gotta consider this!
        let airdropAmount: BN = new BN(_airdropAmount).mul(new BN(10 ** MOCK.DEV.SABER_USDC_DECIMALS));
        if (!rpcProvider.userAccount || !rpcProvider.userAccount!.publicKey) {
            alert("Please connect your wallet first!");
            return
        }
        await loadContext.increaseCounter();

        // Airdrop some solana first, to make sure we can run this transaction ...
        if ((await rpcProvider.connection!.getBalance(rpcProvider.userAccount!.publicKey)) <= 5e9) {
            let tx0 = await rpcProvider.connection!.requestAirdrop(rpcProvider.userAccount!.publicKey, 1e9 + 2e8);
            await rpcProvider.connection!.confirmTransaction(tx0, 'finalized');
            console.log("Airdropped 1 SOL!");
        }

        console.log("Initializing QPoolsUserTool");
        await rpcProvider.initializeQPoolsUserTool(walletProvider);
        await delay(500);

        // TODO: Generate a USDC account
        console.log("Registering Account");
        console.log(airdropAdmin);
        console.log("Currency mint is: ", rpcProvider.currencyMint!.publicKey.toString());

        ///////////////////////////
        // Create an associated token account for the currency if it doesn't exist yet
        console.log("QPool context is: ", rpcProvider);
        console.log("Currency mint is: ", rpcProvider.currencyMint);
        // TODO: Might have to bundle this with the transaction below
        console.log("Inputs are: ");
        console.log({
            "1": rpcProvider.connection!,
            "2": rpcProvider.currencyMint!.publicKey,
            "3": rpcProvider.provider!.wallet.publicKey,
            "4": rpcProvider.provider!.wallet
        })
        const currencyMintUserAccount = await createAssociatedTokenAccountSendUnsigned(
            rpcProvider.connection!,
            rpcProvider.currencyMint!.publicKey,
            rpcProvider.provider!.wallet.publicKey,
            rpcProvider.provider!.wallet
        );
        console.log("Currency Mint User Account: ", currencyMintUserAccount.toString());
        const currencyAdminAccount = await createAssociatedTokenAccountSendUnsigned(
            rpcProvider.connection!,
            rpcProvider.currencyMint!.publicKey,
            airdropAdmin.publicKey,
            rpcProvider.provider!.wallet
        );

        console.log("Currency admin account is: ", currencyAdminAccount.toString());

        // TODO: Replace this with "transfer-to" instructions
        console.log("Working");
        let transaction = new Transaction();

        console.log("All items: ",
            {
                "1": TOKEN_PROGRAM_ID.toString(),
                "2": currencyAdminAccount.toString(),
                "3": rpcProvider!.currencyMint!.publicKey.toString(),
                "4": currencyMintUserAccount.toString(),
                "5": airdropAdmin.publicKey.toString(),
                "6": [],
                "7": airdropAmount.toNumber(),
                "8": 6
            }
        )
        let transferToInstruction = Token.createTransferCheckedInstruction(
            TOKEN_PROGRAM_ID,
            currencyAdminAccount,
            rpcProvider!.currencyMint!.publicKey,
            currencyMintUserAccount,
            airdropAdmin.publicKey,
            [],
            airdropAmount.toNumber(),
            6
        );
        console.log("Created instruction");
        transaction.add(transferToInstruction);
        console.log("Added tx");
        const blockhash = await rpcProvider.connection!.getRecentBlockhash();
        console.log("Added blockhash");
        transaction.recentBlockhash = blockhash.blockhash;
        let connection: Connection = rpcProvider.connection!;
        console.log("Added connection");
        const tx1 = await connection.sendTransaction(
            transaction,
            [airdropAdmin]
        );
        console.log("Added transaction");
        await connection.confirmTransaction(tx1);
        console.log("Should have received: ", airdropAmount.toNumber());
        console.log("Airdropped tokens! ", airdropAmount.toString());

        await rpcProvider.makePriceReload();

        await loadContext.decreaseCounter();
    };

    // TODO: If the rpc provider is not loaded, should prob render something else ...(?)


    return (
        <>
            <button
                className="border border-gray-500 text-white font-bold py-3 px-7 rounded "
                onClick={() => faucetAssets()}
            >
                <div className={"flex flex-row"}>
                    <div className={"py-auto my-auto pr-3"}>
                        <FaFaucet/>
                    </div>
                    FAUCET
                </div>
            </button>
        </>
    );
};
