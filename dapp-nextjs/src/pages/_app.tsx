import React from "react";
import type {AppProps} from "next/app";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "../styles/App.css";
import {LoadProvider} from "../contexts/LoadingContext";

function MyApp({Component, pageProps}: AppProps) {

    return (
        <>
            <LoadProvider>
                <Component {...pageProps} />
            </LoadProvider>
        </>
    );
}

export default MyApp;
