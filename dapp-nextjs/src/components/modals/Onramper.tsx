import OnramperWidget from "@onramper/widget";

export default function Onramper() {
    return (
        <>
        <div
        style={{
            width: "440px",
            height: "595px",
            boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            margin: "auto"
        }}>
        <OnramperWidget
            defaultAmount={50}
            defaultFiat = "USD"
            API_KEY="pk_test_eu92eCNlBbOhGlyQ3qOojn9ELvZMHkoVqtTZxAknRlE0"
            filters={{
                onlyCryptos: ["USDC"]
            }}

        />
        </div>
        </>
    )

}