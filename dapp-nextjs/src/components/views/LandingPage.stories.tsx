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

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Page/LandingPage',
    component: LandingPage,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' },
    },
} as ComponentMeta<typeof LandingPage>;

export const Default = () => {

    let defaultNetwork: Network = "devnet";
    const connection = getConnection();


    let socialProofCards = [
        <SocialProofCard
            publicKey={Keypair.generate().publicKey}
            apy={"6.5%"}
            tokens={tokens.slice(0, 2)}
            protocols={protocols.slice(0, 1)}
        />,
        <SocialProofCard
            publicKey={Keypair.generate().publicKey}
            apy={"12.5%"}
            tokens={tokens.slice(0, 2)}
            protocols={protocols.slice(0, 2)}
        />,
        <SocialProofCard
            publicKey={Keypair.generate().publicKey}
            apy={"32.5%"}
            tokens={tokens.slice(1, 3)}
            protocols={protocols.slice(1, 3)}
        />,
        <SocialProofCard
            publicKey={Keypair.generate().publicKey}
            apy={"62.5%"}
            tokens={tokens.slice(0, 1)}
            protocols={protocols.slice(0, 4)}
        />,
        <SocialProofCard
            publicKey={Keypair.generate().publicKey}
            apy={"2.5%"}
            tokens={tokens.slice(2,3)}
            protocols={protocols.slice(2,3)}
        />,
        <SocialProofCard
            publicKey={Keypair.generate().publicKey}
            apy={"4.5%"}
            tokens={tokens.slice(3, 4)}
            protocols={protocols.slice(3, 4)}
        />,
        <SocialProofCard
            publicKey={Keypair.generate().publicKey}
            apy={"10.5%"}
            tokens={tokens.slice(4, 5)}
            protocols={protocols.slice(4, 5)}
        />,
        <SocialProofCard
            publicKey={Keypair.generate().publicKey}
            apy={"6.5%"}
            tokens={tokens.slice(0, 2)}
            protocols={protocols.slice(0, 2)}
        />,
    ]

    return (
        <div className={"w-screen h-full m-0 p-0"}>
            <WalletKitProvider
                defaultNetwork={defaultNetwork}
                app={{name: "qPools"}}
            >
                <LandingPage socialProofCards={socialProofCards} />
            </WalletKitProvider>
        </div>
    )
}