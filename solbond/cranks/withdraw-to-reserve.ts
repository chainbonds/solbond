/**
 * 29. Dec. 2021
 * This script deploys the qPools reserve
 * to specified liquidity pools on Saber
 *
 * It costs around
 */
 import {Provider} from "@project-serum/anchor";
 import {clusterApiUrl, Keypair, PublicKey} from "@solana/web3.js";
 import {Token} from "@solana/spl-token";
 import {MOCK} from "@qpools/sdk";
 import { QPoolsAdmin, SaberInteractTool , BALANCED, JUST_a} from "@qpools/admin-sdk";
 import { get } from "https";
import { NETWORK } from "@qpools/sdk/lib/cluster";
 
const withdrawFromAll = async ( weights_per_pool: Array<number>, pool_addresses: Array<PublicKey>) => {


    let cluster: string = clusterApiUrl('devnet');
    
    console.log("Cluster is: ", cluster);
    const provider = Provider.local(cluster,
        {
            skipPreflight: true
        }
    );
    const connection = provider.connection;
    // @ts-expect-error
    const wallet = provider.wallet.payer as Keypair;



    // Define the currency mint
    console.log("Initialize a qpool");
    const qPoolAdminTool = new QPoolsAdmin(
        connection,
        provider,
        MOCK.DEV.SABER_USDC
    );
    await qPoolAdminTool.setQPoolAccount(MOCK.DEV.SABER_USDC);

    const saberInteractTool = new SaberInteractTool(qPoolAdminTool);

    // Check if an account exists already
    const existingQPT = await qPoolAdminTool.loadExistingQPTReserve();
    if (existingQPT) {
        qPoolAdminTool.prettyPrintAccounts();
        //return
    } else {
        console.log("Creating new pool!");
    }

    // if (
    //     cluster.toString().includes("dev") ||
    //     cluster.toString().includes("test") ||
    //     cluster.toString().includes("localhost") || cluster.toString().includes("127.0.0.1")
    // ) {
    //     console.log("Cluster is: ", cluster);
    //     console.log("Initializing the QPT Reserve");
    //     await qPoolAdminTool.initializeQPTReserve();
    // } else {
    //     throw Error("mainnet definitely not implemented yet!!");
    // }

    // qPoolAdminTool.prettyPrintAccounts();
    console.log("successfully got the state!");
    console.log("qpoolacc ", qPoolAdminTool.qPoolAccount.toString());
    //const total_amount = await connection.getTokenAccountBalance(qPoolAdminTool.qPoolAccount);
    //console.log("total amount in qPoolAccount is ", total_amount.toString())
    for (var i = 0; i < weights_per_pool.length; i++) {
        
        const weight = weights_per_pool[i];
        const pool_address = pool_addresses[i];

        //const total_amount_to_go_in_pool = weight * total_amount;
        let pool_state = await saberInteractTool.getPoolState(pool_address)
        const {state} = pool_state;
        let LP_mint = state.poolTokenMint;
        let LP_user_account = await saberInteractTool.getAccountForMint(LP_mint);
        var bal = await (await connection.getTokenAccountBalance(LP_user_account)).value.amount;
        
        var bal_num: number = +bal
        console.log("🤯🤯🤯🤯 balance ", bal.toString());
        
        
        //const amount_a = strategy[0] * total_amount_to_go_in_pool;
        //let amount_b = strategy[1] * total_amount_to_go_in_pool;
        const lp_amount = bal_num; 
        const amount_a = bal_num*0.2;
        const amount_b = bal_num*0.2;
        

        await saberInteractTool.withdrawFromSaber(lp_amount, amount_a, amount_b, pool_address);


    }

}

const SimpleSimulation = async () => {
    
    // simulate a simple deposit loop, where the weights are balanced
    console.log("taxi taxi")
    const weights: Array<number> = [1];    
    const pool_addresses: Array<PublicKey> = [MOCK.DEV.SABER_POOL.USDC_USDT];

    await withdrawFromAll(weights, pool_addresses);
}
 
SimpleSimulation()

