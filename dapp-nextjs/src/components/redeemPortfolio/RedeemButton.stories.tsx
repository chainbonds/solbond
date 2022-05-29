import React from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import {RedeemPortfolioButton} from "./RedeemPortfolioButton";
import {Network} from "@saberhq/solana-contrib";
import {getConnection} from "../../const";
import {Registry} from "@qpools/sdk";
import {LocalKeypairProvider} from "../../contexts/LocalKeypairProvider";
import {ErrorMessageProvider} from "../../contexts/ErrorMessageContext";
import {ItemsLoadProvider} from "../../contexts/ItemsLoadingContext";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {RpcProvider} from "../../contexts/RpcProvider";
import {CrankProvider} from "../../contexts/CrankProvider";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Buttons/Redeem',
    component: RedeemPortfolioButton,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: {control: 'color'},
    },
} as ComponentMeta<typeof RedeemPortfolioButton>;

const Template: ComponentStory<typeof RedeemPortfolioButton> = (args) => {

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
                                <RedeemPortfolioButton {...args} />
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
