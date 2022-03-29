import React, {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import {ErrorMessage, useErrorMessage} from "../../contexts/ErrorMessageContext";

/**
 * Similar to the loading modal, we can also have an error modal.
 * We can just display the errors one-by-one, create a new modal for each new Error
 * Also allow the user to go back when the error is displayed
 * @constructor
 */
export default function ErrorMessageModal() {

    const errorMessage = useErrorMessage();
    // const [showModal, setShowModal] = useState<boolean>(false);
    // const [messageToShow, setMessageToShow] = useState<ErrorMessage>({title: "", message: ""});

    useEffect(() => {
        console.log("All Error Messages are: ", errorMessage.errorMessages);
        // setShowModal((_: boolean) => {
        //     return (errorMessage.errorMessages.size > 0);
        // });
        // setMessageToShow((_: ErrorMessage) => {
        //     if (errorMessage.errorMessages.size > 0) {
        //         // Pick the latest one ... Or the one that is latest ...
        //         // return (errorMessage)
        //         let currentError = errorMessage.errorMessages.entries().next().value;
        //         console.log("Displaying current error: ", currentError);
        //         return currentError;
        //     } else {
        //         return {title: "", message: ""};
        //     }
        // })
    }, [errorMessage.errorMessages]);

    const singleErrorMessage = (errorMessage: ErrorMessage) => {
        return (
            <div className="p-5">
                <div>
                    <div className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-md text-red-100 bg-red-700 border border-red-700 ">
                        <div slot="avatar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round" className="feather feather-alert-octagon w-5 h-5 mx-2">
                                <polygon
                                    points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div className="text-xl font-normal  max-w-full flex-initial">
                            <div className="py-2">
                                {errorMessage.title}
                                {/*This is a success messsage*/}
                                <div className="text-sm font-base">
                                    <p>
                                        {errorMessage.subtitle}
                                    </p>
                                    <p>
                                        {errorMessage.message}
                                    </p>
                                    <p>
                                        Please share this error on our Twitter or Discord.
                                        If the error is non-trivial, we will show you a token of gratitude in the near future :)
                                        Including the console log is always helpful!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-auto flex-row-reverse">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     stroke-linejoin="round"
                                     className="feather feather-x cursor-pointer hover:text-green-400 rounded-full w-5 h-5 ml-2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {errorMessage.errorMessages && Array.from(errorMessage.errorMessages.entries()).map(([key, value]) => {
                return singleErrorMessage(value);
            })}

            {/*<Transition.Root appear show={showModal} as={Fragment}>*/}
            {/*    <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => {*/}
            {/*    }}>*/}
            {/*        <Transition.Child*/}
            {/*            as={Fragment}*/}
            {/*            enter="ease-out duration-300"*/}
            {/*            enterFrom="opacity-0"*/}
            {/*            enterTo="opacity-100"*/}
            {/*            leave="ease-in duration-200"*/}
            {/*            leaveFrom="opacity-100"*/}
            {/*            leaveTo="opacity-0"*/}
            {/*        >*/}
            {/*            <Dialog.Overlay className="fixed inset-0 bg-black opacity-40"/>*/}
            {/*        </Transition.Child>*/}
            {/*        <Transition.Child*/}
            {/*            as={Fragment}*/}
            {/*            enter="ease-out duration-300"*/}
            {/*            enterFrom="opacity-0 scale-50"*/}
            {/*            enterTo="opacity-100 scale-100"*/}
            {/*            leave="ease-in duration-100"*/}
            {/*            leaveFrom="opacity-50 scale-100"*/}
            {/*            leaveTo="opacity-100 scale-50"*/}
            {/*        >*/}
            {/*            <div className={"mt-52"}>*/}
            {/*                <div*/}
            {/*                    className="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all shadow sm:my-2 sm:max-w-md sm:align-middle sm:w-full mx-auto px-auto justify-center">*/}
            {/*                    <div className={"flex flex-col w-full"}>*/}
            {/*                        <div className={"flex flex-col justify-start"}>*/}
            {/*                            <Dialog.Title*/}
            {/*                                as="h3"*/}
            {/*                                className="flex items-center justify-center w-full h-full text-gray-300 text-2xl font-medium my-6"*/}
            {/*                            >*/}
            {/*                                🤷‍♂️  Error  🤷‍♂️*/}
            {/*                                /!* Something didn't go as planned ... *!/*/}
            {/*                            </Dialog.Title>*/}
            {/*                            <div*/}
            {/*                                className="flex items-center justify-center w-full h-full border-t border-gray-700">*/}
            {/*                                <div*/}
            {/*                                    className="flex flex-col rounded-lg max-w-2xl text-center content-center my-3">*/}
            {/*                                    <div className={"mx-auto mb-5"}>*/}
            {/*                                        <>*/}
            {/*                                            /!* modify the text-size based on the type of error ... *!/*/}
            {/*                                            <div className={"flex flex-row my-3 justify-start text-2xl"}>*/}
            {/*                                                <div className={"flex pl-4 text-gray-300"}>*/}
            {/*                                                    {messageToShow}*/}
            {/*                                                </div>*/}
            {/*                                            </div>*/}
            {/*                                        </>*/}
            {/*                                    </div>*/}
            {/*                                    <p className={"flex flex-col text-gray-500"}>*/}
            {/*                                        /!*It would be great if you could share this with us on Discord or Twitter.*!/*/}
            {/*                                        Please share this error on our Twitter or Discord.*/}
            {/*                                        If the error is non-trivial, we will keep track of who reported this error first and put out rewards in the near future.*/}
            {/*                                        Including the console log is always helpful!*/}
            {/*                                    </p>*/}
            {/*                                </div>*/}
            {/*                            </div>*/}
            {/*                            <div*/}
            {/*                                className="flex flex-row w-full py-5 mx-auto justify-start border-t border-gray-700 px-20 mx-auto">*/}
            {/*                                    <>*/}
            {/*                                        <button*/}
            {/*                                            type="button"*/}
            {/*                                            className="flex flex-row justify-center w-full px-10 py-2 text-sm font-medium text-gray-900 bg-blue-100 border border-transparent w-full rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"*/}
            {/*                                            onClick={() => {*/}
            {/*                                                // Should we also double-check this one (?)*/}
            {/*                                                errorMessage.removeMessage(messageToShow);*/}
            {/*                                            }}*/}
            {/*                                        >*/}
            {/*                                            OK*/}
            {/*                                        </button>*/}
            {/*                                    </>*/}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </Transition.Child>*/}
            {/*    </Dialog>*/}
            {/*</Transition.Root>*/}

        </>
    );
}
