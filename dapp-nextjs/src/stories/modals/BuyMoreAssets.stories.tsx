import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import BuyMoreAssetsModal from "../../components/common/BuyMoreAssetsModal";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Modals/Buy More Assets',
  component: BuyMoreAssetsModal,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  // argTypes: {
  //   showModal: boolean("showModal", true),
  //   setShowModal: () => {},
  //   onClose: () => {}
  //
  // },
} as ComponentMeta<typeof BuyMoreAssetsModal>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof BuyMoreAssetsModal> = (args) => <BuyMoreAssetsModal {...args} />;

export const Default = Template.bind({
  showModal: true,
  setShowModal: (x: boolean) => {},
  onClose: () => {}
});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  showModal: true,
  setShowModal: (x: boolean) => {},
  onClose: () => {}
};
