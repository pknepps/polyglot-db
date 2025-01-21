/**
 * This module is responsible for creating the left side scrollable
 * pane. This allows the user to scroll through the products.
 * 
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React from "react";
import "./left_side_pane.css";

/**
 * Creates the left side component.
 * 
 * @param param0 
 * @returns 
 */
export function LeftSide({children}:  {children: React.ReactNode} ) {
    return (
        <div className="left-side">
            {children}
        </div>
    );
}