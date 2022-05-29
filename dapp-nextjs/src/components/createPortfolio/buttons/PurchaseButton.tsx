import React from "react";
import {IRpcProvider, useRpc} from "../../../contexts/RpcProvider";
import {IItemsLoad, useItemsLoad} from "../../../contexts/ItemsLoadingContext";
import {ICrank, useCrank} from "../../../contexts/CrankProvider";
import {ILocalKeypair, useLocalKeypair} from "../../../contexts/LocalKeypairProvider";
import {AllocData} from "../../../types/AllocData";
import {useErrorMessage} from "../../../contexts/ErrorMessageContext";
import {useConnectedWallet} from "@saberhq/use-solana";
import {PrimaryButton} from "../../common/buttons/PrimaryButton";
import {depositPortfolio} from "../../../functions/depositPortfolio";

// TODO: Refactor the code here ... looks a bit too redundant.
//  Maybe try to push the logic into the sdk?
interface Props {
    passedAllocationData: Map<string, AllocData>
}

// Gotta have as input the wallet assets
export default function PurchaseButton({passedAllocationData}: Props) {

    const rpcProvider: IRpcProvider = useRpc();
    // const walletContext: WalletContextState = useWallet();
    const walletContext = useConnectedWallet();
    const crankProvider: ICrank = useCrank();
    const localKeypairProvider: ILocalKeypair = useLocalKeypair();
    const itemLoadContext: IItemsLoad = useItemsLoad();
    const errorMessage = useErrorMessage();

    return (
        <>
            <PrimaryButton
                text={"Deposit"}
                onClick={() => {
                    console.log("Deposit stupid Portfolio");
                    depositPortfolio(
                        passedAllocationData,
                        rpcProvider,
                        errorMessage,
                        itemLoadContext,
                        localKeypairProvider,
                        crankProvider,
                        walletContext,
                    )
                }}
            />
        </>
    )

}
