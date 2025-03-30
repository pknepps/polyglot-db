"use client";
import { DbName, RightSide } from "@/app/right_side_component";

export default function RightSideSingleProduct({ id }: { id: Promise<string> }) {
    return (
        <RightSide
            handleButtonClick={function (dbName: DbName): void {
                throw new Error("Function not implemented.");
            }}
        >
            hola mama!
        </RightSide>
    );
}
