import React, {BaseSyntheticEvent, ChangeEvent, useState} from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import TokenIcon from "./TokenIcon";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Basic/TokenIcon',
    component: TokenIcon,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' },
    },
} as ComponentMeta<typeof TokenIcon>;

const Template: ComponentStory<typeof TokenIcon> = (args) => <TokenIcon {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
    logoUri: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm.png",
    name: "Socean SOL"
};