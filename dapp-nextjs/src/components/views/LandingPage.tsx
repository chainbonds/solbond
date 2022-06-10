import React from "react";
import {Header} from "../sections/Header";
import SelectWallet from "../common/buttons/SelectWallet";
import {BRAND_COLORS} from "../../const";
import {CarouselProvider, Slider, Slide, ButtonBack, ButtonNext} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import {Footer} from "../sections/Footer";

interface Props {
    socialProofCards: JSX.Element[]
}

export const LandingPage = ({socialProofCards}: Props) => {


    return (
        <div
            className={"flex flex-col h-screen w-screen max-h-screen max-w-screen overflow-x-hidden overscroll-x-contain"}
            style={{backgroundColor: BRAND_COLORS.slate900}}
        >
            <div className={"flex"}>
                <Header showConnectWallet={false} showFaucet={false}/>
            </div>
            <div className={"flex flex-col text-center h-full justify-center"}>
                <h1 className={"text-4xl font-light"}>
                    {/*How much could you earn?*/}
                    {/*Where can you earn more tokens?*/}
                    You could be earning tokens right now!
                </h1>
                <h2 className={"mt-5 mb-10 text-3xl font-light"}>
                    Connect your wallet to see where
                </h2>
                {/*<div className={"max-h-screen mx-auto mt-5 flex flex-row text-2xl opacity-25 overflow-hidden"}>*/}
                {/*</div>*/}

                {/*className={"mx-auto"}*/}
                <div className={"mx-auto max-w-6xl"}>
                    <CarouselProvider
                        infinite={true}
                        naturalSlideWidth={300}
                        naturalSlideHeight={200}
                        totalSlides={socialProofCards.length}
                        isPlaying={true}
                        // interval={2000}
                        // step={1}
                        visibleSlides={Math.min(socialProofCards.length, 3)}
                        isIntrinsicHeight={true}
                    >
                        <Slider>
                            {socialProofCards.map((x: JSX.Element, idx: number) => {
                                return (
                                    <Slide index={idx}>
                                        <div className={"mx-2 w-full"}>
                                            {x}
                                        </div>
                                    </Slide>
                                )
                            })}
                        </Slider>
                    </CarouselProvider>
                </div>

                <div className={"mx-auto mt-10 text-2xl font-light"}>
                    <SelectWallet walletContext={null}/>
                </div>
            </div>
            <div className={"flex justify-end"}>
                <Footer />
            </div>
        </div>
    )
}