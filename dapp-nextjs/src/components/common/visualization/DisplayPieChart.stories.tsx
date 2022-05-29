import React from 'react';
import {ComponentStory, ComponentMeta} from '@storybook/react';
import DisplayPieChart from "./DisplayPieChart";
import {AllocData} from "../../../types/AllocData";
import {exampleAllocData} from "../../../utils/storybook/mock";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Visualization/Pie Chart',
    component: DisplayPieChart,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: {control: 'color'},
    },
} as ComponentMeta<typeof DisplayPieChart>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof DisplayPieChart> = (args) => <DisplayPieChart {...args} />;

export const WithPercentage = Template.bind({});

export const WithoutPercentage = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithoutPercentage.args = {
    allocationInformation: new Map<string, AllocData>(exampleAllocData),
    showPercentage: false
};

// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithPercentage.args = {
    allocationInformation: new Map<string, AllocData>(exampleAllocData),
    showPercentage: true
};
