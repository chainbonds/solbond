// Assume that your wallet is connected ...
import {DisplayToken} from "../../types/DisplayToken";
import {DisplayProtocol} from "../../types/DisplayProtocol";
import TokenIcon from "../common/basic/TokenIcon";
import {PrimaryButton} from "../common/buttons/PrimaryButton";
import TokenValueInputField from "../common/input/TokenValueInputField";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";  // Replace with

/**
 * Maybe you can make the tokens spin, depending on how much
 *
 * Maybe you can also sort them by most-APY-giving, to least APY-giving
 *
 *
 */
interface Props {
    apy: string,
    token: DisplayToken,
    protocols: DisplayProtocol[],
    onClickPrimary: any,
    onClickRemoveToken: any,
    onClickRemoveProtocol: any
}

/**
 * Should probably introduce a "strategy" object, which takes as input one token,
 * then all the protocols, and their respective allocations for this one token
 * @param props
 * @constructor
 */
export default function SimplifiedCard(props: Props) {

    // Display a set of tokens
    // Display a set of protocols
    // Perhaps also display a set of pools

    return (
        <div className={"flex flex-col max-w-7xl bg-white rounded text-black"}>

            {/*<h1 className={"w-full text-2xl text-center shadow-md py-5"}>*/}
            {/*    Earn*/}
            {/*    /!*<br />*!/*/}
            {/*    <b>*/}
            {/*        {" " + props.apy + " "}*/}
            {/*    </b>*/}
            {/*    right now!*/}
            {/*</h1>*/}

            <div className={"flex flex-col p-4 pb-0"}>

                <div className={"flex flex-row w-full justify-between pb-5 border-b-2"}>

                    <div className={"flex flex-col align-bottom"}>
                        <div className={"flex flex-row"}>
                            {props.protocols.map((x: DisplayProtocol) => {
                                return (
                                    <div className={"group"}>
                                        <div
                                            className={"m-1 group-hover:m-0 group-hover:my-0 hover:border-blue-400 group-hover:border-4 rounded-full py-0 border-0 relative"}>
                                            <TokenIcon url={x.protocolSolscanLink} logoUri={x.protocolImageLink}
                                                       name={x.name}/>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <p className={"text-xs ml-1 text-gray-500"}>
                            Mixed Strategy
                        </p>
                    </div>

                    <div className={"flex flex-col"}>
                        <h1 className={"text-3xl text font-bold text-right"}>
                            {props.apy}
                        </h1>
                        <p className={"text-xs ml-1 text-gray-500 right-0 text-right"}>
                            Annual Percentage Yield
                        </p>
                    </div>

                </div>

                {/*// This stuff should prob best be passed on through an alloc-item object ...*/}
                <div className={"py-3"}>
                    <TokenValueInputField
                        min={0.}
                        max={100.}
                        value={34.}
                        onChange={() => {
                            console.log("Change ..")
                        }}
                        logoPath={props.token.tokenImageLink}
                        name={props.token.name}
                        loading={false}
                        errorMessage={""}
                        totalBalance={"10.4"}
                        maxBalance={"50.4"}
                        showBalance={false}
                    />
                </div>

            </div>

        </div>
    )

}