import React, {useState} from 'react';
import {ComponentStory, ComponentMeta} from '@storybook/react';
import LoadingItemsModal from "./LoadingItemsModal";
import {ItemsLoadProvider} from "../../../contexts/ItemsLoadingContext";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Modals/Loading items',
    component: LoadingItemsModal,
} as ComponentMeta<typeof LoadingItemsModal>;

/*
 * Example Button story with React Hooks.
 * See note below related to this example.
 */
export const Example = () => {

    // Maybe add a button if the Modal is not enabled yet ...
    // Sets a click handler to change the label's value
    return (
        <ItemsLoadProvider>
            <LoadingItemsModal/>
        </ItemsLoadProvider>
    );

};

