
export default function Statistics(props: any) {

    const singleBox = (title: String, value: String) => {

        return (
            <div className={"mr-5 mb-5 rounded-lg border-2 border-gray-200 p-5 w-56 h-30"}>
                <h2 className="left-0 top-0 mb-1 text-xl text-gray-300">
                    {title}
                </h2>
                <br />
                <h2 className="left-0 bottom-0 mb-1 text-xl">
                    {value}
                </h2>
            </div>
        )

    }

    return (
        <>
            <div className={"xl:flex"}>
                {singleBox("Total Value Locked", "$147.84M USD")}
                {singleBox("Total QTP Minted", "712.03 QTP")}
                {singleBox("7 Day APY", "8.02%")}
            </div>
        </>
    )

}