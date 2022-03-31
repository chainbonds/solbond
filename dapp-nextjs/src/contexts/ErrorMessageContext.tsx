import React, {useState, useContext, useEffect} from 'react';

export interface IErrorMessage {
    errorMessages: Map<string, ErrorMessage>,
    addErrorMessage: any,
    addWarningMessage: any,
    removeMessage: any
}

const defaultValue: IErrorMessage = {
    errorMessages: new Map(),
    addErrorMessage: () => console.error("attempting to use AuthContext outside of a valid provider"),
    addWarningMessage: () => console.error("attempting to use AuthContext outside of a valid provider"),
    removeMessage: () => console.error("attempting to use AuthContext outside of a valid provider"),
}

const ErrorMessageContext = React.createContext<IErrorMessage>(defaultValue);

export function useErrorMessage() {
    return useContext(ErrorMessageContext);
}

export interface ErrorMessage {
    title: string,
    subtitle: string
    message: string
}

export function ErrorMessageProvider(props: any) {

    const [errorMessages, setErrorMessages] = useState<Map<string, ErrorMessage>>(new Map<string, ErrorMessage>());

    const addWarningMessage = (messageId: string, description: string, detailedMessage: string) => {
        setErrorMessages((oldErrorMessages: Map<string, ErrorMessage>) => {
            let updatedMap = new Map<string, ErrorMessage>(oldErrorMessages);
            let errorMessage: ErrorMessage = {
                title: "🤷‍♂️  Warning  🤷‍♂️",
                subtitle: description,
                message: detailedMessage
            }
            updatedMap.set(messageId, errorMessage);
            return updatedMap;
        });
    }

    const addErrorMessage = (messageId: string, description: string, message: string) => {
        setErrorMessages((oldErrorMessages: Map<string, ErrorMessage>) => {
            let updatedMap = new Map<string, ErrorMessage>(oldErrorMessages);
            let errorMessage: ErrorMessage = {
                title: "🤷‍♂️  Error  🤷‍♂️",
                subtitle: description,
                message: message
            }
            updatedMap.set(messageId, errorMessage);
            return updatedMap;
        });
    }

    const removeMessage = (messageId: string) => {
        setErrorMessages((oldErrorMessages: Map<string, ErrorMessage>) => {
            let updatedMap = new Map<string, ErrorMessage>(oldErrorMessages);
            updatedMap.delete(messageId);
            return updatedMap;
        })
    }

    const value: IErrorMessage = {
        errorMessages,
        addErrorMessage,
        addWarningMessage,
        removeMessage
    };

    return (
        <>
            <ErrorMessageContext.Provider value={value}>
                {props.children}
            </ErrorMessageContext.Provider>
        </>
    );

}