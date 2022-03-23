import React, {useState} from "react";
import Image from "next/image";
import {BRAND_COLORS} from "../../const";
import {registry} from "@qpools/sdk";
import {IRpcProvider, useRpc} from "../../contexts/RpcProvider";
import {AllocData} from "../../types/AllocData";

// interface Props {
//     allAssets: AllocData[],
//     selectedAsset: AllocData,
//     displayText: string
//     setNewValue: any  // Setter function from useState
// }

export default function InputFieldWithSliderInputAndLogo(props: any) {

    // TODO: Find a provider that does this for you
    // Probably the UserWalletAssets provider!
    // const qPoolContext: IRpcProvider = useRpc();

    // Have a setter for the value ..
    // Or get this from props ...
    // Probably props is better
    const [value, setValue] = useState<number>(0.);

    // Max and Min Fields need to be included
    const inputTextField = () => {
        return (<>
            <input
                className="rounded-lg w-full items-end text-right h-12 p-4"
                style={{backgroundColor: BRAND_COLORS.slate700}}
                type="number"
                id="stake_amount"
                autoComplete="stake_amount"
                placeholder="0.0"
                step={"0.0001"}
                min="0"
                onChange={(event) => {
                    let newValue = Number(event.target.value);
                    console.log("New " + String(props.displayText) + " is: " + String(newValue));
                    props.setNewValue(newValue);
                }}
            />
        </>)
    }

    const inputRangeField = () => {
        return (<>
                <input
                    type="range"
                    min="0"
                    max="100"
                    onChange={(event) => {
                        let newValue = Number(event.target.value);
                        console.log("New " + String(props.displayText) + " is: " + String(newValue));
                        setValue(newValue);
                    }}
                    value={value}
                    className="range range-xs"
                />
            </>
        )
    }

    // Maybe this should be a special component ....

    // Gotta pick the token that is whitelisted, and inside the
    if (!props.selectedAsset) {
        return (<></>);
    }

    const logoPath = props.selectedAsset.pool?.tokens.filter((x: registry.ExplicitToken) => {return registry.getWhitelistTokens()})[0].address!;
    return (
        <>
            <div className="flex flex-col form-control w-full">
                {/*<label className="label">*/}
                {/*    <span className="label-text">What is your name?</span>*/}
                {/*    <span className="label-text-alt">Alt label</span>*/}
                {/*</label>*/}
                <div className="mx-auto my-auto p-1 relative text-gray-300 focus-within:text-gray-300 w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 h-full">
                    <div className={"flex w-full my-auto text-center content-center"}>
                        <Image alt={props.displayText} src={logoPath} height={34} width={34}/>
                        <text className={"my-auto text-center content-center mx-2"}>
                            {props.displayText}
                        </text>
                    </div>
                    </span>
                    {inputTextField()}
                </div>
                {/*<div className={"mx-auto my-auto p-1 max-w-xs"}>*/}
                {/*    <input type="number" placeholder="Type here" className="input input-bordered w-full max-w-xs" />*/}
                {/*</div>*/}
                <div className={"mx-auto my-auto p-1 w-full"}>
                    {inputRangeField()}
                </div>
                    {/*<label className="label">*/}
                    {/*    <span className="label-text-alt">Alt label</span>*/}
                    {/*    <span className="label-text-alt">Alt label</span>*/}
                    {/*</label>*/}
            </div>
            {/*<div className="flex flex-row w-full h-full mx-0">*/}
            {/*    <div className="relative text-gray-300 focus-within:text-gray-300 w-full h-full">*/}
            {/*      <span className="absolute inset-y-0 left-0 flex items-center pl-2 h-full">*/}
            {/*        <div className={"flex w-full my-auto text-center content-center"}>*/}
            {/*            <Image alt={props.displayText} src={props.logoPath} height={34} width={34}/>*/}
            {/*            <text className={"my-auto text-center content-center mx-2"}>*/}
            {/*                {props.displayText}*/}
            {/*            </text>*/}
            {/*        </div>*/}
            {/*        </span>*/}
            {/*        {props.modifiable ? inputField() : displayField()}*/}
            {/*    </div>*/}
            {/*</div>*/}
        {/*    TODO: Add the connect wallet button here, perhaps (?)*/}
        </>
    );
}