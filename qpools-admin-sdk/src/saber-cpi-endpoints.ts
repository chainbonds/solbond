import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import {Program, Provider, web3} from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {QPair} from "@qpools/sdk/src/q-pair";
import {BN} from "@project-serum/anchor";
import {u64} from "@solana/spl-token";
import {assert} from "chai";
import {QPoolsAdmin} from "./qpools-admin";

// @ts-ignore
import {
    BondPoolAccount,
    createAssociatedTokenAccountSendUnsigned,
    getAssociatedTokenAddressOffCurve,
    createMint,
    getPayer,
    getSolbondProgram,    
    createAssociatedTokenAccountUnsigned,
    MOCK,

} from "@qpools/sdk";
import {
    StableSwap,
    StableSwapState,
    findSwapAuthorityKey,
  } from "@saberhq/stableswap-sdk";
import {NETWORK} from "@qpools/sdk/lib/cluster";
import {IWallet} from "@qpools/sdk/lib/utils";
import { min } from "bn.js";
import { mint } from "easy-spl";



function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class SaberInteractTool {

    public connection: Connection;
    public solbondProgram: Program;
    public provider: Provider;
    public wallet: Keypair;
    public providerWallet: IWallet;
    // All tokens owned by the protocol
    public qPoolAccount: PublicKey //| null = null;  // qPool Account
    public bumpQPoolAccount: number //| null = null;

    public QPTokenMint: Token | undefined;  // qPool `redeemable` tokens
    public qPoolQPAccount: PublicKey | undefined;
    public qPoolCurrencyAccount: PublicKey | undefined;
    public stableSwapProgramId: PublicKey | undefined;

    public currencyTokenMint: PublicKey | undefined;

    public QPReserveTokens: Record<string, PublicKey> = {};


    public mintA: Token | undefined;
    public mintB: Token | undefined;
    public poolMint: Token | undefined;

    public userAccountA: PublicKey | undefined;
    public userAccountB: PublicKey | undefined;
    public userAccountPoolToken: PublicKey | undefined;

    public fetchedStableSwapPool: StableSwap | undefined;
    public stableSwapState: StableSwapState | undefined;


    constructor(
        qPoolsAdminTool: QPoolsAdmin,
    ) {
        this.connection = qPoolsAdminTool.connection;
        this.provider = qPoolsAdminTool.provider;
        this.solbondProgram = qPoolsAdminTool.solbondProgram
        

        //// @ts-expect-error
        this.wallet = qPoolsAdminTool.wallet;
        this.providerWallet = this.provider.wallet;

        this.qPoolAccount = qPoolsAdminTool.qPoolAccount;
        console.log("qPOOL SCHN ", this.qPoolAccount)
        this.QPTokenMint = qPoolsAdminTool.QPTokenMint;
        this.bumpQPoolAccount = qPoolsAdminTool.bumpQPoolAccount;
        this.qPoolCurrencyAccount = qPoolsAdminTool.qPoolCurrencyAccount;
        this.currencyTokenMint = MOCK.DEV.SABER_USDC;

        this.stableSwapProgramId = new PublicKey("SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ");

    }

    prettyPrintAccounts() {
        console.log("solbondProgram", this.solbondProgram.programId.toString());
        console.log("wallet", this.wallet.publicKey.toString());

        console.log("🟢 qPoolAccount", this.qPoolAccount!.toString());
        console.log("🟢 bumpQPoolAccount", this.bumpQPoolAccount!.toString());

        console.log("🌊 QPTokenMint", this.QPTokenMint!.publicKey.toString());
        console.log("🌊 qPoolQPAccount", this.qPoolQPAccount!.toString());

        console.log("💵 qPoolCurrencyAccount", this.qPoolCurrencyAccount!.toString());
        console.log("🤯🤯🤯🤯")
    }

    async getPoolState(pool_address: PublicKey) {
        const fetchedStableSwap = await StableSwap.load(
            this.connection,
            pool_address,
            this.stableSwapProgramId
        );

        assert.ok(fetchedStableSwap.config.swapAccount.equals(
            pool_address)
        );
        
        //const {state} = fetchedStableSwap;
        return fetchedStableSwap;
    }

    async getAccountForMint(mintKey: PublicKey) {
        try {
            console.log("this wallet ", this.wallet.publicKey.toString())
            console.log("this provider wallet  ", this.provider.wallet.publicKey.toString())
            console.log("this qpoolacc ", this.qPoolAccount.toString())

            let tx = await createAssociatedTokenAccountUnsigned(
                this.connection,
                mintKey,
                null,
                this.wallet.publicKey,
                this.providerWallet,
            );
            
            const sg = await this.connection.sendTransaction(tx, [this.wallet]);
            await this.connection.confirmTransaction(sg);
            console.log("Signature for token A is: ", sg);
        } catch (e) {
            //console.log("Error is: ");
            //console.log(e);
        }

        const userAccount = await getAssociatedTokenAddressOffCurve(mintKey, this.qPoolAccount);
        return userAccount;
    }

    async prepareSaberPool(pool_address: PublicKey) {
        console.log("type of pool address")
        console.log(typeof pool_address)
        const fetchedStableSwapPool = await this.getPoolState(pool_address);
        console.log("stable swap pool fetcheed ", fetchedStableSwapPool)
        const {state} = fetchedStableSwapPool
        this.mintA = new Token(this.connection, state.tokenA.mint, TOKEN_PROGRAM_ID, this.wallet);
        console.log("mint A", this.mintA.toString());
        this.mintB = new Token(this.connection, state.tokenB.mint, TOKEN_PROGRAM_ID, this.wallet);
        console.log("mint B", this.mintB.toString());

        this.poolMint = new Token(this.connection, state.poolTokenMint, TOKEN_PROGRAM_ID, this.wallet);
        console.log("pool Mint", this.poolMint.toString());

        // qPools is the user in this case!
        this.userAccountA = await this.getAccountForMint(state.tokenA.mint);
        console.log("got account A ",this.userAccountA.toString());
        this.userAccountB = await this.getAccountForMint(state.tokenB.mint);
        console.log("got account B ",this.userAccountB.toString());

        this.userAccountPoolToken = await this.getAccountForMint(state.poolTokenMint);
        console.log("got account LPtok ",this.userAccountPoolToken.toString());


        //let [qPoolPDA, bumpqpoolaccount] = await PublicKey.findProgramAddress(
        //[this.QPTokenMint.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode("bondPoolAccount1"))],
        //    this.solbondProgram.programId
        //);
        //this.bumpQPoolAccount = bumpqpoolaccount; 

        this.fetchedStableSwapPool = fetchedStableSwapPool;
        this.stableSwapState = state;


    }

    async depositToSaber(amount_a: number, amount_b: number, min_mint_amount:number, pool_address: PublicKey) {
        console.log("start deposit to saber")
        const amountTokenA = new BN(new u64(amount_a));
        const amountTokenB = new BN(new u64(amount_b));
        const minMintAmount = new BN(new u64(min_mint_amount));

        //const fetchedStableSwapPool = await this.getPoolState(pool_address);
        //const {state} = fetchedStableSwapPool
        //const mintA = new Token(this.connection, state.tokenA.mint, TOKEN_PROGRAM_ID, this.wallet);
        //const mintB = new Token(this.connection, state.tokenB.mint, TOKEN_PROGRAM_ID, this.wallet);
        //const poolMint = new Token(this.connection, state.poolTokenMint, TOKEN_PROGRAM_ID, this.wallet);

        // qPools is the user in this case!
        //const userAccountA = await this.getAccountForMint(state.tokenA.mint);
        //const userAccountB = await this.getAccountForMint(state.tokenB.mint);
        //const userAccountPoolToken = await this.getAccountForMint(state.poolTokenMint);

        //let [qPoolPDA, bumpqpoolaccount] = await PublicKey.findProgramAddress(
        //    [this.QPTokenMint.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode("bondPoolAccount1"))],
        //    this.solbondProgram.programId
        //);
        console.log("POOL ADD string ", pool_address.toString());
        await this.prepareSaberPool(pool_address)
        console.log("LOGGING ACCOUNTS ")
        console.log("wallet pub key ", this.wallet.publicKey.toString())
        console.log("qptoken mint ", this.QPTokenMint.publicKey.toString())
        console.log("pool mint ", this.poolMint.publicKey.toString())
        console.log("output lp ", this.userAccountPoolToken.toString())
        console.log("swap authority ", this.fetchedStableSwapPool.config.authority.toString())
        console.log("user authority ", this.qPoolAccount.toString())
        console.log("swap ", this.fetchedStableSwapPool.config.swapAccount.toString())
        console.log("user A acc ", this.userAccountA.toString())
        console.log("reserve A  ", this.stableSwapState.tokenA.reserve.toString())
        console.log("user  B acc ", this.userAccountB.toString())
        console.log("reserve B ", this.stableSwapState.tokenB.reserve.toString())
        console.log(" stable swap program id ", this.stableSwapProgramId.toString())
        console.log("amountTokenA ", amountTokenA.toString())
        console.log("amountTokenB ", amountTokenB.toString())
        console.log("minMintAmount ", minMintAmount.toString())
        let finaltx = await this.solbondProgram.rpc.createLiquidityPositionSaber(
            new BN(this.bumpQPoolAccount),
            new BN(amountTokenA),
            new BN(amountTokenB),
            new BN(minMintAmount),
            {
                accounts: {
                    initializer: this.wallet.publicKey,
                    bondPoolCurrencyTokenMint: this.QPTokenMint.publicKey,
                    poolMint: this.poolMint.publicKey,
                    outputLp: this.userAccountPoolToken,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    swapAuthority: this.fetchedStableSwapPool.config.authority,
                    userAuthority: this.wallet.publicKey,
                    swap:this.fetchedStableSwapPool.config.swapAccount,
                    clock:web3.SYSVAR_CLOCK_PUBKEY,
                    userA: this.userAccountA,
                    reserveA: this.stableSwapState.tokenA.reserve,
                    userB: this.userAccountB,
                    reserveB: this.stableSwapState.tokenB.reserve,    
                    saberSwapProgram: this.stableSwapProgramId,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers:[this.wallet]
            }
        )

        await this.connection.confirmTransaction(finaltx);
        console.log("Successfully did a SaberDeposit with signature: ", finaltx);

        // write some asserts to check balance and return true if the instruction was successfull

    }

    async swapOnSaber(amount_in: number, min_amount_out: number, pool_address: PublicKey, B_out: boolean = true) {
        const amountIn = new BN(new u64(amount_in));
        const minAmountOut = new BN(new u64(0));


        
        await this.prepareSaberPool(pool_address)
        console.log("PREPARED FOR A SWAP")
        // B_out true mans that output is TokenB in pool, direction 1 TokenA
        let reserveOutput: PublicKey;
        let reserveInput: PublicKey;
        let userOutput: PublicKey;
        let userInput: PublicKey;
        let feesOutput: PublicKey;


        if (B_out) {
            userOutput = this.userAccountB
            reserveOutput = this.stableSwapState.tokenB.reserve
            userInput = this.userAccountA
            feesOutput = this.stableSwapState.tokenB.adminFeeAccount;
            reserveInput = this.stableSwapState.tokenA.reserve
        } else {
            userOutput = this.userAccountA
            reserveOutput = this.stableSwapState.tokenA.reserve
            userInput = this.userAccountB
            reserveInput = this.stableSwapState.tokenB.reserve
            feesOutput = this.stableSwapState.tokenA.adminFeeAccount;

        }

        console.log("LOGGING SWAP TINGS")
        console.log("userOutput: " ,userOutput.toString())
        console.log("reserveOutput: " ,reserveOutput.toString())
        console.log("userInput: " ,userInput.toString())
        console.log("reserveInput: " ,reserveInput.toString())
        console.log("feesOutput: " ,feesOutput.toString())
        
        
        // output is wrong here
        let finaltx = await this.solbondProgram.rpc.swapWithSaber(
            new BN(this.bumpQPoolAccount),
            new BN(amountIn),
            new BN(minAmountOut),
            {
                accounts: {
                    tokenProgram: TOKEN_PROGRAM_ID,
                    swapAuthority: this.fetchedStableSwapPool.config.authority,
                    userAuthority: this.qPoolAccount,
                    swap: this.fetchedStableSwapPool.config.swapAccount,
                    userInput:userInput,
                    reserveInput:reserveInput,
                    userOutput:userOutput,
                    reserveOutput:reserveOutput,
                    feesOutput:feesOutput,
                    initializer: this.wallet.publicKey,
                    bondPoolCurrencyTokenMint: this.currencyTokenMint,
                    saberSwapProgram: this.stableSwapProgramId,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [this.wallet]
            }
        )
        await this.connection.confirmTransaction(finaltx);
        console.log("Successfully did a SaberSwap with signatur: ", finaltx);


    }

}