import React, {FC} from "react";
import {FaFaucet} from "react-icons/fa";
import {IconType} from "react-icons";

interface Props {
    text: string,
    onClick:  () => void,
}
export const PrimaryButton = ({text, onClick}: Props) => {

    return (
        <>
            <button
                type="button"
                // py-2.5
                className="px-10 h-12 my-auto bg-pink-700 text-white text-md font-semibold leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                onClick={onClick}
            >
                {text}
            </button>
        </>
    );
};
