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
export default function Card(props: Props) {

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

            <div className={"flex flex-col p-4"}>

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
                        <h1 className={"text-3xl text font-bold"}>
                            {props.apy}
                        </h1>
                        <p className={"text-xs ml-1 text-gray-500 right-0 text-right"}>
                            APY
                        </p>
                    </div>

                </div>

                <div className={"my-3"}>
                    <div
                        className="mx-auto my-auto relative text-gray-700 focus-within:text-gray-900 w-full h-full rounded-lg"
                        style={{backgroundColor: BRAND_COLORS.slate100}}
                    >
                        <span className="py-3 left-0 flex items-center pl-2 h-full">
                            <div className={"flex w-full my-auto text-center content-center px-1"}>
                                This strategy consists of staking and lending protocols.
                                {/*<text className={"my-auto text-center content-center mx-2"}>{name}</text>*/}
                            </div>
                        </span>
                    </div>
                </div>

                {/*// This stuff should prob best be passed on through an alloc-item object ...*/}
                <div className={"py-3 border-t-2"}>
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
                    />
                </div>


                {/*<h2 className={"text-xl mt-2"}>*/}
                {/*    Tokens in your Wallet*/}
                {/*</h2>*/}
                {/*<div*/}
                {/*    className={"w-full rounded h-full h-12 mt-3"}*/}
                {/*    style={{backgroundColor: BRAND_COLORS.slate200}}*/}
                {/*>*/}
                {/*    <div className={"flex flex-row items-center h-full mx-2"}>*/}
                {/*        */}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<br/>*/}
                {/*<h2 className={"text-xl"}>*/}
                {/*    Matching Protocols*/}
                {/*</h2>*/}
                {/*<div*/}
                {/*    className={"w-full rounded h-full h-12 mt-3"}*/}
                {/*    style={{backgroundColor: BRAND_COLORS.slate200}}*/}
                {/*>*/}
                {/*    <div className={"flex flex-row items-center h-full mx-2"}>*/}
                {/*        {props.protocols.map((x: DisplayProtocol) => {*/}
                {/*            return (*/}
                {/*                // <div className={"group"}>*/}
                {/*                //     <div className={"mx-1 hover:mx-0 hover:my-0 hover:border-blue-400 hover:border-4 rounded-full py-0 border-0"}>*/}
                {/*                //         <TokenIcon url={x.protocolSolscanLink} logoUri={x.protocolImageLink} name={x.name}/>*/}
                {/*                //     </div>*/}
                {/*                // </div>*/}
                {/*                <div className={"group"}>*/}
                {/*                    <div className={"mx-1 group-hover:mx-0 group-hover:my-0 hover:border-blue-400 group-hover:border-4 rounded-full py-0 border-0 relative"}>*/}
                {/*                        <TokenIcon url={x.protocolSolscanLink} logoUri={x.protocolImageLink} name={x.name}/>*/}
                {/*                        <FaTimesCircle*/}
                {/*                            onClick={props.onClickRemoveProtocol}*/}
                {/*                            className="invisible group-hover:visible absolute top-0 right-0 -mt-5 -mr-5 h-7 w-7 bg-red-500 rounded-full border-2 border-red-500 opacity-50 hover:opacity-100 hover:cursor-pointer"*/}
                {/*                        />*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*            )*/}
                {/*        })}*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className={"flex max-w-full mt-1 mb-3 mx-1"}>
                    <PrimaryButton text={"Review"} onClick={props.onClickPrimary}/>
                </div>

            </div>

        </div>
    )

}