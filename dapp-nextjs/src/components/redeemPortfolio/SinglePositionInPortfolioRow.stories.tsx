import React from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {Network} from "@saberhq/solana-contrib";
import SinglePositionInPortfolioRow from "./SinglePositionInPortfolioRow";
import {getConnection} from "../../const";
import {Registry} from "@qpools/sdk";
import {LocalKeypairProvider} from "../../contexts/LocalKeypairProvider";
import {ErrorMessageProvider} from "../../contexts/ErrorMessageContext";
import {ItemsLoadProvider} from "../../contexts/ItemsLoadingContext";
import {RpcProvider} from "../../contexts/RpcProvider";
import {CrankProvider} from "../../contexts/CrankProvider";
import {PublicKey} from "@solana/web3.js";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Table/Single Position',
    component: SinglePositionInPortfolioRow,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: {control: 'color'},
    },
} as ComponentMeta<typeof SinglePositionInPortfolioRow>;

const Template: ComponentStory<typeof SinglePositionInPortfolioRow> = (args) => {

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
                                <SinglePositionInPortfolioRow {...args} />
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
Empty.args = {
    address: new PublicKey("DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"),
    value: 100.3,
    initialValue: 58.2,
};
