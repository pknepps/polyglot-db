"use client";
/**
 * This module is responsible for creating the search context. It is used to keep 
 * track of what is present in the search bar.
 * 
 * @author Dalton Rogers
 * @version 3/3/2025
 */
import React, { createContext, useState, ReactNode } from "react";

/**
 * Interface for the search context props. searchQuery is the current search query string.
 * setSearchQuery is a function that sets the search query string.
 */
interface SearchContextProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

/**
 * Creates the context with default values.
 */
export const SearchContext = createContext<SearchContextProps>({
    searchQuery: "",
    setSearchQuery: () => {},
});

/**
 * Provides the search context to the children components.
 * @param children The children components.
 * @returns Search query state and setter function to children.
 */
export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
            {children}
        </SearchContext.Provider>
    );
};