import React from "react";
import {Header} from "../../components/Header";
import {Footer} from "../../components/Footer";
import {Main} from "../../components/Main";
// @ts-ignore
import LoadingOverlay from "react-loading-overlay";
import {useLoad} from "../../contexts/LoadingContext";
import {BRAND_COLORS} from "../../const";
import * as qpools from "@qpools/sdk";

interface Props {
    registry: qpools.helperClasses.Registry
}
export const HomeView = ({registry}: Props) => {

    const {loading} = useLoad();


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
                    style={{ backgroundColor: BRAND_COLORS.slate900 }}
                >
                    <Header />
                    <Main registry={registry}/>
                    <Footer/>
                </div>
            </LoadingOverlay>
        </>
    );
};
