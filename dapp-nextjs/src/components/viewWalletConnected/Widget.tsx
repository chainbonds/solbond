// Assume that your wallet is connected ...
import {DisplayToken} from "../../types/DisplayToken";
import {DisplayProtocol} from "../../types/DisplayProtocol";
import {BRAND_COLORS} from "../../const";
import TokenIcon from "../common/basic/TokenIcon";
import {PrimaryButton} from "../common/buttons/PrimaryButton";
import {FaRegTrashAlt, FaTimesCircle} from "react-icons/fa";  // Replace with

/**
 * Maybe you can make the tokens spin, depending on how much
 *
 * Maybe you can also sort them by most-APY-giving, to least APY-giving
 *
 *
 */
interface Props {
    apy: string,
    tokens: DisplayToken[],
    protocols: DisplayProtocol[],
    onClickPrimary: any,
    onClickRemoveToken: any,
    onClickRemoveProtocol: any
}

export default function Widget(props: Props) {

    // Display a set of tokens
    // Display a set of protocols
    // Perhaps also display a set of pools

    return (
        <div className={"flex flex-col mx-auto w-80 bg-white rounded text-black"}>

            <h1 className={"w-full text-2xl text-center shadow-md py-5"}>
                Earn
                {/*<br />*/}
                <b>
                    {" " + props.apy + " "}
                </b>
                right now!
            </h1>

            <div className={"flex flex-col p-4"}>

                <h2 className={"text-xl mt-2"}>
                    Tokens in your Wallet
                </h2>
                <div
                    className={"w-full rounded h-full h-12 mt-3"}
                    style={{backgroundColor: BRAND_COLORS.slate200}}
                >
                    <div className={"flex flex-row items-center h-full mx-2"}>
                        {props.tokens.map((x: DisplayToken) => {
                            return (
                                <div className={"group"}>
                                    <div className={"mx-1 group-hover:mx-0 group-hover:my-0 hover:border-blue-400 group-hover:border-4 rounded-full py-0 border-0 relative"}>
                                        <TokenIcon url={x.tokenSolscanLink} logoUri={x.tokenImageLink} name={x.name}/>
                                        <FaTimesCircle
                                            onClick={props.onClickRemoveToken}
                                            className="invisible group-hover:visible absolute top-0 right-0 -mt-5 -mr-5 h-7 w-7 bg-red-500 rounded-full border-2 border-red-500 opacity-50 hover:opacity-100 hover:cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <br/>
                <h2 className={"text-xl"}>
                    Matching Protocols
                </h2>
                <div
                    className={"w-full rounded h-full h-12 mt-3"}
                    style={{backgroundColor: BRAND_COLORS.slate200}}
                >
                    <div className={"flex flex-row items-center h-full mx-2"}>
                        {props.protocols.map((x: DisplayProtocol) => {
                            return (
                                // <div className={"group"}>
                                //     <div className={"mx-1 hover:mx-0 hover:my-0 hover:border-blue-400 hover:border-4 rounded-full py-0 border-0"}>
                                //         <TokenIcon url={x.protocolSolscanLink} logoUri={x.protocolImageLink} name={x.name}/>
                                //     </div>
                                // </div>
                                <div className={"group"}>
                                    <div className={"mx-1 group-hover:mx-0 group-hover:my-0 hover:border-blue-400 group-hover:border-4 rounded-full py-0 border-0 relative"}>
                                        <TokenIcon url={x.protocolSolscanLink} logoUri={x.protocolImageLink} name={x.name}/>
                                        <FaTimesCircle
                                            onClick={props.onClickRemoveProtocol}
                                            className="invisible group-hover:visible absolute top-0 right-0 -mt-5 -mr-5 h-7 w-7 bg-red-500 rounded-full border-2 border-red-500 opacity-50 hover:opacity-100 hover:cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className={"flex mx-auto mt-2 mb-4"}>
                <PrimaryButton text={"Review"} onClick={props.onClickPrimary}/>
            </div>

        </div>
    )

}