import React, {FC} from "react";
import {Header} from "../../components/Header";
import {Footer} from "../../components/Footer";
import {Main} from "../../components/Main";
// @ts-ignore
import LoadingOverlay from "react-loading-overlay";
import {useLoad} from "../../contexts/LoadingContext";

export const HomeView: FC = ({}) => {

    const {loading} = useLoad();

    const devnetBanner = () => {
        return (
            <>
                <div className={"flex w-full bg-pink-400"}>
                    <div className={"mx-auto py-2 text-gray-900"}>
                        We are on devnet! TVL Values are made up! Send any inquiries to contact@qpools.finance
                    </div>
                </div>
            </>
        )
    };

    return (
        <>
            <LoadingOverlay
                active={loading}
                // spinner={<BounceLoader />}
                spinner={true}
                text="Loading..."
                styles={{
                    wrapper: {
                        overflow: loading ? 'hidden' : 'scroll'
                    }
                }}
            >
                <div
                    className="flex flex-col h-screen w-full w-screen text-white"
                    style={{ backgroundColor: "#0f172a" }}
                >
                    {/*{devnetBanner()}*/}
                    <Header />
                    <Main/>
                    <Footer/>
                </div>
            </LoadingOverlay>
        </>
    );
};
