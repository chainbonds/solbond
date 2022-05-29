import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import RowInList from "./RowInList";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Basic/Row In List',
  component: RowInList,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof RowInList>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof RowInList> = (args) => <RowInList {...args} />;

export const Empty = Template.bind({
  text: "",
});
Empty.args = {
  text: "",
};

export const Example = Template.bind({
  text: "APY",
});
Example.args = {
  text: "APY"
}