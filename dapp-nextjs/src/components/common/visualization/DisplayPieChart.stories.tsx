import React from 'react';
import {ComponentStory, ComponentMeta} from '@storybook/react';
import DisplayPieChart from "./DisplayPieChart";
import {AllocData} from "../../../types/AllocData";
import {Protocol, ProtocolType} from "@qpools/sdk";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Visualization/Pie Chart',
    component: DisplayPieChart,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: {control: 'color'},
    },
} as ComponentMeta<typeof DisplayPieChart>;

/*
 * Some Example Data Structs
 */
let exampleData: Array<[string, AllocData]> = [
    [
        "marinade SOL",
        {
            lpIdentifier: "mSOL",  /// this is a key
            // Should include weights here
            weight: 5.5,
            protocol: Protocol.marinade,
            apy_24h: 6.4,
            // Should include the input token here
            // Can have multiple ones with the same pool, then
            pool: {
                id: "pool id",
                name: "pool name",
                protocol: Protocol.saber,
                protocolType: ProtocolType.Staking,
                lpToken: {
                    address: "DR24p77mSc9HDUjZjkwz9RDjSd7uQsziqtfKtdoBB6kR",
                    decimals: 6,
                    logoURI: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk.png",
                    name: "Marinade SOL",
                    symbol: "mSOL",
                },
                tokens: [{
                    address: "DR24p77mSc9HDUjZjkwz9RDjSd7uQsziqtfKtdoBB6kR",
                    decimals: 6,
                    logoURI: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk.png",
                    name: "Marinade SOL",
                    symbol: "mSOL",
                }]
            },
            usdcAmount: 10.3
        },
    ],
    [
      "Solend SOL",
      {
        lpIdentifier: "solend-SOL",  /// this is a key
        // Should include weights here
        weight: 10.5,
        protocol: Protocol.solend,
        apy_24h: 3.4,
        // Should include the input token here
        // Can have multiple ones with the same pool, then
        pool: {
          id: "pool id",
          name: "pool name",
          protocol: Protocol.saber,
          protocolType: ProtocolType.Staking,
          lpToken: {
            address: "DR24p77mSc9HDUjZjkwz9RDjSd7uQsziqtfKtdoBB6kR",
            decimals: 6,
            logoURI: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm.png",
            name: "Solend SOL",
            symbol: "solend SOL",
          },
          tokens: [{
            address: "DR24p77mSc9HDUjZjkwz9RDjSd7uQsziqtfKtdoBB6kR",
            decimals: 6,
            logoURI: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm.png",
            name: "Solend SOL",
            symbol: "solend SOL",
          }]
        },
        usdcAmount: 40.3
      },
    ]
]

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof DisplayPieChart> = (args) => <DisplayPieChart {...args} />;

export const WithPercentage = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithPercentage.args = {
    allocationInformation: new Map<string, AllocData>(exampleData),
    showPercentage: true
};

export const WithoutPercentage = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithoutPercentage.args = {
    allocationInformation: new Map<string, AllocData>(exampleData),
    showPercentage: false
};
