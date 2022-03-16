export default function CallToActionButton(props: any) {

    // Also add a tailwind style for when the button is selected ...
    return (
        <>
            <div className="flex w-full bg-slate-800 justify-center md:justify-end">
                <button
                    type={props.type}
                    onClick={props.onClick}
                    className={"rounded-lg text-xl font-semibold bg-pink-700 hover:bg-pink-900 h-12 w-full text-center align-middle"}
                >
                    {props.text}
                </button>
            </div>
        </>
    )

}
