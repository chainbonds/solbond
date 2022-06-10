import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import SocialProofCard from "./SocialProofCard";
import {DisplayToken} from "../../types/DisplayToken";
import {DisplayProtocol} from "../../types/DisplayProtocol";
import {Keypair} from "@solana/web3.js";
import {protocols, tokens} from "../../utils/storybook/mock";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Views/SocialProofCard',
    component: SocialProofCard,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' },
    },
} as ComponentMeta<typeof SocialProofCard>;

// export const Empty = () => {
//
//     return (
//         <SocialProofCard
//             apy={"5.2%"}
//             tokens={[]}
//             protocols={[]}
//             onClickPrimary={() => {console.log("onClickPrimary")}}
//             onClickRemoveToken={() => {console.log("onClickRemoveToken")}}
//             onClickRemoveProtocol={() => {console.log("onClickRemoveProtocol")}}
//         />
//     )
//
// }

export const Default = () => {

    let publicKey = Keypair.generate().publicKey;
    let apy = "5.5%";

    return (
        <SocialProofCard
            publicKey={publicKey}
            apy={apy}
            tokens={tokens}
            protocols={protocols}
        />
    )

}
