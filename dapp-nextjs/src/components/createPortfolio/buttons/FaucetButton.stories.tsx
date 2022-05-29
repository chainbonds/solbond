import React from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import {FaucetButton} from "./FaucetButton";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Buttons/Faucet',
  component: FaucetButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof FaucetButton>;

const Template: ComponentStory<typeof FaucetButton> = (args) => <FaucetButton {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  activated: true
};
