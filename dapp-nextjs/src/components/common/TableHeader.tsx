import React from "react";

interface Props {
    columns: (string | null)[]
}

/**
 * If the to the column is null, it creates the column, without assigning a string to it
 * @param columns
 * @constructor
 */
export default function TableHeader({columns}: Props) {

    return (
        <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
            {
                columns.map((x: (string | null)) => {
                    if (x) {
                        return (
                            <th scope="col"
                                key={Math.random()}
                                className="py-3 px-6 mx-auto text-xs text-center font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400">
                                {x}
                            </th>
                        )
                    } else {
                        return (
                            <th scope="col"
                                key={Math.random()}
                                className="relative py-3 px-6">
                                <span className="sr-only">Edit</span>
                            </th>
                        )
                    }
                })
            }
        </tr>
        </thead>
    )

}