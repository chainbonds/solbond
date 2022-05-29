import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import {Footer} from "./Footer";
import {Header} from "./Header";
import {Head} from "next/document";
import {LocalKeypairProvider} from "../../contexts/LocalKeypairProvider";
import {ErrorMessageProvider} from "../../contexts/ErrorMessageContext";
import {ItemsLoadProvider} from "../../contexts/ItemsLoadingContext";
import {WalletKitProvider} from "@gokiprotocol/walletkit";
import {Network} from "@saberhq/solana-contrib";
import {getConnection} from "../../const";
import {Registry} from "../../../../../qPools-contract/qpools-sdk";
import {RpcProvider} from "../../contexts/RpcProvider";
import {CrankProvider} from "../../contexts/CrankProvider";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Sections/Header',
  component: Header,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Header>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default = () => {

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
                  <Header />
                </CrankProvider>
              </RpcProvider>
            </WalletKitProvider>
          </ItemsLoadProvider>
        </ErrorMessageProvider>
      </LocalKeypairProvider>

  )
}
