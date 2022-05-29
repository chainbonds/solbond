import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import TableHeader from "./TableHeader";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Basic/Table Header',
  component: TableHeader,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof TableHeader>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TableHeader> = (args) => <TableHeader {...args} />;

export const Empty = Template.bind({
  columns: [],
});
Empty.args = {
  columns: [],
};

export const StringOnly = Template.bind({
  columns: ["APY", "Volatility"],
});
StringOnly.args = {
  columns: ["APY", "Volatility"],
};

export const NullOnly = Template.bind({
  columns: [null, null],
});
NullOnly.args = {
  columns: [null, null],
};

export const Mixed = Template.bind({
  columns: [null, "APY", null, "Volatility"],
});
Mixed.args = {
  columns: [null, "APY", null, "Volatility"],
};