import React from 'react';
import {ComponentMeta} from '@storybook/react';
import Widget from "./Widget";
import {DisplayToken} from "../../types/DisplayToken";
import {DisplayProtocol} from "../../types/DisplayProtocol";
import Card from "./Card";
import CardSlider from "./CardSlider";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Views/CardSlider',
    component: CardSlider,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: {control: 'color'},
    },
} as ComponentMeta<typeof CardSlider>;

export const Empty = () => {

    return (
        <CardSlider
            cards={[]}
        />
    )

}

export const Default = () => {

    let token: DisplayToken = {
        name: "Solana",
        tokenSolscanLink: "https://solscan.io/token/So11111111111111111111111111111111111111112",
        tokenImageLink: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/So11111111111111111111111111111111111111112.png"
    };
    let protocols: DisplayProtocol[] = [
        {
            name: "Bitcoin",
            protocolSolscanLink: "https://solscan.io/token/3os2M3bX9qta154PRbU9rzaPUYAKAqVpaMMS8u2hoUQu",
            protocolImageLink: "https://bitcoin.org/img/icons/opengraph.png?1652976465"
        },
        {
            name: "Solend",
            protocolSolscanLink: "https://solscan.io/token/5h6ssFpeDeRbzsEHDbTQNH7nVGgsKrZydxdSTnLm6QdV",
            protocolImageLink: "https://styles.redditmedia.com/t5_4lbiz1/styles/communityIcon_sx32xpc658971.png?width=256&s=b5b066c0f10ca1dc82351df5726e809ba52da2c2"
        }
    ];

    // Create a couple card elements here
    const cardExample1 = () => {
        return (<Card
            apy={"2.5%"}
            token={token}
            protocols={protocols}
            onClickPrimary={() => {
                console.log("Clicked on review")
            }}
            onClickRemoveToken={() => {
                console.log("onClickRemoveToken")
            }}
            onClickRemoveProtocol={() => {
                console.log("onClickRemoveProtocol")
            }}
        />)
    }
    const cardExample2 = () => {
        return (<Card
            apy={"5.5%"}
            token={token}
            protocols={protocols}
            onClickPrimary={() => {
                console.log("Clicked on review")
            }}
            onClickRemoveToken={() => {
                console.log("onClickRemoveToken")
            }}
            onClickRemoveProtocol={() => {
                console.log("onClickRemoveProtocol")
            }}
        />)
    }
    const cards = [cardExample1(), cardExample2()];

    return (
        <CardSlider
            cards={cards}
        />
    )

}
