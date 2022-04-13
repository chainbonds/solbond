import React, {FC} from "react";
import {FaFaucet} from "react-icons/fa";

interface Props {
    show: boolean,
    setShow:  React.Dispatch<React.SetStateAction<boolean>>
}
export const BuyMoreButton = ({show, setShow}: Props) => {

    return (
        <>
            <button
                className="border border-gray-500 text-white font-bold py-3 px-7 rounded "
                onClick={() => setShow(true)}
            >
                <div className={"flex flex-row"}>
                    <div className={"py-auto my-auto pr-3"}>
                        <FaFaucet/>
                    </div>
                    FAUCET
                </div>
            </button>
        </>
    );
};
