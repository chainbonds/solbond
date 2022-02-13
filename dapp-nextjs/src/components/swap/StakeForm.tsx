/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import {Connection, Keypair, PublicKey, Signer, Transaction, TransactionInstruction} from "@solana/web3.js";
import {AiOutlineArrowDown} from "react-icons/ai";
import InputFieldWithLogo from "../InputFieldWithLogo";
import CallToActionButton from "../CallToActionButton";
import {BN, web3} from "@project-serum/anchor";
import React, {Fragment, useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {Mint, WalletI} from "easy-spl";
import {Token, TOKEN_PROGRAM_ID, u64} from "@solana/spl-token";
// import airdropAdmin from "@qpools/sdk/src/airdropAdmin";
// import {createAssociatedTokenAccountSendUnsigned, delay} from "@qpools/sdk/src/utils";
// import {MATH_DENOMINATOR, MOCK} from "@qpools/sdk/src/const";
import {useLoad} from "../../contexts/LoadingContext";
// import {SEED} from "@qpools/sdk/lib/seeds";
import {sendAndConfirm} from "easy-spl/dist/util";
import ConfirmPortfolioBuyModal from "../ConfirmPortfolioBuyModal";
import {Modal} from "react-bootstrap";
import { Transition } from "@headlessui/react";
import {airdropAdmin, createAssociatedTokenAccountSendUnsigned, MOCK} from "@qpools/sdk";
import {SEED} from "@qpools/sdk/lib/seeds";
import {PositionsInput} from "@qpools/sdk/lib/register-portfolio";
import {tou64} from "@qpools/sdk/lib/utils";

export default function StakeForm() {

    const {register, handleSubmit} = useForm();
    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();
    const loadContext = useLoad();

    const [valueInUsd, setValueInUsd] = useState<number>(0.0);
    const [valueInQPT, setValueInQpt] = useState<number>(0.0);

    const [balanceUsd, setBalanceUsd] = useState<number>(0.0);
    const [balanceQpt, setBalanceQpt] = useState<number>(0.0);

    const [displayBuyModal, setBuyModal] = useState<boolean>(false);
    const [buyModalInfo, setBuyModalInfo] = useState<any>({});

    useEffect(() => {
        qPoolContext.qPoolsStats?.calculateTVL().then((out: any) => {

            if (out.tvl.gt(new BN(0))) {
                // Calculate the conversion rate ...
                // Add .div(new BN(10 ** out.tvlDecimals))
                // Add a
                let newValueBasedOnConversionRateQptPerUsd = new BN(out.totalQPT).mul(new BN(10 ** out.tvlDecimals)).mul(new BN(valueInUsd)).div(out.tvl);
                setValueInQpt((_: number) => {
                    return newValueBasedOnConversionRateQptPerUsd.toNumber();
                });
            } else {
                setValueInQpt(valueInUsd);
            }

        });
    }, [valueInUsd]);

    const submitToContract = async (d: any) => {

        console.log(JSON.stringify(d));

        // The pool addresses will be all hardcoded somewhere
        // For the three pools we have, calculate these assignments.
        // Also, devnet will be everything hardcoded:
        // MOCK.DEV.stableSwapProgramId

        // Pass it on to the confirm modal
        // positionInput: Array<PositionsInput>, ownerKeypair: Keypair

        if (!qPoolContext.userAccount!.publicKey) {
            alert("Please connect your wallet first!");
            return
        }

        // Initialize if not initialized yet
        await qPoolContext.initializeQPoolsUserTool(walletContext);

        // TODO: Uncomment
        // await loadContext.increaseCounter();

        let poolAddresses = [
            MOCK.DEV.SABER_POOL.USDC_USDT,
            MOCK.DEV.SABER_POOL.USDC_CASH,
            MOCK.DEV.SABER_POOL.USDC_TEST
        ]
        // let positionInputList: Array<PositionsInput> = pools.map((poolPubkey: PublicKey) => {
        //     return {
        //         // Weight should be calculated from amount, or amount should be calculated from weight, not like this!
        //         percentageWeight: new BN(0),
        //         poolAddress: poolPubkey,
        //         amount: new BN(500)
        //     }
        // })
        // Calculate the weights and amounts from the JSON!

        const sendAmount: BN = new BN(valueInUsd).mul(new BN(10**MOCK.DEV.SABER_USDC_DECIMALS));

        // TODO: First, send the USDC send the stuff to the portfolio object
        // I might have to write some endpoints for this (otherwise, we probably cannot redeem the USDC back!

        /*
            Will implement stuff manually until it works
        */
        // Create transaction array
        let transaction = new Transaction();
        let tx: TransactionInstruction;

        qPoolContext.portfolioObject!.poolAddresses = poolAddresses;

        let [_portfolioPDA, _bumpPortfolio] = await PublicKey.findProgramAddress(
            [qPoolContext.userAccount!.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode("PortFolioSeed8"))],
            qPoolContext._solbondProgram.programId
        );
        let portfolio_owner = qPoolContext.userAccount;
        let portfolioPDA = _portfolioPDA;
        let portfolioBump = _bumpPortfolio;

        // Should probably accept the provider instead / provider keypair
        /*
            Transaction 1: Create the portfolio
        */
        let weights: Array<BN> = [new BN(500), new BN(500), new BN(500)];
        console.log("Types");
        console.log(typeof portfolioBump);
        console.log(typeof weights);
        console.log("Registering portfolio!!")
        let txi = await qPoolContext._solbondProgram.rpc.savePortfolio(
            portfolioBump,
            weights,
            {
                accounts: {
                    owner: qPoolContext.userAccount!.publicKey,
                    portfolioPda: portfolioPDA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
            }
        );
        console.log("Confirming transaction!");
        console.log("Signature: ", txi);
        await qPoolContext.connection!.confirmTransaction(txi);

        // signers: [walletContext]
        // transaction.add(tx);
        // console.log("Signing");
        // const blockhash = await qPoolContext.connection!.getRecentBlockhash();
        // console.log("Added blockhash");
        // transaction.recentBlockhash = blockhash.blockhash;
        // transaction.feePayer = wallet.publicKey;
        // await wallet.signTransaction(transaction);
        // console.log("Sending");
        // // @ts-expect-error
        // let signer = qPoolContext.provider!.wallet as Signer;
        // console.log("Signer is: ", signer);
        // let sg = await qPoolContext.connection!.sendRawTransaction(transaction);
        // console.log("Confirming");

        /**
         * Next step of instructions
         */
        // Normalize amounts to match the weights
        const Z = weights[0].add(weights[1]).add(weights[2]);
        const amounts: Array<BN> = [
            sendAmount.mul(weights[0]).div(Z),
            sendAmount.mul(weights[1]).div(Z),
            sendAmount.mul(weights[2]).div(Z)
        ];

        // Hacky, but should work ...
        console.log("Registering portfolio");
        // let sig_reg = await qPoolContext.portfolioObject!.registerPortfolio(weights, poolAddresses, );

        for (var i = 0; i < weights.length; i++) {
            let w = weights[i];
            let amountTokenA = amounts[i];
            // let tx = await this.create_single_position(i, w, amountTokenA, owner)
            // transactions_sigs = transactions_sigs.concat(tx)

            console.log("Going through pools ...");

            const pool_address = qPoolContext.portfolioObject!.poolAddresses[i];
            const stableSwapState = await qPoolContext.portfolioObject!.getPoolState(pool_address);
            const {state} = stableSwapState;
            let poolTokenMint = state.poolTokenMint;

            // this.poolMint = new Token(this.connection, state.poolTokenMint, TOKEN_PROGRAM_ID, this.wallet);

            console.log("PoolPDAs...");
            let [poolPDA, poolBump] = await PublicKey.findProgramAddress(
                [state.poolTokenMint.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode("twoWayPool6"))],
                qPoolContext._solbondProgram.programId
            );

            console.log("Make the RPC calls...");
            let txi = await qPoolContext._solbondProgram.rpc.initializePoolAccount(
                new BN(poolBump),
                {
                    accounts: {
                        initializer: qPoolContext.userAccount!.publicKey,
                        poolPda: poolPDA,
                        mintLp: poolTokenMint,
                        mintA: state.tokenA.mint,
                        mintB: state.tokenB.mint,
                        poolTokenAccountA: state.tokenA.reserve,
                        poolTokenAccountB: state.tokenB.reserve,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: web3.SystemProgram.programId,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                    },
                    // signers: [qPoolContext.portfolioObject]
                }
            );
            console.log("Confirming transaction!");
            console.log("Signature: ", txi);
            await qPoolContext.connection!.confirmTransaction(txi);


            let [positonPDA, bumpPositon] = await await PublicKey.findProgramAddress(
                [qPoolContext.userAccount!.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode("PositionAccount" + i.toString()))],
                qPoolContext._solbondProgram.programId
            );

            console.log("positionPDA ", positonPDA.toString())

            const [authority] = await findSwapAuthorityKey(state.adminAccount, MOCK.DEV.stableSwapProgramId);

            let userAccountA = await qPoolContext.portfolioObject!.getAccountForMintAndPDA(state.tokenA.mint, qPoolContext.portfolioObject!.portfolioPDA);
            let userAccountB = await qPoolContext.portfolioObject!.getAccountForMintAndPDA(state.tokenB.mint, qPoolContext.portfolioObject!.portfolioPDA);
            let userAccountPoolToken = await qPoolContext.portfolioObject!.getAccountForMintAndPDA(state.poolTokenMint, qPoolContext.portfolioObject!.portfolioPDA);

            let amount_a = new u64(0)
            let amount_b = new u64(0)
            if (state.tokenA.mint.toString() === MOCK.DEV.SABER_USDC.toString()) {
                amount_a = amountTokenA
                console.log("A IS THE WAY")
            } else {
                amount_b = amountTokenA
                console.log("B IS THE WAY")
            }

            // tx = this.solbondProgram.instruction.createPositionSaber(
            //     new BN(poolBump),
            //     new BN(bumpPositon),
            //     new BN(.portfolioBump),
            //     new BN(i),
            //     new BN(weight),
            //     new BN(amount_a),
            //     new BN(amount_b),
            //     new BN(0),
            //     {
            //         accounts: {
            //             positionPda: positonPDA,
            //             portfolioPda: this.portfolioPDA,
            //             owner: owner.publicKey,//randomOwner.publicKey,
            //             poolMint: state.poolTokenMint,
            //             outputLp: userAccountPoolToken,
            //             swapAuthority: stableSwapState.config.authority,
            //             poolPda: poolPDA,
            //             swap: stableSwapState.config.swapAccount,
            //             qpoolsA: userAccountA,
            //             poolTokenAccountA: state.tokenA.reserve,
            //             poolTokenAccountB: state.tokenB.reserve,
            //             qpoolsB: userAccountB,
            //             tokenProgram: TOKEN_PROGRAM_ID,
            //             saberSwapProgram: this.stableSwapProgramId,
            //             systemProgram: web3.SystemProgram.programId,
            //             // Create liquidity accounts
            //         },
            //         signers: [owner]
            //     }
            // )
            // transactions.add(tx);
            //

        }

        console.log("Creating full portfolio");
        // let sigs_rest = await qPoolContext.portfolioObject!.create_full_portfolio(weights, amounts, payer);
        // console.log("🦧 REGISTER PORTFOLIO SIG ", sig_reg.toString())
        // for (let smt of sigs_rest) {
        //     console.log("🦍 TRANSACTION SIG ", smt.toString())
        // }

        // I think I will have to do multiple "ok", because of solana stack and instruction depth

        // // TODO: All decimals should be registered somewhere!
        // const sendAmount: BN = new BN(valueInUsd).mul(new BN(10**MOCK.DEV.SABER_USDC_DECIMALS));
        // console.log("send amount is: ", sendAmount.toString());

    }

    useEffect(() => {
        if (walletContext.publicKey) {
            console.log("Walle1t pubkey wallet is:", walletContext.publicKey.toString());
            qPoolContext.initializeQPoolsUserTool(walletContext);
        }
        // initializeQPoolsUserTool
    }, [walletContext.publicKey]);

    return (
        <>
            <ConfirmPortfolioBuyModal
                isOpen={displayBuyModal}
                onClose={() => {}}
            />
            <div className="">
                <div className="">
                    <form action="#" method="POST" onSubmit={handleSubmit(submitToContract)}>
                        <div className="py-5 bg-slate-800 bg-gray">
                            <div>
                                <div className={"flex flex-row w-full justify-center"}>
                                    {/*<div className={"flex flew-row w-full px-8 text-gray-400 justify-center"}>*/}
                                    {/*    Balance: */}
                                    {/*</div>*/}
                                    {/*<div className={"flex flew-row w-full px-8 text-gray-400 justify-center"}>*/}
                                    {/*    Balance:*/}
                                    {/*</div>*/}
                                </div>
                                <InputFieldWithLogo
                                    logoPath={"/solana-logo.png"}
                                    displayText={"SOL"}
                                    registerFunction={() => register("solana_amount")}
                                    modifiable={true}
                                    setNewValue={setValueInUsd}
                                />
                            </div>
                        </div>
                        {qPoolContext.userAccount &&
                            <CallToActionButton
                                type={"submit"}
                                text={"EARN"}
                            />
                        }
                        {!qPoolContext.userAccount &&
                            <div className={"flex w-full justify-center"}>
                                <WalletMultiButton
                                    className={"btn btn-ghost"}
                                    onClick={() => {
                                        console.log("click");
                                    }}
                                />
                            </div>
                        }
                    </form>
                </div>
            </div>
        </>
    );
}
