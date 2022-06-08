import React, {BaseSyntheticEvent, ChangeEvent, useState} from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import TokenValueInputField from "./TokenValueInputField";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Inputs/TokenValue',
    component: TokenValueInputField,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' },
    },
} as ComponentMeta<typeof TokenValueInputField>;

const Template: ComponentStory<typeof TokenValueInputField> = (args) => <TokenValueInputField {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
    min: 0.,
    max: 100.,
    value: 34.,
    onChange: (arg0) => {console.log("NewValue"); console.log(arg0)},  // Some function, takes in an event as input
    logoPath: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm.png",
    name: "Socean SOL",
    loading: false,
    errorMessage: "",
    totalBalance: "23.44",
    maxBalance: "432.12",
};

export const Variable = () => {
    const [value, setValue] = useState<number>(34.);

    const modifyValue = (event: ChangeEvent<HTMLInputElement>) => {
        let newNumber = Number(event.target.value);
        console.log("New Number is: ", newNumber);
        setValue(newNumber);
    }

    return (
        <TokenValueInputField
            min={0.}
            max={100.}
            value={value}
            onChange={modifyValue}
            logoPath={"https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm.png"}
            name={"Socean SOL"}
            loading={false}
            errorMessage={""}
            totalBalance={value.toFixed(2)}
            maxBalance={"432.12"}
        />
    )
}