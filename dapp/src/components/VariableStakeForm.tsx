/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';
import {clusterApiUrl, Connection, Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {BN, web3, Wallet as AnchorWallet} from "@project-serum/anchor";
import {Wallet, Mint} from "../splpasta";
import axios from "axios";
import {
    createAssociatedTokenAccountSend,
    createAssociatedTokenAccountSendUnsigned
} from "../splpasta/tx/associated-token-account";
import {useState} from "react";
import {solbondProgram} from "../programs/solbond";
import {Marinade} from "../programs/marinade";

export default function VariableStakeForm(props: any) {

    // TODO: Implement Solana input field
    const {register, handleSubmit} = useForm();
    const walletContext: any = useWallet();
    const [accountInfo, setAccountInfo] = useState({});

    const submitToContract = async (d: any) => {

        // Create a new marina program

        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const provider = new anchor.Provider(connection, walletContext, anchor.Provider.defaultOptions());
        anchor.setProvider(provider);

        // (1) Generate the solbond provider
        // Will send some instructions to our smart contract from here
        const programSolbond: any = solbondProgram(connection, provider);
        // const programMarinade: any = marinadeProgram(connection, provider);

        console.log("Submitting logs");

        // TODO: Implement RPC Call
        console.log(JSON.stringify(d));

        const userAccount: Wallet = new Wallet(connection, provider.wallet);
        console.log("Phantom user account is: ", userAccount);
        console.log("Provider is: ", provider);

        /**
         * Extract arguments from the form
         */
        const bondTimeFrame: BN = new BN(d["timeInSeconds"]);
        const sendAmount: BN = new BN(d["amount"]);

        /**
         * Fetch the wallet user
         */
        const _userAccount: Wallet = new Wallet(connection, provider.wallet);
        console.log("Phantom user account is: ", _userAccount);
        const purchaser: Wallet = _userAccount;

        if (!purchaser.publicKey) {
            alert("Please connect your wallet first!");
            return
        }

        /**
         * Get a pool signer together
         */
        // Pool Signer is a new program-account, which has power over the pool
        console.log("Purchaser public key is: ", purchaser);
        const [bondSigner, _bump] = await PublicKey.findProgramAddress(
            [purchaser.publicKey.toBuffer()],
            programSolbond.programId
        );

        /**
         * Create the redeemable Mint, and the associated token account for the user
         */
        const bondAccount = Keypair.generate();
        const bondSolanaAccount = Keypair.generate();
        console.log("PoolAccount Public Key is: ", bondAccount.publicKey.toBase58(), bondAccount.secretKey.toString());
        console.log("Signer Public Key is: ", bondSigner.toBase58());

        console.log("Purchaser.publickey is: ", purchaser.publicKey.toBase58(), purchaser);

        const redeemableMint: Mint = await Mint.create(connection, 9, bondSigner, purchaser);
        console.log("Mint Public Key is: ", redeemableMint.key.toBase58());
        const purchaserRedeemableTokenAccount: PublicKey = await createAssociatedTokenAccountSend(connection, redeemableMint.key, purchaser.publicKey, purchaser);
        console.log("purchaserRedeemableTokenAccount: ", purchaserRedeemableTokenAccount.toBase58());
        const bondRedeemableTokenAccount: PublicKey = await createAssociatedTokenAccountSendUnsigned(connection, redeemableMint.key, bondSigner, purchaser);
        console.log("bondRedeemableTokenAccount: ", bondRedeemableTokenAccount.toBase58());

        // Hz9gRN4wQithVQtbvEtzQpYLGi9KCcCfwaUrar6H3xMg

        const bump = new BN(_bump);

        /**
         * Make the actual RPC Call
         */
        const addressContext: any = {
            bondAccount: bondAccount.publicKey,
            bondAuthority: bondSigner,
            initializer: purchaser.publicKey,
            initializerTokenAccount: purchaserRedeemableTokenAccount,
            bondTokenAccount: bondRedeemableTokenAccount,
            bondSolanaAccount: bondSolanaAccount.publicKey,
            redeemableMint: redeemableMint.key,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        };

        console.log("\n");
        console.log("Bond Account: ", bondAccount.publicKey.toString())
        console.log("bondAuthority: ", bondSigner.toString());
        console.log("initializer: ", purchaser.publicKey.toString());
        console.log("purchaserRedeemableTokenAccount: ", purchaserRedeemableTokenAccount.toString());
        console.log("redeemableMint: ", redeemableMint.key.toString());
        console.log("\n");

        // console.log("Getting RPC Call", addressContext);
        console.log("Arguments are: ", bump.toString(), bondTimeFrame.toString(), sendAmount.toString())

        // The full transaction history
        // Start to create a new transaction from multiple instructions!

        const initializeInstruction = await programSolbond.rpc.initialize(
            bump,
            bondTimeFrame,
            sendAmount,
            {
                accounts: addressContext,
                signers: [bondAccount]
            }
        );

        await provider.connection.confirmTransaction(initializeInstruction);
        console.log("Your transaction signature", initializeInstruction);

        // (2) Now will create a provider for the marinade SOL account
        const bondSolanaWallet: AnchorWallet = new AnchorWallet(bondSolanaAccount);
        console.log("Generating bondSolanaProvider with this: ", bondSolanaWallet.publicKey.toBase58());
        const bondSolanaProvider = new anchor.Provider(connection, bondSolanaWallet, anchor.Provider.defaultOptions());
        console.log("Resulting provider is this: ", bondSolanaProvider);
        const programMarinade = new Marinade(connection, bondSolanaProvider);

        const transaction = new web3.Transaction()

        // TODO: Might have to create an associated token account first though

        const moveToMarinadeInstruction = await programMarinade.depositInstructions(
            // ownerAddress: PublicKey,
            // amountLamports: BN
            // Basically get all the send amount, and send it in
            bondSolanaWallet,
            new BN(1_000_000_000)
        );
        console.log("Second type of instructions are: ", moveToMarinadeInstruction);

        moveToMarinadeInstruction.map((instruction: any) => {
            transaction.add(instruction);
        });

        // Now move the instruction
        const transactionSignature = await provider.send(transaction);
        console.log("Sent transaction signature is: ", transactionSignature);

        // return;
        //
        //
        // const initializeTx = await programSolbond.rpc.initialize(
        //     bump,
        //     bondTimeFrame,
        //     sendAmount,
        //     {
        //         accounts: addressContext,
        //         signers: [bondAccount]
        //     }
        // );


        /**
         * All created items are:
         */
        console.log("RPC Call is: ");

        // props.initializeRpcCall(d);

        console.log("Address context is: ", addressContext);

        setAccountInfo((_prev: any) => {
            return addressContext
        })

        /**
         * Will now save into the mongodb database
         */

            // Metaverse name
        let metaverse_name = (Math.random() + 1).toString(36).substring(7);

        console.log("Request made with body: ");
        const requestBody: any = {
            user: purchaser.publicKey.toBase58(),
            bump: _bump,
            bondTimeFrame: bondTimeFrame.toNumber(),
            sendAmount: sendAmount.toNumber(),
            // TODO: Also store the bond-account private key I guess
            //  Do we also need to store the private key somewhere?
            bondAccount: bondAccount.publicKey.toBase58(),
            bondAuthority: bondSigner.toBase58(),
            initializer: purchaser.publicKey.toBase58(),
            initializerTokenAccount: purchaserRedeemableTokenAccount.toBase58(),
            bondTokenAccount: bondRedeemableTokenAccount.toBase58(),
            // TODO: Also store the private key somewhere. Actually, maybe not? IDK lol.
            // this is a serious security flaw though, need a different solution. Maybe PDA needed instead
            bondSolanaAccount: bondSolanaAccount.publicKey.toBase58(),
            redeemableMint: redeemableMint.key.toBase58(),
        };

        console.log("New pool is: ");
        console.log(requestBody);

        // Finally make a post request with this data
        // numIdoTokensWatermelons
        try {
            let save_db_response = await axios({
                method: 'post',
                url: 'http://127.0.0.1:5000/api/bond',
                data: requestBody
            });
            console.log("Response from saving pool in the database is: ", save_db_response);
        } catch (error) {
            console.log("Error making request");
            console.log(JSON.stringify(error));
        }

        console.log("saving into pool...");

    }

    return (
        <>
            <div className="md:grid md:grid-cols-2 md:gap-6">
                <div className="mt-5 md:mt-0 md:col-span-2">

                    <form action="#" method="POST" onSubmit={handleSubmit(submitToContract)}>
                        <div className="shadow overflow-hidden sm:rounded-md">
                            <div className="px-4 py-5 bg-pink-500 bg-gray sm:p-6">

                                <h2 className="text-2xl lg:text-2xl font-bold text-white pb-5 border-b border-white">
                                    Buy Your Bonds
                                </h2>

                                {/*<br />*/}
                                {/*<hr />*/}
                                {/*<br />*/}

                                <div className="grid grid-cols-6 gap-6 pt-5">

                                    <div className="col-span-6 sm:col-span-6">
                                        <label htmlFor="amount" className="block text-xl font-medium text-white">
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            {...register("amount")}
                                            id="amount"
                                            autoComplete="amount"
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm text-gray-700 sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>

                                    {/*<div className="col-span-6 sm:col-span-3">*/}
                                    {/*    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">*/}
                                    {/*        Last name*/}
                                    {/*    </label>*/}
                                    {/*    <input*/}
                                    {/*        type="text"*/}
                                    {/*        name="last-name"*/}
                                    {/*        id="last-name"*/}
                                    {/*        autoComplete="family-name"*/}
                                    {/*        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"*/}
                                    {/*    />*/}
                                    {/*</div>*/}

                                    <div className="col-span-6 sm:col-span-6">
                                        <label htmlFor="timeInSeconds"
                                               className="block text-xl font-medium text-white">
                                            Duration (in Seconds)
                                        </label>
                                        <input
                                            type="number"
                                            {...register("timeInSeconds")}
                                            id="timeInSeconds"
                                            autoComplete="timeInSeconds"
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm text-gray-700 sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>

                                    {/*<div className="col-span-6 sm:col-span-6">*/}
                                    {/*    <label htmlFor="compounding_boolean" className="block text-sm font-medium text-gray-700">*/}
                                    {/*        Monthly Payout*/}
                                    {/*    </label>*/}
                                    {/*    <select*/}
                                    {/*        id="country"*/}
                                    {/*        {...register("country")}*/}
                                    {/*        autoComplete="country-name"*/}
                                    {/*        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"*/}
                                    {/*    >*/}
                                    {/*        <option>*/}
                                    {/*            Pay me Monthly*/}
                                    {/*        </option>*/}
                                    {/*        <option>*/}
                                    {/*            Don't pay me Monthly (Compound Interest)*/}
                                    {/*        </option>*/}
                                    {/*    </select>*/}
                                    {/*</div>*/}

                                    {/*<div className="col-span-6">*/}
                                    {/*    <label htmlFor="street-address" className="block text-sm font-medium text-gray-700">*/}
                                    {/*        Street address*/}
                                    {/*    </label>*/}
                                    {/*    <input*/}
                                    {/*        type="text"*/}
                                    {/*        name="street-address"*/}
                                    {/*        id="street-address"*/}
                                    {/*        autoComplete="street-address"*/}
                                    {/*        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"*/}
                                    {/*    />*/}
                                    {/*</div>*/}

                                    {/*<div className="col-span-6 sm:col-span-6 lg:col-span-2">*/}
                                    {/*    <label htmlFor="city" className="block text-sm font-medium text-gray-700">*/}
                                    {/*        City*/}
                                    {/*    </label>*/}
                                    {/*    <input*/}
                                    {/*        type="text"*/}
                                    {/*        name="city"*/}
                                    {/*        id="city"*/}
                                    {/*        autoComplete="address-level2"*/}
                                    {/*        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"*/}
                                    {/*    />*/}
                                    {/*</div>*/}

                                    {/*<div className="col-span-6 sm:col-span-3 lg:col-span-2">*/}
                                    {/*    <label htmlFor="region" className="block text-sm font-medium text-gray-700">*/}
                                    {/*        State / Province*/}
                                    {/*    </label>*/}
                                    {/*    <input*/}
                                    {/*        type="text"*/}
                                    {/*        name="region"*/}
                                    {/*        id="region"*/}
                                    {/*        autoComplete="address-level1"*/}
                                    {/*        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"*/}
                                    {/*    />*/}
                                    {/*</div>*/}

                                    {/*<div className="col-span-6 sm:col-span-3 lg:col-span-2">*/}
                                    {/*    <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">*/}
                                    {/*        ZIP / Postal code*/}
                                    {/*    </label>*/}
                                    {/*    <input*/}
                                    {/*        type="text"*/}
                                    {/*        name="postal-code"*/}
                                    {/*        id="postal-code"*/}
                                    {/*        autoComplete="postal-code"*/}
                                    {/*        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"*/}
                                    {/*    />*/}
                                    {/*</div>*/}

                                </div>
                            </div>
                            <div className="px-4 py-3 bg-pink-500 text-right sm:px-6">
                                <button
                                    type="submit"
                                    // className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    className={"cta-button shadow-sm bg-purple-600 hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}
                                >
                                    Purchase Bond
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
