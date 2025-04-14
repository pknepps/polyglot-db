"use client";
/**
 * This is a client component that allows the user to create a new user.
 * It includes a form with fields for the username, first name, and last name.
 *
 * @author Dalton Rogers
 * @version 4/3/25
 */

import { useState } from "react";
import { checkUsernameAvailability, createUser } from "@/app/request";
import { Card } from "@/app/components";
import "@/app/globals.css";

/**
 * Used to create a new user.
 *
 * @returns A form that allows the user to create a new user.
 */
export default function CreateUserPage() {
    const [username, setUsername] = useState("");
    const [firstName, setFirstname] = useState("");
    const [lastName, setLastname] = useState("");
    const [message, setMessage] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);

    // check if the username is available
    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length >= 50) {
            setMessage("Username must be less than 50 characters.");
            return;
        }
        setUsername(value);

        if (value.trim() === "") {
            setUsername("");
            setIsUsernameAvailable(true);
            setMessage("");
            return;
        }

        setIsChecking(true);
        try {
            const exists = await checkUsernameAvailability(value);
            setIsUsernameAvailable(!exists);
            setMessage(exists ? "This username is already taken." : "This username is available.");
        } catch (error) {
            setMessage("Error checking username availability.");
        } finally {
            setIsChecking(false);
        }
    };

    // handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isUsernameAvailable) {
            setMessage("Please choose a different username.");
            return;
        }

        if (username.length >= 50 || firstName.length >= 50 || lastName.length >= 50) {
            setMessage("All fields must be less than 50 characters.");
            return;
        }

        // create the user object
        const userData = {
            username,
            first: firstName,
            last: lastName,
        };

        try {
            const response = await createUser(userData);
            setMessage(`User ${username} created successfully!`);
            setUsername("");
            setFirstname("");
            setLastname("");
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <Card>
            <div className="page-header2">
                <h1 className="page-title2">User</h1>
                <p className="page-subtitle2">Enter user details below:</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-lg font-medium text-gray-700">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                        maxLength={50}
                        className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                        placeholder="Enter username"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="firstname" className="block text-lg font-medium text-gray-700">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstname"
                        value={firstName}
                        onChange={(e) => {
                            if (e.target.value.length < 50) setFirstname(e.target.value);
                        }}
                        maxLength={50}
                        className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                        placeholder="Enter first name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="lastname" className="block text-lg font-medium text-gray-700">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastname"
                        value={lastName}
                        onChange={(e) => {
                            if (e.target.value.length < 50) setLastname(e.target.value);
                        }}
                        maxLength={50}
                        className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                        placeholder="Enter last name"
                        required
                    />
                </div>
                <button type="submit" className="btn2 btn2-blue">
                    Submit
                </button>
            </form>
            {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        </Card>
    );
}
