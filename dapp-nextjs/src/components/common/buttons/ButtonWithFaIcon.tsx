import React, {FC} from "react";
import {FaFaucet} from "react-icons/fa";
import {IconType} from "react-icons";

interface Props {
    icon: IconType,
    text: string,
    onClick:  () => void,
    activated: boolean
}
export const ButtonWithFaIcon = ({icon, text, onClick, activated=true}: Props) => {

    let additionalCssClasses = activated ? "" : "cursor-not-allowed text-gray-700";

    return (
        <>
            <button
                className={"border border-gray-500 text-white font-bold py-3 px-7 rounded " + additionalCssClasses}
                onClick={onClick}
            >
                <div className={"flex flex-row"}>
                    <div className={"py-auto my-auto pr-3"}>
                        {icon({})}
                    </div>
                    {text}
                </div>
            </button>
        </>
    );
};
