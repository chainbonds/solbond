import React, {FC} from "react";

export const DevnetButton: FC = ({}) => {

    return (
        <>
            <div
                className="border border-gray-500 text-white font-bold py-3 px-7 rounded"
            >
                <div className={"flex flex-row"}>
                    <div className={"py-auto my-auto"}>
                        {/*<FaFaucet/>*/}
                    </div>
                    DEVNET
                </div>
            </div>
        </>
    );
};
