import React, {FC} from "react";
import Image from "next/image";

export const DeadButtonWallet: FC = ({}) => {

    return (
        <>
            <button
                style={{ backgroundColor: "#1a202c" }}
                className="border border-gray-500 text-white font-bold py-3 px-7 rounded "
                onClick={() => alert("Coming soon !")}
            >
                <div className={"flex flex-row"}>
                    <div className={"w-6 h-6 py-auto my-auto pr-3"}>
                        <Image src={'/phantom.png'} alt="Logo" height={18} width={18} className={"py-auto justify-center"} />
                    </div>
                    Connect
                </div>
            </button>
        </>
    );
};
