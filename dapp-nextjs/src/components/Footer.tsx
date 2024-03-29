import React, {FC} from "react";
import {SocialIcon} from 'react-social-icons';
import {BRAND_COLORS} from "../const";

export const Footer: FC = ({}) => {

    return (
        <>
            <div
                className="w-full flex flex-row justify-center lg:justify-end py-10 lg:px-20 mt-auto"
                style={{ backgroundColor: BRAND_COLORS.slate900 }}
                // style={{backgroundColor: "#1a202c"}}
            >
                <SocialIcon
                    url={"https://discord.gg/ThFgTPs6t3"}
                    className={"mr-5"}
                />
                <SocialIcon
                    url={"https://twitter.com/qpoolsfinance"}
                    className={"mx-5"}
                />
                <SocialIcon
                    url={"/whitepaper.pdf"}
                    className={"ml-5"}
                    bgColor="#ff5a01"
                />
            </div>
        </>
    );

}
