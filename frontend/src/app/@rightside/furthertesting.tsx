"use client";

import { use } from "react";

export default function PromiseEater({ promise }: { promise: Promise<any> }) {
    const data = use(promise);
    return <div>{JSON.stringify(data)}</div>;
}
