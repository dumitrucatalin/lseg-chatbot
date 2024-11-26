"use server";
import path from "path";
import { promises as fs } from "fs";
import { StockExchangeData, StockExchange, Stock } from "@/types/chatbot";

// In-memory hash maps for quick data retrieval
let exchangeMap: Map<string, StockExchange> | null = null;
let stockMap: Map<string, Stock> | null = null;

// Function to load and initialize data
const initializeChatbotData = async (): Promise<void> => {
    if (exchangeMap && stockMap) return; // Already initialized

    const filePath = path.join(process.cwd(), "src/data/chatbot-stock-data.json");

    try {
        // Read and parse the JSON file
        const fileContents = await fs.readFile(filePath, "utf-8");
        const data: StockExchangeData = JSON.parse(fileContents);

        // Populate hash maps
        exchangeMap = new Map();
        stockMap = new Map();

        for (const exchange of data) {
            exchangeMap.set(exchange.stockExchange.toLowerCase(), exchange); // Use lowercase keys for case-insensitive matching
            for (const stock of exchange.topStocks) {
                stockMap.set(stock.stockName.toLowerCase(), stock); // Use lowercase keys for case-insensitive matching
            }
        }
    } catch (error) {
        console.error("Error initializing chatbot data:", error);
        throw new Error("Failed to initialize chatbot data");
    }
};

export const getStockExchangeList = async (): Promise<string[]> => {
    // Ensure hash maps are initialized
    await initializeChatbotData();

    return Array.from(exchangeMap!.values()).map((exchange) => exchange.stockExchange);
};

export const getChatbotResponse = async (input: string): Promise<{ response: string; options?: string[] }> => {
    try {
        //create delay for testing purposes
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Ensure hash maps are initialized
        await initializeChatbotData();

        const query = input.trim().toLowerCase();

        // Step 1: Handle "menu" or "main menu" commands
        if (query === "menu" || query === "main menu") {
            return {
                response: "Please select a Stock Exchange:",
                options: Array.from(exchangeMap!.values()).map((exchange) => exchange.stockExchange),
            };
        }

        // Step 2: Check if the input matches a stock exchange
        if (exchangeMap!.has(query)) {
            const matchedExchange = exchangeMap!.get(query)!; // Non-null assertion because we checked `has`
            return {
                response: `You selected ${matchedExchange.stockExchange}. Please select a stock:`,
                options: matchedExchange.topStocks.map((stock) => stock.stockName),
            };
        }

        // Step 3: Check if the input matches a stock
        if (stockMap!.has(query)) {
            const matchedStock = stockMap!.get(query)!; // Non-null assertion because we checked `has`
            return {
                response: `The stock price of ${matchedStock.stockName} (${matchedStock.code}) is ${matchedStock.price.toLocaleString()}.`,
                options: ["Main Menu", "Go Back"],
            };
        }

        // Step 4: No match found
        return {
            response: "Sorry, I couldn't find a match for your input. Please try again.",
            options: Array.from(exchangeMap!.values()).map((exchange) => exchange.stockExchange),
        };
    } catch (error) {
        console.error("Error processing chatbot response:", error);
        return { response: "An error occurred while processing your request. Please try again later." };
    }
};
