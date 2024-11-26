"use client";

import { useEffect, useRef, useState } from "react";
import DarkModeToggle from "./DarkModeToggle";
import OptionsList from "./OptionList";
import Image from "next/image";
import { FaPaperPlane } from "react-icons/fa";
import { getChatbotResponse, getStockExchangeList } from "@/actions/chatbot";

interface Message {
    sender: "user" | "bot";
    text: string;
    options?: string[];
}

const LSEGChatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState("");
    const [goBackInput, setGoBackInput] = useState(""); // Track the last valid input for "Go Back"
    const [currentOptions, setCurrentOptions] = useState<string[]>([]);
    const [suggestion, setSuggestion] = useState(""); // Track autocomplete suggestion
    const [loading, setLoading] = useState(false);
    const [exchanges, setExchanges] = useState<string[]>([]);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Fetch initial data on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const exchanges = await getStockExchangeList();
                setMessages([
                    { sender: "bot", text: "Hello! Welcome to LSEG. I'm here to help you." },
                    { sender: "bot", text: "Please select a Stock Exchange.", options: exchanges },
                ]);
                setCurrentOptions(exchanges); // Set exchanges as the initial options
                setExchanges(exchanges); // Set exchanges as the initial options
            } catch (error) {
                console.error("Failed to load initial data:", error);
                setMessages([
                    { sender: "bot", text: "Hello! Welcome to LSEG. I'm here to help you." },
                    { sender: "bot", text: "Sorry, we could not load stock exchanges. Please try again later." },
                ]);
            }
        };

        fetchInitialData();
    }, []);

    // Scroll to the bottom when messages change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
        }
    }, [messages]);

    // Update suggestion whenever user input changes
    useEffect(() => {
        if (userInput) {
            const match = currentOptions.find((option) =>
                option.toLowerCase().startsWith(userInput.toLowerCase())
            );
            setSuggestion(match || ""); // Set suggestion or clear it
        } else {
            setSuggestion(""); // Clear suggestion if input is empty
        }
    }, [userInput, currentOptions]);

    const addMessage = (sender: "user" | "bot", text: string, options?: string[]) => {
        setMessages((prev) => [...prev, { sender, text, options }]);
        setCurrentOptions(options || []); // Update current options for autocomplete
        setSuggestion(""); // Clear the suggestion
    };

    const setLastExchange = (input: string) => {
        // Find the first option that matches the user input partially
        const matchedExchange = exchanges.find((exchange) =>
            exchange.toLowerCase().includes(input.toLowerCase())
        );
        if (matchedExchange) {
            setGoBackInput(matchedExchange); // Save the matched input for "Go Back"
        }
    };

    const handleInputSubmit = async () => {
        if (!userInput.trim()) return;

        let curedUserInput = userInput.trim();

        if (userInput.toLowerCase().includes("back")) {
            curedUserInput = goBackInput; // Use the saved "Go Back" input
        } else {
            setLastExchange(userInput); // Save the current input as a valid input for "Go Back"
        }

        // Add user message
        addMessage("user", userInput);

        setLoading(true); // Start loading spinner

        try {
            // Get server-side response
            const { response, options } = await getChatbotResponse(curedUserInput);

            // Add bot response
            addMessage("bot", response, options);
        } catch (error) {
            console.error("Error:", error);
            addMessage("bot", "Something went wrong. Please try again.");
        } finally {
            setLoading(false); // Stop loading spinner
        }

        setUserInput(""); // Clear input
    };

    const handleOptionSelect = async (option: string) => {
        addMessage("user", option);
        setLastExchange(option); // Save the selected option for "Go Back"

        setLoading(true);

        try {
            const { response, options } = await getChatbotResponse(option);
            addMessage("bot", response, options);
        } catch (error) {
            console.error("Error:", error);
            addMessage("bot", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Tab" && suggestion) {
            e.preventDefault(); // Prevent default tab behavior
            setUserInput(suggestion); // Autocomplete input
        } else if (e.key === "Enter") {
            handleInputSubmit();
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full" ref={chatContainerRef}>
            {/* Sticky Header */}
            <header className="sticky top-0 w-full text-center text-white bg-lseg-blue py-2 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Image src="/chatbot-icon.svg" alt="Robot" width={40} height={40} />
                    <h1 className="text-lg font-bold">LSEG chatbot</h1>
                </div>
                <DarkModeToggle />
            </header>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 w-full">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${message.sender === "bot" ? "text-left flex flex-col" : "text-right"}`}
                    >
                        {message.sender === "bot" && (
                            <div className="flex items-end space-x-4">
                                <div className="shrink-0">
                                    <Image src="/chatbot-icon-blue.svg" alt="Robot" width={40} height={40} />
                                </div>
                                <div className="flex-1">
                                    {message.options ? (
                                        <OptionsList
                                            options={message.options}
                                            text={message.text}
                                            onSelect={handleOptionSelect}
                                        />
                                    ) : (
                                        <div className="bg-lseg-blue text-white inline-block p-3 rounded-lg">
                                            {message.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {message.sender === "user" && (
                            <div className="bg-gray-300 text-black inline-block p-3 rounded-lg">
                                {message.text}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-center items-center p-2">
                        <div className="w-6 h-6 border-4 border-lseg-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            <footer className="sticky bottom-0 bg-white dark:bg-[#232323] w-full border-t border-gray-300 p-4 flex items-center space-x-4">
                <div className="relative flex-1 align-center">
                    {suggestion && (
                        <div className="left-0 top-full m-1 text-gray-500">
                            Autocomplete: {suggestion} {'(*Press Tab to select)'}
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                </div>
                <button
                    onClick={handleInputSubmit}
                    className="py-2 px-4 bg-lseg-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={!userInput}
                >
                    <FaPaperPlane />
                </button>
            </footer>
        </div>
    );
};

export default LSEGChatbot;
