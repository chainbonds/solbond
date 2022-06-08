// Assume that your wallet is connected ...
import {DisplayToken} from "../../types/DisplayToken";
import {DisplayProtocol} from "../../types/DisplayProtocol";
import {BRAND_COLORS} from "../../const";
import TokenIcon from "../common/basic/TokenIcon";
import {PrimaryButton} from "../common/buttons/PrimaryButton";

interface Props {
    title: string,
    apy: string,
    tokens: DisplayToken[],
    protocols: DisplayProtocol[],
    onClick: any
}

export default function Widget(props: Props) {

    // Display a set of tokens
    // Display a set of protocols
    // Perhaps also display a set of pools

    return (
        <div className={"flex flex-col mx-auto w-80 bg-white rounded text-black"}>

            <h1 className={"w-full text-2xl text-center shadow-md py-5"}>
                {/*{props.title}*/}
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
                                <TokenIcon logoUri={x.tokenImageLink} name={x.name}/>
                            )
                        })}
                    </div>
                </div>
                <br/>
                <h2 className={"text-xl"}>
                    Suggested Protocols
                </h2>
                <div
                    className={"w-full rounded h-full h-12 mt-3"}
                    style={{backgroundColor: BRAND_COLORS.slate200}}
                >
                    <div className={"flex flex-row items-center h-full mx-2"}>
                        {props.protocols.map((x: DisplayProtocol) => {
                            return (
                                <TokenIcon logoUri={x.protocolImageLink} name={x.name}/>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className={"flex mx-auto mt-2 mb-4"}>
                <PrimaryButton text={"Review"} onClick={props.onClick}/>
            </div>

        </div>
    )

}