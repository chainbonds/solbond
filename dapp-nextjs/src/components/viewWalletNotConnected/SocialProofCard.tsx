// Assume that your wallet is connected ...
import {DisplayToken} from "../../types/DisplayToken";
import {DisplayProtocol} from "../../types/DisplayProtocol";
import TokenIcon from "../common/basic/TokenIcon";
import {PublicKey} from "@solana/web3.js";
import {shortenedAddressString} from "../../utils/utils";  // Replace with

/**
 * Maybe you can make the tokens spin, depending on how much
 *
 * Maybe you can also sort them by most-APY-giving, to least APY-giving
 *
 *
 */
interface Props {
    publicKey: PublicKey,
    apy: string,
    tokens: DisplayToken[],
    protocols: DisplayProtocol[],
}

export default function SocialProofCard(props: Props) {

    // Display a set of tokens
    // Display a set of protocols
    // Perhaps also display a set of pools

    return (
        <div className={"flex flex-col mx-auto w-80 bg-white rounded text-black"}>

            <h1 className={" w-full text-2xl text-center shadow-md py-5 items-center align-middle"}>
                Wallet {shortenedAddressString(props.publicKey)} is earning
                {/*<br />*/}
                <b>
                    {" " + props.apy + " "}
                </b>
                yield on &thinsp;

                <span className={"-mb-10"}>
                {props.tokens.map((x: DisplayToken) => {
                    return (
                        <div className={"inline-flex align-middle"}>
                            <TokenIcon url={x.tokenSolscanLink} logoUri={x.tokenImageLink} name={x.name}/>
                        </div>
                    )
                })}
                </span>

                &thinsp; using &thinsp;

                {props.protocols.map((x: DisplayProtocol) => {
                    return (
                        <div className={"inline-flex align-middle mx-1"}>
                            <TokenIcon url={x.protocolSolscanLink} logoUri={x.protocolImageLink} name={x.name}/>
                        </div>
                    )
                })}

            </h1>

        </div>
    )

}