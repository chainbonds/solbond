import React from "react";
import {Header} from "../sections/Header";
import SelectWallet from "../common/buttons/SelectWallet";
import {BRAND_COLORS} from "../../const";
import {CarouselProvider, Slider, Slide, ButtonBack, ButtonNext} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import Widget from "../cards/Widget";
import {protocols, tokens} from "../../utils/storybook/mock";
import {Footer} from "../sections/Footer";

interface Props {
}

export const WidgetPage = ({}: Props) => {


    return (
        <div
            className={"flex flex-col h-screen w-screen max-h-screen max-w-screen overflow-hidden overscroll-contain my-auto"}
            style={{backgroundColor: BRAND_COLORS.slate900}}
        >
            <div className={""}>
                <Header showConnectWallet={false} showFaucet={true}/>
            </div>
            <div className={"flex h-full justify-center"}>
                <div className={"mt-20"}>
                    <Widget
                        apy={"5.5%"}
                        tokens={tokens}
                        protocols={protocols}
                        onClickPrimary={() => {console.log("Click")}}
                        onClickRemoveToken={() => {console.log("Click")}}
                        onClickRemoveProtocol={() => {console.log("Click")}}
                    />
                </div>
            </div>
            <div className={"flex justify-end"}>
                <Footer />
            </div>
        </div>
    )
}