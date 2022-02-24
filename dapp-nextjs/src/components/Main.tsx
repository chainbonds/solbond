import React, {FC} from "react";
import HeroForm from "./HeroForm";
import Statistics from "./displays/Statistics";
import LoadingItemsModal from "./modals/LoadingItemsModal";

export const Main: FC = ({}) => {

    const title = () => {
        return (
            <div
                id="slogan-wrapper"
                className="w-full h-full flex"
                style={{backgroundColor: "#1a202c"}}
            >
                <div className={"relative text-center lg:text-left mx-auto lg:mx-0"}>
                    <h1 className="absolute text-4xl lg:text-7xl font-bold transform -translate-x-1 -translate-y-1">
                        Generate Yields
                        <br/>
                        Adjust Risk
                    </h1>
                    <h1 className="text-4xl lg:text-7xl font-bold text-pink-500">
                        Generate Yields
                        <br/>
                        Adjust Risk
                    </h1>
                </div>
            </div>
        )
    }

    return (
        <div
            id="content"
            className={"w-full flex flex-col grow my-auto px-6 lg:px-20"}
            style={{backgroundColor: "#1a202c"}}
        >
            <LoadingItemsModal />
            <div className={"flex flex-col lg:flex-row grow w-full justify-center lg:justify-start my-auto"}>
                <div className={"flex flex-col"}>
                    {title()}
                    <div className="pt-4 pb-1 text-2xl text-gray-100 leading-10 text-center lg:text-left">
                        <p>
                            The most convenient way to generate passive income
                        </p>
                        <p>
                            without locking in liquidity. Risk-adjusted for your favorite asset.
                        </p>
                    </div>
                    <div className={"flex flex-row mx-auto my-auto mt-5"}>
                        <Statistics/>
                    </div>
                </div>
                <div
                    className={"my-auto flex flex-row w-96 mx-auto lg:mx-0 lg:w-full justify-center lg:justify-end lg:ml-14"}>
                    <HeroForm/>
                </div>
            </div>
        </div>
    );

}
