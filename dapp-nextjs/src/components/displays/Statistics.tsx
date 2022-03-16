export default function Statistics() {

    const singleBox = (title: String, value: String) => {
        return (
            <div className={"m-5 lg:mt-0 lg:ml-0 rounded-lg border-2 border-gray-200 p-5 w-56 h-30"}>
                <h2 className="justify-center text-center lg:left-0 lg:bottom-0 mb-1 text-lg lg:text-2xl">
                    {value}
                </h2>
                <br />
                <h2 className="justify-center text-center lg:left-0 lg:top-0 mb-1 text-lg lg:text-xl text-gray-300">
                    {title}
                </h2>
            </div>
        )

    }

    const singleBoxDimmed = (title: String, value: String) => {
        return (
            <div className={"m-5 lg:mt-0 lg:ml-0 rounded-lg border-2 border-gray-600 p-5 w-56 h-30"}>
                <h2 className="justify-center text-center lg:left-0 lg:bottom-0 mb-1 text-lg lg:text-2xl text-gray-500">
                    {value}
                </h2>
                <br />
                <h2 className="justify-center text-center lg:left-0 lg:top-0 mb-1 text-lg lg:text-xl text-gray-500">
                    {title}
                </h2>
            </div>
        )

    }

    const emptyBox = () => {
        return (
            <div className={"invisible md:visible mx-5 lg:ml-0 rounded-lg px-5 w-48 h-30"}></div>
        )
    }

    return (
        <>
            <div className={"flex flex-col md:flex-row items-center lg:items-begin"}>
                {singleBoxDimmed("Total Value Locked", "Coming Soon")}
                {singleBoxDimmed("7 Day APY", "Coming Soon")}
                {emptyBox()}
            </div>
        </>
    )

}