"use client";
/**
 * This module is responsible for creating the Header bar. It consists of a
 * home button, a me button, a search box, and a login button.
 *
 * @Author Dalton Rogers
 * @Version 11/26/2024
 */

import React, { useContext, useState, Context } from "react";
import "./header.css";
import { getUser } from "@/app/request";
import { User } from "../../../backend/app/src/interfaces";
import { Modal } from "./components";
import { useRouter } from "next/navigation";
import { SearchContext, CurrentSelectionContext } from "./context";

/**
 * Creates the header component for the UI.
 *
 * @returns The header component.
 */
export function Header() {
    // intialize the use states
    const router = useRouter();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [error, setError] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const searchContext = useContext(SearchContext);
    const currentSelectionContext = useContext(CurrentSelectionContext);

    if (!searchContext || !currentSelectionContext) {
        throw new Error("context is not provided. Ensure it is wrapped in a provider.");
    }

    const { setCurrentUsername } = currentSelectionContext;
    const { setSearchQuery } = searchContext;

    // open the login modal
    const openLoginModal = () => {
        setIsLoginModalOpen(true);
        setError("");
    };

    // close the login modal
    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
        setUsername("");
        setError("");
    };

    // open the user info modal
    const openUserInfoModal = () => {
        setIsUserInfoModalOpen(true);
    };

    // this is what happens when the user tries to sign in
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await getUser(username);
            if (user != null) {
                setCurrentUser(user);
                setCurrentUsername(user.username)
                closeLoginModal();
            } else {
                setError("User not found. Try again.");
            }
        } catch (e) {
            console.error("Error occured during sign-in", e);
            setError("Error occured signing in. Try again.");
        }
    };

    // resets the user when they sign out
    const handleSignOut = () => {
        setCurrentUser(null);
        setCurrentUsername('');
        setUsername("");
    };

    // sets the search query when the user types in the search bar
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        setSearchQuery(value);

        // redirect to home page if the search bar is empty
        if (value.trim() === "") {
            router.push("/"); 
        }
    };

    // this is what happens when the user clicks the home button
    const handleHomeClick = () => {
        setSearchQuery(""); 
        setSearchInput("");
        router.push("/"); 
    };

    // this is what happens when the user clicks the new button
    const handleNewPageClick = () => {
        router.push("/new");
    };

    // the html for the header
    return (
        <header className="bg-sky-600 flex flex-row justify-between align-middle py-2 px-4">
            <div className="header-buttons">
                <button className="btn" onClick={handleHomeClick}>
                    Home
                </button>
                <button className="btn" onClick={handleNewPageClick}>
                    Add Data
                </button>
                {currentUser ? (
                    <button className="btn" onClick={openUserInfoModal}>
                        {currentUser.username}
                    </button>
                ) : (
                    <button className="btn" onClick={openUserInfoModal}>
                        Me
                    </button>
                )}
            </div>
            <div className="header-search flex align-middle">
                <button className="hover:bg-black rounded-full">
                    <svg
                        className="w-8 h-8 stroke-white"
                        data-slot="icon"
                        fill="none"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        ></path>
                    </svg>
                </button>

                <input
                    type="text"
                    className="search-bar w-s lg:w-md"
                    placeholder="Search Products..."
                    value={searchInput}
                    onChange={handleSearch}
                />
            </div>
            <div className="header-buttons">
                {currentUser ? (
                    <>
                        <button className="btn" onClick={handleSignOut}>
                            Log-Out
                        </button>
                    </>
                ) : (
                    <button className="btn" onClick={openLoginModal}>
                        Log-In
                    </button>
                )}
            </div>

            <Modal isDisplayed={isUserInfoModalOpen} onClose={() => setIsUserInfoModalOpen(false)}>
                <h3 className="font-bold text-lg text-center">Account Information</h3>
                {currentUser ? (
                    <>
                        <p>
                            <strong>Full Name: </strong>
                            {currentUser.firstName} {currentUser.lastName}
                        </p>
                        {currentUser.addresses && currentUser.addresses.length > 0 ? (
                            <ul>
                                {currentUser.addresses.map((address, index) => (
                                    <li key={index}>
                                        <strong>Address {index + 1}: </strong>
                                        {address.address}, {address.city}, {address.state} {address.zip}.
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No Addresses Available</p>
                        )}
                    </>
                ) : (
                    <p>Log-In for Account Details</p>
                )}
            </Modal>

            <Modal isDisplayed={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
                <h2 className="font-bold text-lg text-center">Log In</h2>
                <form onSubmit={handleSignIn}>
                    <label htmlFor="username" className="text-gray-500">
                        Username:
                    </label>
                    <input
                        className="bg-sky-600/50 rounded px-2 py-2 mb-4"
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <div className="flex flex-row justify-items-center">
                        <button
                            className="outline-1 w-40 rounded-2xl inline-block hover:bg-stone-200 active:bg-stone-600 active:text-white"
                            type="submit"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
                {error && <p className="error-message">{error}</p>}
            </Modal>
        </header>
    );
}
