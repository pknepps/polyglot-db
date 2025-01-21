"use client"
/**
 * This module is responsible for creating the Header bar. It consists of a 
 * home button, a me button, a search box, and a login button.
 * 
 * @Author Dalton Rogers
 * @Version 11/26/2024
 */

import React, { useState } from "react";
import "./header.css";
import Image from "next/image";
import {getUser} from "@/app/request";
import { User } from "../../../backend/app/src/interfaces";

/**
 * Creates the header component for the UI.
 * 
 * @returns The header component.
 */
export function Header(){
    // intialize the use states
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [error, setError] = useState("");

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

    // close the user info modal  
    const closeUserInfoModal = () => {
      setIsUserInfoModalOpen(false);
    };

    // this is what happens when the user tries to sign in
    const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const user = await getUser(username);
        if (user != null) {
          setCurrentUser(user);
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
      setUsername("");
    }

    // the html for the header
    return (
        <header className="header">
          <div className="header-buttons">
            <button className="header-button">Home</button>
            {currentUser ? (
              <button className="header-button" onClick={openUserInfoModal}>
                {currentUser.username}
              </button>
            ) : (
              <button className="header-button" onClick={openUserInfoModal}>Me</button>
            )}
          </div>
          <div className="header-search">
            <button className="search-button">
              <Image src="/search_icon.png" alt="Search" width={20} height={20}></Image>
            </button>
            <input type="text" className="search-bar" placeholder="Search Products..." />
          </div>
          <div className="header-buttons">
            {currentUser ? (
              <>
                <button className="header-button" onClick={handleSignOut}>
                  Log-Out
                </button>
              </>
            ) : (
              <button className="header-button" onClick={openLoginModal}>
                Log-In
              </button>
            )}
          </div>

          {isUserInfoModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Account Information</h3>
                {currentUser ? (
                  <>
                    <p><strong>Full Name: </strong>{currentUser.firstName} {currentUser.lastName}</p>
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
                <button onClick={closeUserInfoModal}>Close</button>
              </div>
            </div>
          )}
          {isLoginModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Sign In</h2>
                <form onSubmit={handleSignIn}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                <button type="submit">Sign In</button>
              </form>
              {error && <p className="error-message">{error}</p>}
              <button onClick={closeLoginModal}>Close</button>
            </div>
          </div>
        )}
      </header>
    );
}
