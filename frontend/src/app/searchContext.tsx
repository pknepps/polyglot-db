"use client";
/**
 * This module is responsible for creating the Search Context. It is used to 
 * manage the search query state across the application.
 * 
 * @author Dalton Rogers
 * @version 4/2/2025
 */

// import the needed libraries
import React, { createContext, useState, ReactNode } from "react";

// define the search context type
interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

// create the search context
export const SearchContext = createContext<SearchContextType | undefined>(undefined);

// create the search provider component
export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
            {children}
        </SearchContext.Provider>
    );
};