import React from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import {LocalKeypairProvider} from "../../../contexts/LocalKeypairProvider";
import {ErrorMessageProvider} from "../../../contexts/ErrorMessageContext";
import {ItemsLoadProvider} from "../../../contexts/ItemsLoadingContext";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {Network} from "@saberhq/solana-contrib";
import {RpcProvider} from "../../../contexts/RpcProvider";
import {CrankProvider} from "../../../contexts/CrankProvider";
import {getConnection} from "../../../const";
import {Registry} from "../../../../../../qPools-contract/qpools-sdk";
import {RunDepositCrankButton} from "./RunDepositCrankButton";
import {RunWithdrawCrankButton} from "./RunWithdrawCrankButton";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Buttons/Withdraw Crank',
    component: RunWithdrawCrankButton,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: {control: 'color'},
    },
} as ComponentMeta<typeof RunWithdrawCrankButton>;

const Template: ComponentStory<typeof RunWithdrawCrankButton> = (args) => {

    let defaultNetwork: Network = "devnet";
    const connection = getConnection();
    const registry = new Registry(connection);

    return (
        <LocalKeypairProvider>
            <ErrorMessageProvider>
                <ItemsLoadProvider>
                    <WalletKitProvider
                        defaultNetwork={defaultNetwork}
                        app={{name: "qPools with Goki"}}
                    >
                        <RpcProvider registry={registry}>
                            <CrankProvider>
                                <RunDepositCrankButton {...args} />
                            </CrankProvider>
                        </RpcProvider>
                    </WalletKitProvider>
                </ItemsLoadProvider>
            </ErrorMessageProvider>
        </LocalKeypairProvider>
    );
}

export const Empty = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Empty.args = {};
