import React, {BaseSyntheticEvent, ChangeEvent, useState} from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import {LandingPage} from "./LandingPage";
import {Network} from "@saberhq/solana-contrib";
import {getConnection} from "../../const";
import {Registry} from "../../../../../qPools-contract/qpools-sdk";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import SocialProofCard from "../cards/SocialProofCard";
import {Keypair} from "@solana/web3.js";
import {protocols, tokens} from "../../utils/storybook/mock";
import {WidgetPage} from "./WidgetPage";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Page/WidgetPage',
    component: WidgetPage,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' },
    },
} as ComponentMeta<typeof LandingPage>;

export const Default = () => {

    return (
        <WidgetPage />
    )
}