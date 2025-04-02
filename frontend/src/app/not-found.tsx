import Link from "next/link";

export default function NotFound() {
    return (
        <div>
            <h2 className="font-bold text-2xl">Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href="/" className="text-slate-800 bg-stone-200 rounded-m">
                Return Home
            </Link>
        </div>
    );
}
