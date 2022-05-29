import React, {useState} from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import CustomConnectWalletButton from "./CustomConnectWalletButton";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {Network} from "@saberhq/solana-contrib";
import SelectWallet from "./SelectWallet";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Buttons/SelectWallet',
    component: SelectWallet,
} as ComponentMeta<typeof SelectWallet>;

/*
 * Example Button story with React Hooks.
 * See note below related to this example.
 */
export const Example = () => {

    // Maybe add a button if the Modal is not enabled yet ...
    // Sets a click handler to change the label's value
    let defaultNetwork: Network = "devnet";

    return (
        <WalletKitProvider
            defaultNetwork={defaultNetwork}
            app={{name: "qPools with Goki"}}
        >
            <SelectWallet walletContext={null} />
        </WalletKitProvider>
    );

};

