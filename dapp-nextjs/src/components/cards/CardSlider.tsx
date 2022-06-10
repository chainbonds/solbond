import {useEffect, useState} from 'react'
import { Tab } from '@headlessui/react'
import {FaArrowCircleLeft, FaArrowCircleRight} from "react-icons/fa";

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

// export default function CardSlider(props: Props) {
//
//     const [selectedIndex, setSelectedIndex] = useState(0);
//
//     return (
//         <>
//             <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
//                 <Tab.List>
//                     <Tab>Tab 1</Tab>
//                     <Tab>Tab 2</Tab>
//                     <Tab>Tab 3</Tab>
//                 </Tab.List>
//                 <Tab.Panels>
//                     <Tab.Panel>Content 1</Tab.Panel>
//                     <Tab.Panel>Content 2</Tab.Panel>
//                     <Tab.Panel>Content 3</Tab.Panel>
//                 </Tab.Panels>
//             </Tab.Group>
//
//             {/*Hello*/}
//             {/*{props.cards.map((x: JSX.Element) => x)}*/}
//         </>
//     )
// }

interface Props {
    cards: JSX.Element[]
}
export default function CardSlider(props: Props) {

    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        console.log("Selected Index is: ", selectedIndex);
    }, [selectedIndex]);

    return (
        <div className={"flex flex-row"}>
            <div
                className={"my-auto m-10 cursor-pointer"}
                onClick={() => setSelectedIndex((prev) => (prev - 1) % props.cards.length)}
            >
                <FaArrowCircleLeft size={48} />
            </div>
            <div className="w-full w-5/6 max-w-sm sm:px-0">
                <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                        {props.cards.map((card: JSX.Element, idx: number) => (
                            <Tab
                                key={idx}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                        selected
                                            ? 'bg-white shadow'
                                            : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                                    )
                                }
                            >
                                Strategy {idx}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                        {props.cards.map((card: JSX.Element, idx: number) => (
                            <Tab.Panel
                                key={idx}
                                className={classNames(
                                    'rounded-xl bg-white py-3',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                                )}
                            >
                                {card}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
            <div
                className={"my-auto m-10 cursor-pointer"}
                onClick={() => setSelectedIndex((prev) => (prev + 1) % props.cards.length)}
            >
                <FaArrowCircleRight size={48} />
            </div>
        </div>
    )
}