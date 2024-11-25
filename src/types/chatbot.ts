// Define a type for individual stock
export type Stock = {
    code: string;       // Unique identifier for the stock
    stockName: string;  // Full name of the stock
    price: number;      // Current price of the stock
};

// Define a type for stock exchanges
export type StockExchange = {
    code: string;               // Unique identifier for the stock exchange
    stockExchange: string;      // Full name of the stock exchange
    topStocks: Stock[];         // List of top stocks on this exchange
};

// Define a type for the entire JSON dataset
export type StockExchangeData = StockExchange[];