"use client";
/**
 * This module is responsible for creating the selected db Context. It is used to 
 * manage the selected db query state across the application.
 * 
 * @author Kevin McCall
 * @version 4/9/2025
 */

// import the needed libraries
import React, { createContext, useState, ReactNode } from "react";
import { DbName } from "./enums";


// define the selected db context type
interface SelectedDbType {
    selectedDb: DbName;
    setSelectedDb: (dbName: DbName) => void;
}

// create the selected db context
export const SelectedDbContext = createContext<SelectedDbType>({selectedDb: DbName.postgres, setSelectedDb: () => {}});

// create the selected db provider component
export const SelectedDbProvider = ({ children }: { children: ReactNode }) => {
    const [selectedDb, setSelectedDb] = useState(DbName.postgres);

    function testSelectedDb(dbName: DbName) {
        console.log(dbName);
        setSelectedDb(dbName);
    }

    return (
        <SelectedDbContext.Provider value={{ selectedDb, setSelectedDb: testSelectedDb }}>
            {children}
        </SelectedDbContext.Provider>
    );
};