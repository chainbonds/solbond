/**
 * Test to test all functionality of the invariant program that we have here
 *
 * This includes the following functionality in this order
 * - create pool
 * - provide liquidity
 * - make a trade as a third party
 * - claim fees
 * - close position
 *
 * Some functionality will deviate between devnet and localnet, thus we have created two different tests
 */
 import {TOKEN_PROGRAM_ID, u64} from "@solana/spl-token";
 import * as anchor from "@project-serum/anchor";
 import {Solbond} from '../target/types/solbond';

 import {BN, Provider} from "@project-serum/anchor";
 import {Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
 import {airdropAdmin, getSolbondProgram, MOCK} from "@qpools/sdk";
 import {QPair, QPoolsAdmin} from "@qpools/admin-sdk/lib/qpools-admin-sdk/src";
 import {NETWORK} from "@qpools/sdk/lib/cluster";
 import {Token} from "@solana/spl-token";
 import {assert} from "chai";
 import {delay} from "@qpools/sdk/lib/utils";
 import {
    BondPoolAccount,
    createAssociatedTokenAccountSendUnsigned,
    createMint,
    getPayer,
} from "@qpools/sdk";
import {Program, utils, Wallet, web3} from "@project-serum/anchor";
import {LAMPORTS_PER_SOL} from "@solana/web3.js"
import type {  TransactionInstruction } from "@solana/web3.js";
import {Connection} from "@solana/web3.js";
import type { IExchange } from "@saberhq/stableswap-sdk";
import {
  calculateVirtualPrice,
  deployNewSwap,
  loadExchangeInfo,
  parseEventLogs,
  StableSwap,
  findSwapAuthorityKey,
  SWAP_PROGRAM_ID,
} from "@saberhq/stableswap-sdk";
import {
    createAssociatedTokenAccountUnsigned,
    getAssociatedTokenAddressOffCurve,

} from "@qpools/sdk";
import {IDL} from "../target/types/solbond";

//import {
//  SPLToken,
//  Token as SToken,
//} from "@saberhq/token-utils";



 describe('saber-devnet', () => {
    
     // Get connection and provider
    const provider = Provider.local("https://api.devnet.solana.com");
    const connection = provider.connection;
    console.log("here")

    console.log('provider ', provider);
    // @ts-expect-error
    const genericPayer = provider.wallet.payer as Keypair;
    //const genericWallet = provider.wallet;
    const mintAuthority = genericPayer;
    //// Generate the users

    //const currencyOwner = airdropAdmin;
    // const solbondProgram = anchor.workspace.Solbond as Program<Solbond>;
    //const solbondProgram = anchor.workspace.solbondProgram.program
    //console.log("solbondPorgram ID ", solbondProgram.toString());
    //
    let programAddress = "3vTbhuwJwR5BadSH9wt29rLf91S57x31ynQZJpG9cf7E";

    const programId = new anchor.web3.PublicKey(programAddress);
    const solbondProgram: any = new anchor.Program(
        IDL,
        programId,
        provider,
    );

    //const solbondProgram = getSolbondProgram(connection, provider, NETWORK.DEVNET);

    //    
    //let tokenPool: SPLToken;
    //let userPoolAccount: PublicKey;
    //// Tokens swapped
    let mintA: Token;
    let mintB: Token;
    let tokenAccountA: PublicKey;
    let tokenAccountB: PublicKey;
    //// Admin fee accounts
    let adminFeeAccountA: PublicKey;
    let adminFeeAccountB: PublicKey;
    //// Stable swap
    let exchange: IExchange;
    let swapAccount;
    let swapAuthority;
    let stableSwap: StableSwap;
    let fetchedStableSwap: StableSwap;
    let stableSwapAccount : Keypair;
    //stableSwapAccount=   Keypair.generate();
    let stableSwapProgramId: PublicKey;
    let stableSwapState;
    //stableSwapProgramId = SWAP_PROGRAM_ID;
    //console.log("Solbond Program");
    //console.log(solbondProgram.programId.toString());
    //console.log("Invariant Program");
    const AMP_FACTOR = 100;
    let QPTokenMint: Token;
    let qPoolCurrencyAccount;

    let USDC_USDT_pubkey: PublicKey;
    //let market: QPoolsAdmin;
    //let currencyMint: Token;
    // 

    before(async () => {
        console.log("swapprogramid")
        stableSwapProgramId = new PublicKey(
            "SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ"
        );
        stableSwapAccount = Keypair.generate()
        USDC_USDT_pubkey = new PublicKey("VeNkoB1HvSP6bSeGybQDnx9wTWFsQb2NBCemeCDSuKL");

        console.log("create QPT")
        QPTokenMint = await createMint(
            provider,
            genericPayer,
            mintAuthority.publicKey,
            9
        );
        //const qpt = new Token(connection, new PublicKey(MOCK.DEV.USDC), TOKEN_PROGRAM_ID, genericPayer)
    

        console.log('creating accounts')
        qPoolCurrencyAccount = await QPTokenMint.createAccount(mintAuthority.publicKey)
        console.log('qpoolcurrency acc ', qPoolCurrencyAccount.toString())
        
        

    })
    it("loadStableSwap", async () => {
        fetchedStableSwap = await StableSwap.load(
         connection,
         USDC_USDT_pubkey,
         stableSwapProgramId
       );
       console.log("loaded")
       assert.ok(fetchedStableSwap.config.swapAccount.equals(
         USDC_USDT_pubkey)
       );
       swapAccount = fetchedStableSwap.config.swapAccount
       swapAuthority = fetchedStableSwap.config.authority
       const { state } = fetchedStableSwap;
       console.log(state);
       stableSwapState = state
       
       mintA = new Token(connection,state.tokenA.mint, TOKEN_PROGRAM_ID, genericPayer);
       mintB = new Token(connection,state.tokenB.mint, TOKEN_PROGRAM_ID, genericPayer);

       

       console.log("mint A ", mintA);

       // assert.ok(state.tokenA.adminFeeAccount.equals(adminFeeAccountA));
       // assert.ok(state.tokenB.adminFeeAccount.equals(adminFeeAccountB));
       // assert.ok(state.tokenA.reserve.equals(tokenAccountA));
       // assert.ok(state.tokenB.reserve.equals(tokenAccountB));
       // assert.ok(state.tokenA.mint.equals(mintA.publicKey));
       // assert.ok(state.tokenB.mint.equals(mintB.publicKey));
       // assert.ok(state.poolTokenMint.equals(tokenPool.publicKey));
       // assert.ok(state.initialAmpFactor.toNumber() == AMP_FACTOR);
       // assert.ok(state.targetAmpFactor.toNumber() == AMP_FACTOR);
       
    });

    

    it("depositToSaberWithCPI", async() => {

        let amountTokenA = new u64(2039100);
        let amountTokenB = new u64(2039100);

        let minMintAmount = new u64(0);


        let tokenAMint = stableSwapState.tokenA.mint
        let tokenBMint = stableSwapState.tokenB.mint

        let poolTokenMint = stableSwapState.poolTokenMint
        let poolMint = new Token(connection,poolTokenMint, TOKEN_PROGRAM_ID, genericPayer);



        console.log(tokenAMint.toString())
        console.log(tokenBMint.toString())
        console.log(poolTokenMint.toString())

        //stableSwap.deposit({
        //    userAuthority: owner.publicKey,
        //    sourceA: userAccountA,
        //    sourceB: userAccountB,
        //    poolTokenAccount: userPoolAccount,
        //    tokenAmountA: new u64(depositAmountA),
        //    tokenAmountB: new u64(depositAmountB),
        //    minimumPoolTokenAmount: new u64(0), // To avoid slippage errors
        //  })
        //);

        let [qPoolPDA, bumpqpoolaccount] = await PublicKey.findProgramAddress(
            [QPTokenMint.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode("bondPoolAccount1"))],
            solbondProgram.programId
        );
        let qPoolAccount: PublicKey = new PublicKey("DiPga2spUbnyY8vJVZUYaeXcosEAuXnzx9EzuKuUaSxs");

        
        //let swapAuthority = stableSwapState.config.authority
        //console.log(swapAuthority.toString())
    
        const [authority] = await findSwapAuthorityKey(stableSwapState.adminAccount, stableSwapProgramId);
        console.log("authority ", authority.toString())

        try {
            let tx = await createAssociatedTokenAccountUnsigned(
                connection,
                stableSwapState.tokenA.mint,
                null,
                qPoolAccount,
                provider.wallet
            );
            const sg = await connection.sendTransaction(tx, [genericPayer]);
            await connection.confirmTransaction(sg);
            console.log("Signature for token A is: ", sg);
        } catch (e) {
            console.log("Error is: ");
            console.log(e);
        }

        let userAccountA = await getAssociatedTokenAddressOffCurve(stableSwapState.tokenA.mint, qPoolAccount);
        console.log("qpollcurrarr", qPoolCurrencyAccount.toString())
        //let userAccountA = await mintA.createAccount(qPoolCurrencyAccount)
        console.log("mint A")

        //await mintA.mintTo(userAccountA, genericPayer, [], amountTokenA);
        // Creating depositor token b account

        try {
            let tx = await createAssociatedTokenAccountUnsigned(
                connection,
                stableSwapState.tokenB.mint,
                null,
                qPoolAccount,
                provider.wallet
            );
            const sg = await connection.sendTransaction(tx, [genericPayer]);
            await connection.confirmTransaction(sg);
            console.log("Signature for token B is: ", sg);
        } catch (e) {
            console.log("Error is: ");
            console.log(e);
        }
        //let userAccountB = await mintB.createAccount(qPoolCurrencyAccount)

        let userAccountB = await getAssociatedTokenAddressOffCurve(stableSwapState.tokenB.mint, qPoolAccount);
        console.log("user acc B info ", await connection.getAccountInfo(userAccountB))
        // try{
        //     await mintA.mintTo(userAccountA, genericPayer, [], amountTokenA);
        // } catch (e) {
        //     console.log("Error in mint A ", e)
        // }
        // try {
        //     await mintB.mintTo(userAccountB, genericPayer, [], amountTokenB);
        // } catch (e) {
        //     console.log("Error in mint B ", e)
        // }
        
        console.log("mint B")

        //let userAccountpoolToken  = await poolMint.createAccount(qPoolCurrencyAccount)
        try {
            let tx = await createAssociatedTokenAccountUnsigned(
                connection,
                poolMint.publicKey,
                null,
                qPoolAccount,
                provider.wallet
            );
            const sg = await connection.sendTransaction(tx, [genericPayer]);
            await connection.confirmTransaction(sg);
            console.log("Signature for pool token is: ", sg);
        } catch (e) {
            console.log("Error is: ");
            console.log(e);
        }

        let userAccountpoolToken = await getAssociatedTokenAddressOffCurve(poolTokenMint, qPoolAccount);
        let userAuthority = Keypair.generate()
        console.log("swap authority", authority.toString());
        console.log("pool token Mint", poolTokenMint.toString())
        console.log("output lp", userAccountpoolToken.toString())
        console.log("userAuthority, ", qPoolAccount.toString())
        console.log("swap account", swapAccount.toString())
        console.log("user A", userAccountA.toString())
        console.log("reserve A", stableSwapState.tokenA.reserve.toString())


        console.log("user B", userAccountB.toString())
        console.log("reserve B", stableSwapState.tokenB.reserve.toString())

        
        let finaltx = await solbondProgram.rpc.createLiquidityPositionSaber(
            new BN(bumpqpoolaccount),
            new BN(amountTokenA),
            new BN(amountTokenB),
            new BN(minMintAmount),
            {
                accounts: {
                    initializer: genericPayer.publicKey,
                    bondPoolCurrencyTokenMint: QPTokenMint.publicKey,
                    poolMint: poolTokenMint,
                    outputLp: userAccountpoolToken,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    swapAuthority: swapAuthority,
                    userAuthority: qPoolAccount,
                    swap:swapAccount,
                    clock:web3.SYSVAR_CLOCK_PUBKEY,
                    userA: userAccountA,
                    reserveA: stableSwapState.tokenA.reserve,
                    userB: userAccountB,
                    reserveB: stableSwapState.tokenB.reserve,    
                    saberSwapProgram: stableSwapProgramId,
                    systemProgram: web3.SystemProgram.programId,
                    // Create liquidity accounts
                },
                signers:[genericPayer]
            }
        )

        await provider.connection.confirmTransaction(finaltx);
        console.log("did  it  Transaction id is: ", finaltx);

    });

    it("withdrawFromSaberWithCPI", async () => {

        let amountTokenA = new u64(1039100);
        let amountTokenB = new u64(1039100);

        let minMintAmount = new u64(0);


        let tokenAMint = stableSwapState.tokenA.mint
        let tokenBMint = stableSwapState.tokenB.mint

        let poolTokenMint = stableSwapState.poolTokenMint
        let poolMint = new Token(connection,poolTokenMint, TOKEN_PROGRAM_ID, genericPayer);



        console.log(tokenAMint.toString())
        console.log(tokenBMint.toString())
        console.log(poolTokenMint.toString())

        //stableSwap.deposit({
        //    userAuthority: owner.publicKey,
        //    sourceA: userAccountA,
        //    sourceB: userAccountB,
        //    poolTokenAccount: userPoolAccount,
        //    tokenAmountA: new u64(depositAmountA),
        //    tokenAmountB: new u64(depositAmountB),
        //    minimumPoolTokenAmount: new u64(0), // To avoid slippage errors
        //  })
        //);

        let [qPoolPDA, bumpqpoolaccount] = await PublicKey.findProgramAddress(
            [QPTokenMint.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode("bondPoolAccount1"))],
            solbondProgram.programId
        );
        let qPoolAccount: PublicKey = new PublicKey("DiPga2spUbnyY8vJVZUYaeXcosEAuXnzx9EzuKuUaSxs");

        
        //let swapAuthority = stableSwapState.config.authority
        //console.log(swapAuthority.toString())
    
        const [authority] = await findSwapAuthorityKey(stableSwapState.adminAccount, stableSwapProgramId);
        console.log("authority ", authority.toString())

        try {
            let tx = await createAssociatedTokenAccountUnsigned(
                connection,
                stableSwapState.tokenA.mint,
                null,
                qPoolAccount,
                provider.wallet
            );
            const sg = await connection.sendTransaction(tx, [genericPayer]);
            await connection.confirmTransaction(sg);
            console.log("Signature for token A is: ", sg);
        } catch (e) {
            console.log("Error is: ");
            console.log(e);
        }

        let userAccountA = await getAssociatedTokenAddressOffCurve(stableSwapState.tokenA.mint, qPoolAccount);
        console.log("qpollcurrarr", qPoolCurrencyAccount.toString())
        //let userAccountA = await mintA.createAccount(qPoolCurrencyAccount)
        console.log("mint A")

        //await mintA.mintTo(userAccountA, genericPayer, [], amountTokenA);
        // Creating depositor token b account

        try {
            let tx = await createAssociatedTokenAccountUnsigned(
                connection,
                stableSwapState.tokenB.mint,
                null,
                qPoolAccount,
                provider.wallet
            );
            const sg = await connection.sendTransaction(tx, [genericPayer]);
            await connection.confirmTransaction(sg);
            console.log("Signature for token B is: ", sg);
        } catch (e) {
            console.log("Error is: ");
            console.log(e);
        }
        //let userAccountB = await mintB.createAccount(qPoolCurrencyAccount)

        let userAccountB = await getAssociatedTokenAddressOffCurve(stableSwapState.tokenB.mint, qPoolAccount);
        console.log("user acc B info ", await connection.getAccountInfo(userAccountB))
        // try{
        //     await mintA.mintTo(userAccountA, genericPayer, [], amountTokenA);
        // } catch (e) {
        //     console.log("Error in mint A ", e)
        // }
        // try {
        //     await mintB.mintTo(userAccountB, genericPayer, [], amountTokenB);
        // } catch (e) {
        //     console.log("Error in mint B ", e)
        // }
        
        console.log("mint B")

        //let userAccountpoolToken  = await poolMint.createAccount(qPoolCurrencyAccount)
        try {
            let tx = await createAssociatedTokenAccountUnsigned(
                connection,
                poolMint.publicKey,
                null,
                qPoolAccount,
                provider.wallet
            );
            const sg = await connection.sendTransaction(tx, [genericPayer]);
            await connection.confirmTransaction(sg);
            console.log("Signature for pool token is: ", sg);
        } catch (e) {
            console.log("Error is: ");
            console.log(e);
        }

        let userAccountpoolToken = await getAssociatedTokenAddressOffCurve(poolTokenMint, qPoolAccount);
        let userAuthority = Keypair.generate()
        console.log("swap authority", authority.toString());
        console.log("pool token Mint", poolTokenMint.toString())
        console.log("output lp", userAccountpoolToken.toString())
        console.log("userAuthority, ", qPoolAccount.toString())
        console.log("swap account", swapAccount.toString())
        console.log("user A", userAccountA.toString())
        console.log("reserve A", stableSwapState.tokenA.reserve.toString())


        console.log("user B", userAccountB.toString())
        console.log("reserve B", stableSwapState.tokenB.reserve.toString())
        let finaltx = await solbondProgram.rpc.withdrawLiquidityPositionSaber(
            new BN(bumpqpoolaccount),
            new BN(minMintAmount),
            new BN(amountTokenA),
            new BN(amountTokenB),
            { 
                accounts: { 
                    tokenProgram: TOKEN_PROGRAM_ID,
                    swapAuthority:swapAuthority,
                    userAuthority:qPoolAccount,
                    swap:swapAccount,
                    inputLp:userAccountpoolToken,
                    poolMint:poolMint.publicKey,
                    userA:userAccountA,
                    reserveA:stableSwapState.tokenA.reserve,
                    feesA:stableSwapState.tokenA.adminFeeAccount,
                    userB:userAccountB,
                    reserveB:stableSwapState.tokenB.reserve,
                    feesB:stableSwapState.tokenB.adminFeeAccount,
                    initializer:genericPayer.publicKey,
                    bondPoolCurrencyTokenMint:QPTokenMint.publicKey,
                    saberSwapProgram:stableSwapProgramId,
                    systemProgram: web3.SystemProgram.programId,

                },
                signers: [genericPayer]
            }
        )

        await provider.connection.confirmTransaction(finaltx);
        console.log("did  it  Transaction id is: ", finaltx);
    });



 
 
 })