"use client";
/**
 * This module is responsible for creating the right side component.
 * 
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React, { useState } from "react";
import "./right_side_component.css";

/**
 * Creates the right side component for the UI.
 * 
 * @returns The right side component.
 */
export function RightSide() {
  // initialize the use states
  const [message, setMessage] = useState<string>("");

  // handles button clicks, each display a different image
  const handleButtonClick = (dbName: string) => {
    switch (dbName){
      case "PostgreSQL": {
        setMessage("PostgreSQL button has been pressed.");
        break;
      }
      case "MongoDB": {
        setMessage("MongoDB button has been pressed.");
        break;
      }
      case "Neo4j": {
        setMessage("Neo4j button has been pressed.");
        break;
      }
      case "Redis": {
        setMessage("Redis button has been pressed.");
        break;
      }
    }
  }

  // the html for the right side
  return (
      <div className="right-side">
        <div className="buttons-container">
        <button onClick={() => handleButtonClick("PostgreSQL")}>PostgreSQL</button>
        <button onClick={() => handleButtonClick("MongoDB")}>MongoDB</button>
        <button onClick={() => handleButtonClick("Neo4j")}>Neo4j</button>
        <button onClick={() => handleButtonClick("Redis")}>Redis</button>
        </div>
        <div><br></br>The buttons will each eventually represent a graph when clicked.</div>
        {message && <p>{message}</p>}
      </div>
  );
}