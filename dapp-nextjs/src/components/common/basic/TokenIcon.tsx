import Image from "next/image";

interface Props {
    logoUri: string,
    name: string
}
export default function TokenIcon({logoUri, name}: Props) {

    // border-8 border-black
    return (
        <Image alt={name} src={logoUri} height={34} width={34} className={"rounded-full"}/>
    )

}