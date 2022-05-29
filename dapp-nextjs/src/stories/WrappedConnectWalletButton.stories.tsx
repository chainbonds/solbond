import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import SelectWallet from "../components/createPortfolio/buttons/SelectWallet";


// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/WrappedConnectWalletButton',
  component: SelectWallet,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof SelectWallet>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SelectWallet> = (args) => <SelectWallet {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  walletContext: null,
};
