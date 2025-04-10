"use client";
/**
 * This module is responsible for creating the Search Context. It is used to 
 * manage the search query state across the application.
 * 
 * @author Dalton Rogers
 * @author Preston Knepper
 * @version 4/10/2025
 */

// import the needed libraries
import React, { createContext, useState, ReactNode } from "react";

// define the search context type
interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

interface CurrentSelectionContextType {
    currentUsername: string, 
    setCurrentUsername: React.Dispatch<React.SetStateAction<string>>,
    currentProductId: string, 
    setCurrentProductId: React.Dispatch<React.SetStateAction<string>>,
}

// create the search context
export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const CurrentSelectionContext = createContext<CurrentSelectionContextType | undefined>(undefined)

// create the search provider component
export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
            {children}
        </SearchContext.Provider>
    );
};

export function CurrentSelectionProvider({ children }: {children: ReactNode}) {
    const [currentUsername, setCurrentUsername] = useState<string>('');
    const [currentProductId, setCurrentProductId] = useState<string>('');

    const currentSelection: CurrentSelectionContextType = {
        currentUsername, 
        setCurrentUsername,
        currentProductId, 
        setCurrentProductId,
    }

    return <CurrentSelectionContext.Provider value={currentSelection}>
        {children}
    </CurrentSelectionContext.Provider>
}