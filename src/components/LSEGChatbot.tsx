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
    options?: string[]; // Optional options for the bot's response
}

const LSEGChatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState("");
    const [goBackInput, setGoBackInput] = useState("");
    const [exchanges, setExchanges] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);


    // Fetch initial data on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const exchanges = await getStockExchangeList();
                setExchanges(exchanges);
                setMessages([
                    { sender: "bot", text: "Hello! Welcome to LSEG. I'm here to help you." },
                    { sender: "bot", text: "Please select a Stock Exchange.", options: exchanges },
                ]);
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

    const addMessage = (sender: "user" | "bot", text: string, options?: string[]) => {
        setMessages((prev) => [...prev, { sender, text, options }]);
    };

    const setLastExchange = (userInput: string) => {
        // Find the first exchange that matches the user input partially
        const matchedExchange = exchanges.find((exchange) =>
            exchange.toLowerCase().includes(userInput.toLowerCase())
        );

        // Set the matched exchange or clear if no match is found
        if (matchedExchange) {
            setGoBackInput(matchedExchange);
        }

    };

    const handleInputSubmit = async () => {
        if (!userInput.trim()) return;

        let curedUserInput = userInput;

        setLastExchange(userInput);

        // Add user message
        addMessage("user", userInput);

        if (userInput.toLowerCase().includes("back")) {
            curedUserInput = goBackInput;
        }

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
        // Add user selection to chat
        addMessage("user", option);
        let curedUserInput = option;

        setLastExchange(option);
        if (option.toLowerCase().includes("back")) {
            curedUserInput = goBackInput;
        }
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
    };

    return (
        <div className="flex flex-col min-h-screen w-full" ref={chatContainerRef}>
            {/* Sticky Header */}
            <header className="sticky top-0 w-full text-center text-white bg-blue-600 py-2 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Image src="/chatbot-icon.svg" alt="Robot" width={40} height={40} />
                    <h1 className="text-lg font-bold">LSEG chatbot</h1>
                </div>
                <DarkModeToggle />
            </header>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 w-full bg-gray-100">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${message.sender === "bot" ? "text-left flex flex-col" : "text-right"}`}
                    >
                        {message.sender === "bot" && (
                            <div className="flex items-start space-x-4">
                                {/* Robot Image */}
                                <div className="shrink-0">
                                    <Image src="/chatbot-icon-blue.svg" alt="Robot" width={40} height={40} />
                                </div>

                                {/* OptionsList or Bot Message */}
                                <div className="flex-1">
                                    {message.options ? (
                                        <OptionsList
                                            options={message.options}
                                            text={message.text}
                                            onSelect={handleOptionSelect}
                                        />
                                    ) : (
                                        <div className="bg-blue-500 text-white inline-block p-3 rounded-lg">
                                            {message.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* User Message */}
                        {message.sender === "user" && (
                            <div className="bg-gray-300 text-black inline-block p-3 rounded-lg">
                                {message.text}
                            </div>
                        )}
                    </div>
                ))}
                {/* Show Loading Spinner */}
                {loading && (
                    <div className="flex justify-center items-center p-2">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            {/* Sticky Input Bar */}
            <footer className="sticky bottom-0 bg-white w-full border-t border-gray-300 p-4 flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleInputSubmit(); // Submit the message when Enter is pressed
                        }
                    }}
                />
                <button
                    onClick={handleInputSubmit}
                    className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={!userInput}
                >
                    <FaPaperPlane />
                </button>
            </footer>
        </div>
    );
};

export default LSEGChatbot;