import React from "react";
import {ErrorMessage, useErrorMessage} from "../../contexts/ErrorMessageContext";

/**
 * Similar to the loading modal, we can also have an error modal.
 * We can just display the errors one-by-one, create a new modal for each new Error
 * Also allow the user to go back when the error is displayed
 * @constructor
 */
export default function ErrorMessageModal() {

    const errorMessage = useErrorMessage();

    const singleErrorMessage = (errorMessage: ErrorMessage) => {
        return (
            <div className="p-5">
                <div>
                    <div className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-md text-red-100 bg-red-700 border border-red-700 ">
                        <div slot="avatar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="feather feather-alert-octagon w-5 h-5 mx-2">
                                <polygon
                                    points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
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
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round"
                                     className="feather feather-x cursor-pointer hover:text-green-400 rounded-full w-5 h-5 ml-2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
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
        </>
    );
}
