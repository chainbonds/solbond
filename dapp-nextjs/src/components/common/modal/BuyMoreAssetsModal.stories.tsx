import React, {useState} from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import BuyMoreAssetsModal from "./BuyMoreAssetsModal";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Modals/Buy More Assets',
  component: BuyMoreAssetsModal,
} as ComponentMeta<typeof BuyMoreAssetsModal>;

/*
 * Example Button story with React Hooks.
 * See note below related to this example.
 */
export const Example = () => {
  // Sets the hooks for both the label and primary props
  const [showModal, setShowModal] = useState<boolean>(true);

  const onClose = () => {
    // setShowModal(false);
  }

  // Maybe add a button if the Modal is not enabled yet ...
  // Sets a click handler to change the label's value
  return <BuyMoreAssetsModal
      showModal={showModal}
      setShowModal={setShowModal}
      onClose={onClose}
  />;

};

