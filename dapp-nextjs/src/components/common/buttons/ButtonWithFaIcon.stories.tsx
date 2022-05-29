import React from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import {ButtonWithFaIcon} from "./ButtonWithFaIcon";
import {FaAtom, FaFaucet} from "react-icons/fa";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Buttons/FaIcon',
  component: ButtonWithFaIcon,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof ButtonWithFaIcon>;

const Template: ComponentStory<typeof ButtonWithFaIcon> = (args) => <ButtonWithFaIcon {...args} />;

export const Faucet = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Faucet.args = {
  icon: (() => {return <FaFaucet />}),
  text: "FAUCET",
  onClick: () => {console.log("Click")}
};

export const Atom = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Atom.args = {
  icon: (() => {return <FaAtom />}),
  text: "Atom",
  onClick: () => {console.log("Click")}
};

export const DisabledAtom = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
DisabledAtom.args = {
  icon: (() => {return <FaAtom />}),
  text: "Atom",
  onClick: () => {console.log("Click")},
  activated: false
};
