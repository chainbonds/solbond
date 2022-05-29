import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import CustomConnectWalletButton from "../components/common/CustomConnectWalletButton";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ConnectWalletButton',
  component: CustomConnectWalletButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof CustomConnectWalletButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof CustomConnectWalletButton> = (args) => <CustomConnectWalletButton {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {};
