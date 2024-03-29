import React, {FC} from "react";

export const LogoWithTitle: FC = ({}) => {

    return (
        <div className={"flex flex-row"}>
            <svg width="94" height="59" viewBox="0 0 287 218" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15.9251" y="131.362" width="160.413" height="89.7648" rx="28"
                      transform="rotate(-39.4745 15.9251 131.362)" stroke="#FF3CD4" strokeWidth="14"/>
                <rect x="14.855" y="118.406" width="160.413" height="89.7648" rx="28"
                      transform="rotate(-39.4745 14.855 118.406)" stroke="white" strokeWidth="14"/>
                <rect x="90.5575" y="131.294" width="160.413" height="89.7648" rx="28"
                      transform="rotate(-39.4745 90.5575 131.294)" stroke="#FF3CD4" strokeWidth="14"/>
                <rect x="89.4873" y="118.338" width="160.413" height="89.7648" rx="28"
                      transform="rotate(-39.4745 89.4873 118.338)" stroke="white" strokeWidth="14"/>
                <rect x="177.292" y="52.1972" width="13.3387" height="14.0282"
                      transform="rotate(51.6441 177.292 52.1972)" fill="white"/>
                <rect x="158.018" y="50.905" width="16.6419" height="7.38514" transform="rotate(50.5467 158.018 50.905)"
                      fill="#FF3CD4"/>
            </svg>
            <h1 className="text-3xl font-bold my-auto">
                qPools
            </h1>
        </div>
    );

};
