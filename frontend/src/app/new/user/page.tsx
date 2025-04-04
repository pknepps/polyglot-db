"use client";
import { useState } from "react";
import { createUser } from "@/app/request"; // Adjust the import path as needed

export default function CreateUserPage() {
    const [username, setUsername] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Create the user object
        const userData = {
            username,
            firstname,
            lastname,
        };

        try {
            const response = await createUser(userData); // Call the API to create a user
            setMessage("User created successfully!");
            setUsername("");
            setFirstname("");
            setLastname("");
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="page-container2">
            <h1 className="page-title2">Create User</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-lg font-medium text-gray-700">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
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
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                        placeholder="Enter last name"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn2 btn2-blue"
                >
                    Submit
                </button>
            </form>
            {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        </div>
    );
}