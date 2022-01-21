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

 import {BN, Provider} from "@project-serum/anchor";
 import {Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
 import {airdropAdmin, getSolbondProgram, MOCK} from "@qpools/sdk";
 import {getInvariantProgram, QPair, QPoolsAdmin} from "@qpools/admin-sdk/lib/qpools-admin-sdk/src";
 import {NETWORK} from "@qpools/sdk/lib/cluster";
 import {Token} from "@solana/spl-token";
 import {assert} from "chai";

 import {CreateFeeTier, CreatePool, Decimal, FeeTier, PoolStructure, State} from "@invariant-labs/sdk/lib/market";

 import {fromFee} from "@invariant-labs/sdk/lib/utils";
 import {delay} from "@qpools/sdk/lib/utils";
 import { IWallet } from "@invariant-labs/sdk";
 import {FEE_TIER, getMarketAddress, Market, Network, Pair} from "@invariant-labs/sdk";
 import { tou64 } from '@invariant-labs/sdk/lib/utils'
 import {
    BondPoolAccount,
    createAssociatedTokenAccountSendUnsigned,
    createMint,
    getPayer,
} from "@qpools/sdk";
import {Program, utils, Wallet, web3} from "@project-serum/anchor";

 describe('invariant-devnet', () => {
 
     // Get connection and provider
     const provider = Provider.local("https://api.devnet.solana.com");
     const connection = provider.connection;
 
     // @ts-expect-error
     const genericPayer = provider.wallet.payer as Keypair;
     const genericWallet = provider.wallet;
     const mintAuthority = genericPayer;
 
     // Generate the users
     const trader = Keypair.fromSecretKey(
         Uint8Array.from([
             174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117,
             173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240,
             121, 121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
         ])
     );
     const liquidityProvider = Keypair.fromSecretKey(
         Uint8Array.from([
             142, 174, 4, 30, 129, 117, 122, 31, 65, 41, 23, 143, 217, 24, 76, 91, 223, 235, 147, 214, 252, 84, 129, 117,
             137, 22, 221, 247, 75, 98, 237, 134, 123, 245, 172, 72, 24, 213, 209, 2, 129, 212, 96, 132, 156, 125, 171, 198,
             177, 63, 175, 223, 101, 214, 5, 139, 2, 80, 74, 115, 41, 224, 31, 59
         ])
     );
     const currencyOwner = airdropAdmin;
 
     const solbondProgram = getSolbondProgram(connection, provider, NETWORK.DEVNET);
     const invariantProgram = getInvariantProgram(connection, provider, NETWORK.DEVNET);
     console.log("Solbond Program");
     console.log(solbondProgram.programId.toString());
     console.log("Invariant Program");
     console.log(invariantProgram.programId.toString());
 
     let market: QPoolsAdmin;
     let invariantMarket: Market;
     let currencyMint: Token;
     let invariantWallet: IWallet;
      
     /** Get a bunch of airdrops to pay for transactions */
     before(async () => {
         // Airdrop stuff, if no balance is found ..
         // Request airdrops for all accounts that will be active
         if ((await connection.getBalance(trader.publicKey)) <= 2e9) {
             let tx1 = await connection.requestAirdrop(trader.publicKey, 2e9);
             await connection.confirmTransaction(tx1, 'finalized');
             console.log("Airdropped 1!");
         }
         if ((await connection.getBalance(liquidityProvider.publicKey)) <= 2e9) {
             let tx2 = await connection.requestAirdrop(liquidityProvider.publicKey, 2e9);
             await connection.confirmTransaction(tx2, 'finalized');
             console.log("Airdropped 2!");
         }
         if ((await connection.getBalance(currencyOwner.publicKey)) <= 2e9) {
             let tx3 = await connection.requestAirdrop(currencyOwner.publicKey, 2e9);
             await connection.confirmTransaction(tx3, 'finalized');
             console.log("Airdropped 3!");
         }
 
         // Maybe need to add delay. check if it works, and do it accordingly
         let traderBalance = await provider.connection.getBalance(trader.publicKey)
         let liquidityProviderBalance = await provider.connection.getBalance(liquidityProvider.publicKey)
         let currencyOwnerBalance = await provider.connection.getBalance(currencyOwner.publicKey)
         assert.ok(traderBalance > 2e9, "1 " + String(traderBalance));
         assert.ok(liquidityProviderBalance > 2e9, "2 " + String(liquidityProviderBalance));
         assert.ok(currencyOwnerBalance > 2e9, "3 " + String(currencyOwnerBalance));


         // Mint some fake tokens to the fake token accounts for fake money
         const usdc = new Token(connection, new PublicKey(MOCK.DEV.USDC), TOKEN_PROGRAM_ID, genericPayer)
         const usdt = new Token(connection, new PublicKey(MOCK.DEV.USDT), TOKEN_PROGRAM_ID, genericPayer)
         const sol = new Token(connection, new PublicKey(MOCK.DEV.SOL), TOKEN_PROGRAM_ID, genericPayer)
         const msol = new Token(connection, new PublicKey(MOCK.DEV.MSOL), TOKEN_PROGRAM_ID, genericPayer)

         const ADDRESS = new PublicKey('7cGcxMCWHqqJLQ6pK13ygt8TnPEpddcnvDFvW4onNgT5') // i copied this dk what it should be 
         const AMOUNT = new BN(1e6) // no decimals

         console.log('creating accounts')
         const minterUsdc = await usdc.createAccount(ADDRESS)
         const minterUsdt = await usdt.createAccount(ADDRESS)
         const minterSol = await sol.createAccount(ADDRESS)
         const minterMSol = await msol.createAccount(ADDRESS)

         console.log('sending tokens')
         await usdc.mintTo(minterUsdc, airdropAdmin, [], tou64(AMOUNT.mul(new BN(10).pow(new BN(6)))))
         await usdt.mintTo(minterUsdt, airdropAdmin, [], tou64(AMOUNT.mul(new BN(10).pow(new BN(6)))))
         await sol.mintTo(minterSol, airdropAdmin, [], tou64(AMOUNT.mul(new BN(13).pow(new BN(9)))))
         await msol.mintTo(minterMSol, airdropAdmin, [], tou64(AMOUNT.mul(new BN(10).pow(new BN(9)))))

         let fakeUSDCbalance = await provider.connection.getBalance(minterUsdc)
         let fakeUSDTbalance = await provider.connection.getBalance(minterUsdt)
         let fakeSOLbalance = await provider.connection.getBalance(minterSol)
         let fakeMSOLbalance = await provider.connection.getBalance(minterMSol)

         console.log('fake usdc balance, ', String(fakeUSDCbalance))
         console.log('fake usdt balance, ', String(fakeUSDTbalance))
         console.log('fake sol balance, ', String(fakeSOLbalance))
         console.log('fake msol balance, ', String(fakeMSOLbalance))




     })
 
     /** Assign the currency mint */
     it("#createCurrencyMint", async () => {
         assert.ok(solbondProgram.programId, String(solbondProgram.programId));
         assert.ok(invariantProgram.programId, String(invariantProgram.programId));
         // Take the currency mint from the user SDK
         currencyMint = new Token(connection, MOCK.DEV.SOL, solbondProgram.programId, currencyOwner);
         assert.ok(currencyMint.publicKey.equals(MOCK.DEV.SOL), currencyMint.publicKey.toString());
     })
 
     /** Initialize a mock market object*/
     it('#initializeMockMarket()', async () => {
         market = new QPoolsAdmin(
             connection,
             provider,
             currencyMint.publicKey,
             NETWORK.DEVNET
         );

         let programId = new PublicKey("95B4XeB4YWCGZjwv32Qgkh92CwKucR9TreoLzqKWEdSE");
         console.log(programId.toString())
         invariantMarket = await Market.build(Network.DEV, genericWallet, connection, programId);
 
     })
 
     // Actually, not even sure if this is needed at all
     let stateAddress: PublicKey;
     let stateAddressBump: number;
 
     let protocolFee = {v: fromFee(new BN(10000))};
     /** Create a state, if it doesn't exist yet... */
     it('#createState()', async () => {
         // Retrieve state from the invariant contract
         let {address, bump} = await invariantMarket.getStateAddress();
         stateAddress = address;
         stateAddressBump = bump;
 
         try {
             let stateAccount = (await invariantProgram.account.state.fetch(address)) as State;
             console.log("State account is: ", stateAccount);
         } catch (e) {
             console.log("Error fetching state account!");
             console.log(e);
             // Load, if it doesn't exist, create state
             let tx = await invariantMarket.createStateTransaction(genericPayer.publicKey);
             let sg = await connection.sendTransaction(tx, [genericPayer]);
             await connection.confirmTransaction(sg);
         }
     })
 
     /**
      * Create Trade Pairs
      * feeTiers are created as pools are created anyways
      * */
     let pairs: {[index: string]: any;} = {};
     let feeTier: FeeTier = {
         fee: fromFee(new BN(10))
     };

     it ('#getOnePool', async () => {
         let sol_usdc_pair = new Pair(
             MOCK.DEV.SOL,
             MOCK.DEV.USDC,
             feeTier,
         )
         try {
            let pool = (await invariantMarket.getPool(sol_usdc_pair)) as PoolStructure;
         } catch (err) {
            let crtPool: CreatePool = {
                pair: sol_usdc_pair,
                payer: genericPayer,
                initTick: 0,

            }

            await invariantMarket.createPool(crtPool)
            let pool = (await invariantMarket.getPool(sol_usdc_pair)) as PoolStructure;
            console.log("did i get pool now?", pool)
        } 
     })

     it ('provideLiquidityToOnePool', async () => {

        let qpair = new QPair(
            MOCK.DEV.SOL,
            MOCK.DEV.USDC,
            feeTier,
        )

        //currencyMint = await createMint(provider, currencyOwner, currencyOwner.publicKey, 9);
        await qpair.setCurrencyMint(currencyMint.publicKey)
        let lowerTick = 0;
        let upperTick = 4;
        const liquidityDelta = new BN(1);

        // let pingpong = await market.initializeQPTReserve()
        // await provider.connection.confirmTransaction(pingpong);

        await market.createSinglePosition(qpair, lowerTick, upperTick, liquidityDelta, invariantMarket)

     })
 
     /** Create Pairs */
     /*it('#createPairs', async () => {
         // Create a couple pairs one for each market
         // These tokens were manually created ov erCLI
         pairs["SOL/USDC"] = new QPair(
             MOCK.DEV.SOL,
             MOCK.DEV.USDC,
             feeTier
         )
         pairs["SOL/mSOL"] = new QPair(
             MOCK.DEV.SOL,
             MOCK.DEV.MSOL,
             feeTier
         )
         pairs["USDC/mSOL"] = new QPair(
             MOCK.DEV.USDC,
             MOCK.DEV.MSOL,
             feeTier
         )
         pairs["USDC/SOL"] = pairs["SOL/USDC"]
         pairs["mSOL/SOL"] = pairs["SOL/mSOL"]
         pairs["mSOL/USDC"] = pairs["USDC/mSOL"]
 
         // TODO: Figure out what to follow here
         // Because we need to act as if we have this money
         // We probably will need to re-create each feeTier, state, etc. ourselves
 
         for (let pairString in pairs) {
             console.log("pairString ", pairString);
             let qpair = pairs[pairString];
             console.log("qpair is: ", qpair);
 
             // If either exists, then
             // If the fee tier does not exist yet, create the feeTier
             let feeTierAccount;
             // let feeTierAddress = await qpair.getFeeTierAddress(invariantProgram.programId);
             let {address, bump} = await invariantMarket.getFeeTierAddress(market.feeTier);
             let feeTierAddress = address;
             qpair.feeTierAddress = feeTierAddress
             try {
                 let feeTierAccount  = (await invariantProgram.account.feeTier.fetch(feeTierAddress)) as FeeTier;
                 console.log("feeTierAddress: ", feeTierAddress.toString())
             } catch (e) {
                 console.log("Error trying to fetch fee-tier!");
                 console.log(e);
                 let createFeeTier: CreateFeeTier = {
                     admin: genericPayer.publicKey,
                     feeTier: feeTier
                 };
                 let tx = await invariantMarket.createFeeTierTransaction(createFeeTier);
                 console.log("Creating fee tier..");
                 let sg = await connection.sendTransaction(tx, [genericPayer]);
                 console.log("TX Sig: ", sg);
                 await connection.confirmTransaction(sg, "finalized");
                 // await invariantMarket.createFeeTier(createFeeTier, genericPayer);
                 // await delay(2000);
                 console.log("Fetch again...");
                 feeTierAccount = (await invariantProgram.account.feeTier.fetch(feeTierAddress)) as FeeTier;
            }

            let lowerTick = -50;
            let upperTick = 50;
            const liquidityDelta = new BN(1);
            qpair.feeTierAddress = feeTierAddress;
            console.log("KUNI pool is: ", qpair);
            await market.createSinglePosition(qpair, lowerTick, upperTick, liquidityDelta, invariantMarket);
 
             // If the pool does not exist yet, create the pool
             /*let poolAccount;
             let poolAddress = await qpair.getAddress(invariantProgram.programId);
             console.log("pool Address: ", poolAddress.toString());
             try {
                 poolAccount = (await invariantProgram.account.pool.fetch(poolAddress)) as PoolStructure;
             } catch (e) {
                 console.log("Error trying to fetch pool account!");
                 console.log(e)
                 // let's just assume that the initial tick is at zero
                 let tokenX = new Token(connection, qpair.tokenX, invariantProgram.programId, genericPayer);
                 let tokenY = new Token(connection, qpair.tokenY, invariantProgram.programId, genericPayer);
                 let createPool: CreatePool = {
                     pair: qpair,
                     payer: genericPayer,
                     protocolFee: protocolFee,
                     tokenX: tokenX,
                     tokenY: tokenY
                 };
                 console.log("Create pool is: ", qpair, JSON.stringify(protocolFee), tokenX.publicKey.toString(), tokenY.publicKey.toString());
                 await invariantMarket.createPool(createPool);
                 console.log("Created pool!");
                 poolAccount = (await invariantProgram.account.pool.fetch(poolAddress)) as PoolStructure;
             }

            
             const lowerTick = -50;
             const upperTick = 50;
             let pair: Pair = new Pair(qpair.tokenX,qpair.tokenY,  qpair.feeTier);
             const poolAddress = await pair.getAddress(invariantProgram.programId);
             console.log("kjkk ", poolAddress.toString())
             console.log(pair)
             const [tickmap, pool] = await Promise.all([invariantMarket!.getTickmap(pair), invariantMarket!.getPool(pair)])
     
             
             const tx = new Transaction();
     
    
     
             const {positionListAddress} = await invariantMarket!.getPositionListAddress(market.qPoolAccount!);
             const account = await connection.getAccountInfo(positionListAddress);
     
             if (account === null) {
                 tx.add(await invariantMarket!.createPositionListInstruction(market.qPoolAccount!));
             }
     
     
             // Retrieve tick addresses
             const {
                 tickAddress: lowerTickPDA,
                 tickBump: lowerTickPDABump
             } = await invariantMarket!.getTickAddress(pair, lowerTick);
             const {
                 tickAddress: upperTickPDA,
                 tickBump: upperTickPDABump
             } = await invariantMarket.getTickAddress(pair, upperTick);
     
     
             const QPTokenXAccount = await createAssociatedTokenAccountSendUnsigned(
                 connection,
                 pool.tokenX,
                 market.qPoolAccount!,
                 provider.wallet
             );
     
             console.log("('''qPoolTokenXAccount) ", QPTokenXAccount.toString());
             const QPTokenYAccount = await createAssociatedTokenAccountSendUnsigned(
                 connection,
                 pool.tokenY,
                 market.qPoolAccount!,
                 provider.wallet
             );
     
             console.log("('''qPoolTokenYAccount) ", QPTokenYAccount.toString());
     
     
             const POSITION_SEED = 'positionv1';
             const index = 0;  // TODO: Gotta find index first
             const indexBuffer = Buffer.alloc(4)
             indexBuffer.writeInt32LE(0);
             // Should not have wallet as seed,
             // but should have
             //
             const [positionAddress, positionBump] = await PublicKey.findProgramAddress(
                 [Buffer.from(utils.bytes.utf8.encode(POSITION_SEED)), market.qPoolAccount!.toBuffer(), indexBuffer],
                 // this.invariantProgram.programId
                 invariantProgram.programId
             )
             console.log("invariant program id is: ", invariantProgram.programId.toString());
     
             const tickmapData = await invariantMarket.getTickmap(pair);
             const liquidityDelta = new BN(1);
             // I guess liquidity delta is calculated globally
             console.log("Debug liquidity providing");
             console.log(
                 positionBump,
                 market.bumpQPoolAccount,
                 lowerTick,
                 upperTick,
                 liquidityDelta,
                 {
                     accounts: {
                         // Create liquidity accounts
                         initializer: genericWallet.publicKey.toString(),
                         
                         bondPoolCurrencyTokenMint: market.currencyMint.publicKey.toString(),
                         state: invariantMarket!.stateAddress.toString(),
                         position: positionAddress.toString(),
                         pool: poolAddress.toString(),
                         positionList: positionListAddress.toString(),
                         owner: market.qPoolAccount!.toString(),
                         lowerTick: lowerTickPDA.toString(),
                         upperTick: upperTickPDA.toString(),
                         tokenX: pool.tokenX.toString(),
                         tokenY: pool.tokenY.toString(),
                         accountX: QPTokenXAccount.toString(),
                         accountY: QPTokenYAccount.toString(),
                         reserveX: pool.tokenXReserve.toString(),
                         reserveY: pool.tokenYReserve.toString(),
                         tickmap: pool.tickmap.toString(),
                         
                         // Auxiliary Accounts
                         programAuthority: invariantMarket!.programAuthority.toString(),
                         tokenProgram: TOKEN_PROGRAM_ID.toString(),
                         invariantProgram: invariantProgram.programId.toString(),
                         systemProgram: web3.SystemProgram.programId.toString(),
                         rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString()
                     }
                 }
                 )
                 
                 
                 let finaltx = await solbondProgram.rpc.createLiquidityPosition(
                     positionBump,
                     market.bumpQPoolAccount,
                     new BN(lowerTick),
                     new BN(upperTick),
                     new BN(liquidityDelta),
                     {
                         accounts: {
                             // Create liquidity accounts
                             initializer: genericWallet.publicKey,  // Again, remove initializer as a seed from the qPoolAccount!
                             
                             bondPoolCurrencyTokenMint: market.currencyMint.publicKey,
                             state:invariantMarket.stateAddress,
                             position: positionAddress,
                             pool: poolAddress,
                             positionList: positionListAddress,
                             owner: market.qPoolAccount!,
                             lowerTick: lowerTickPDA,
                             upperTick: upperTickPDA,
                             tokenX: pool.tokenX,
                             tokenY: pool.tokenY,
                             accountX: QPTokenXAccount,
                             accountY: QPTokenYAccount,
                             reserveX: pool.tokenXReserve,
                             reserveY: pool.tokenYReserve,
                             tickmap: pool.tickmap,
                             
                             // Auxiliary Accounts
                             programAuthority: invariantMarket.programAuthority,
                             tokenProgram: TOKEN_PROGRAM_ID,
                             rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                             systemProgram: web3.SystemProgram.programId,
                             invariantProgram: invariantProgram.programId,
                         },
                         signers: [genericWallet]
                     }
                 )
     
                 await provider.connection.confirmTransaction(finaltx);
     
                 console.log("did  it  Transaction id is: ", finaltx);
     
 
             // For each of these pairs, create a pool if it doesn't exist yet
         }
 
     })*/
 
 
 })