"use client";
import React, { useState, useEffect, useContext } from "react";
import { getProducts } from "@/app/request";
import { Product } from "../../../backend/app/src/interfaces";
import { SearchContext } from "./searchContext";
import ProductLayout from "./product/[id]/page";
import "./left_side.css";

/**
 * Creates the left side component.
 *
 * @param param0
 * @returns
 */
export function LeftSide({ children }: { children: React.ReactNode }) {
    return <div className="left-side-container bg-stone-100 w-full h-screen p-8">{children}</div>;
}
