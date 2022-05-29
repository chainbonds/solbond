import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import UserInfoBalance from "./UserInfoBalance";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Basic/User Balance Info',
  component: UserInfoBalance,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof UserInfoBalance>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof UserInfoBalance> = (args) => <UserInfoBalance {...args} />;

export const Empty = Template.bind({
  currencyName: "",
  currencyBalance: null
});
Empty.args = {
  currencyName: "",
  currencyBalance: null
};

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const Example = Template.bind({
  currencyName: "",
  currencyBalance: 502.1
});
Example.args = {
  currencyName: "",
  currencyBalance: 502.1
};
