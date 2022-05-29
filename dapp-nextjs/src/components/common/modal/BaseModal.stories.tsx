import React, {useState} from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import BaseModal from "./BaseModal";
import {FaucetButton} from "../../createPortfolio/buttons/FaucetButton";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Modals/Base Modal',
  component: BaseModal,
} as ComponentMeta<typeof BaseModal>;

/*
 * Example Button story with React Hooks.
 * See note below related to this example.
 */
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof BaseModal> = (args) => <BaseModal {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: "Example Title",
  body: () => {
    return (
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    )
  },
  footer: () => {
    return (
        <>
          <div className={"mx-auto mr-5"}>
                <FaucetButton activated={true} />
              </div>
          <div className={"mx-auto ml-5"}>
            <button
                className="border border-gray-500 text-white font-bold py-3 px-7 rounded "
                onClick={() => {console.log("Secondary Button")}}
            >
              Stay poor
            </button>
          </div>
        </>
    )
  },
  showModal: true,
  onClose: () => {console.log("Trying to Close")}
};

